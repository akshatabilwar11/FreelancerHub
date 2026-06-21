import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, DollarSign, User, Briefcase, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import projectService from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import DeadlineTimer from '../components/common/DeadlineTimer';
import './Projects.css';

const ProjectCard = ({ project, onDelete }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isOwner = user?.id == project.clientId;
  const isAdmin = user?.roles?.some(r => r.includes('ADMIN'));

  return (
    <div className="pub-project-card glass-panel">
      <div className="pub-card-top">
        <div className="pub-card-icon">
          <Briefcase size={20} />
        </div>
        <div className="pub-card-badges">
          <span className={`pub-badge status-${project.status?.toLowerCase()}`}>
            {project.status === 'PENDING' ? t('status_pending') : 
             project.status === 'ACTIVE' ? t('status_active') : 
             project.status || t('status_open')}
          </span>
          {(isOwner || isAdmin) && (
            <button className="delete-badge-btn" onClick={() => onDelete(project.id)} title="Delete Project">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <h3 className="pub-card-title">{project.title}</h3>
      <p className="pub-card-desc">{project.description}</p>
      <div className="pub-card-footer">
        <span className="pub-budget">
          ₹ {project.budget?.toLocaleString('en-IN')}
        </span>
        {project.createdAt && (
          <span className="pub-date" title={new Date(project.createdAt).toLocaleString()}>
            <Clock size={12} /> {new Date(project.createdAt).toLocaleDateString('en-IN', { 
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </span>
        )}
        <span className="pub-client">
          <User size={14} /> {isOwner ? t('you_owner') : `${t('client_prefix')}${project.clientId}`}
        </span>
        {project.deadline && <DeadlineTimer deadline={project.deadline} />}
      </div>
      <Link to={`/projects/${project.id}`} className="btn btn-primary pub-apply-btn">{t('view_details')}</Link>
    </div>
  );
};

const Projects = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  // Sync search state with URL query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q) setSearch(q);
  }, [location.search]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getAllProjects();
        // Handle paginated response from Spring Boot (Page object)
        const projectsList = data.content || data;
        
        if (Array.isArray(projectsList)) {
          setProjects(projectsList);
          setFiltered(projectsList);
        } else {
          setProjects([]);
          setFiltered([]);
        }
      } catch (err) {
        console.error('Failed to load projects.', err);
        setProjects([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    let results = projects;
    if (search.trim()) {
      results = results.filter(
        p =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (maxBudget) {
      results = results.filter(p => p.budget <= parseFloat(maxBudget));
    }
    setFiltered(results);
  }, [search, maxBudget, projects]);

    const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(id);
        setProjects(projects.filter(p => p.id !== id));
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  return (
    <div className="projects-page animate-fade-in">
      {/* Hero banner */}
      <div className="projects-hero">
        <div className="container">
          <h1 className="projects-hero-title">
            {t('browse')} <span className="text-gradient">{t('open_projects')}</span>
          </h1>
          <p className="projects-hero-sub">
            {t('find_perfect_project')}
          </p>
        </div>
      </div>

      <div className="container projects-body">
        {/* Filters bar */}
        <div className="filters-bar glass-panel">
          <div className="filter-search">
            <Search size={18} className="filter-icon" />
            <input
              id="project-search"
              type="text"
              placeholder={t('search_projects_placeholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-budget">
            <SlidersHorizontal size={18} className="filter-icon" />
            <input
              id="budget-filter"
              type="number"
              placeholder={t('max_budget')}
              value={maxBudget}
              onChange={e => setMaxBudget(e.target.value)}
              className="filter-input"
            />
          </div>
          <span className="filter-count">{filtered.length} {filtered.length === 1 ? t('result') : t('results')}</span>
        </div>

        {/* Project grid */}
        {loading ? (
          <div className="projects-loading">
            <span className="spinner"></span> {t('loading_projects')}
          </div>
        ) : filtered.length === 0 ? (
          <div className="projects-empty glass-panel">
            <Briefcase size={48} />
            <p>{projects.length === 0 ? t('no_projects_available') : t('no_projects_match')}</p>
          </div>
        ) : (
          <div className="pub-projects-grid">
            {filtered.map(project => (
              <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
