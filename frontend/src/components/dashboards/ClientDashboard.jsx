import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Plus, Briefcase, Users, TrendingUp, Search, MessageSquare, Trash2, CheckCircle, Star, Mail, User as UserIcon } from 'lucide-react';
import projectService from '../../services/projectService';
import paymentService from '../../services/paymentService';
import userService from '../../services/userService';
import OnlineStatus from '../common/OnlineStatus';
import AvailabilityBadge from '../common/AvailabilityBadge';
import TrustScore from '../common/TrustScore';
import ContactModal from '../ContactModal';
import PaymentModal from '../PaymentModal';
import '../../pages/Dashboard.css';

const ClientDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [activeHires, setActiveHires] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', budget: '' });
  const [projectToActivate, setProjectToActivate] = useState(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const pData = await projectService.getProjectsByClient(user.id);
      setProjects(pData);
      
      const hires = await projectService.getActiveHiresCount(user.id);
      setActiveHires(hires);

      const projectIds = pData.map(p => p.id);
      if (projectIds.length > 0) {
        const spent = await paymentService.getProjectsSpent(projectIds);
        setTotalSpent(spent);
      }

      try {
        const usersList = await userService.getAllUsers();
        const freelancersList = usersList.filter(u => u.role === 'FREELANCER' || !u.role);
        
        const updatedFreelancers = await Promise.all(
          freelancersList.map(async (f) => {
            try {
              const availability = await projectService.getFreelancerAvailability(f.id);
              return { ...f, availability };
            } catch (err) {
              return { ...f, availability: 'AVAILABLE' };
            }
          })
        );
        setFreelancers(updatedFreelancers);
      } catch (err) {
        console.error('Client: Failed to fetch freelancers data', err);
        setFreelancers([
          { id: 1, name: 'Amit Sharma', role: 'Full Stack Dev', rating: 4.8, location: 'Bangalore', availability: 'AVAILABLE', trustScore: 95 },
          { id: 2, name: 'Priya Singh', role: 'UI/UX Designer', rating: 4.9, location: 'Mumbai', availability: 'BUSY', trustScore: 92 },
          { id: 3, name: 'Rahul Verma', role: 'Content Writer', rating: 4.5, location: 'Delhi', availability: 'OVERLOADED', trustScore: 85 }
        ]);
      }
    } catch (err) {
      console.error('Client: Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const newProject = await projectService.createProject({
        ...formData,
        budget: parseFloat(formData.budget),
        clientId: user.id,
        status: 'PENDING'
      });
      setProjects([newProject, ...projects]);
      setShowForm(false);
      setFormData({ title: '', description: '', budget: '' });
    } catch (err) {
      alert('Failed to create project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(id);
        setProjects(projects.filter(p => p.id != id));
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  return (
    <div className="client-dashboard">
      <div className="dashboard-hero client-hero">
        <div className="hero-content">
          <h1>Find the Best Talent</h1>
          <p>Post a project and hire top-rated freelancers around the globe.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={20} /> Create New Project
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-widget">
          <div className="stat-widget-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}><Briefcase size={24} /></div>
          <div><p className="stat-widget-label">My Projects</p><h3 className="stat-widget-value">{projects.length}</h3></div>
        </div>
        <div className="stat-widget">
          <div className="stat-widget-icon" style={{ background: '#fdf2f8', color: '#ec4899' }}><Users size={24} /></div>
          <div><p className="stat-widget-label">Active Hires</p><h3 className="stat-widget-value">{activeHires}</h3></div>
        </div>
        <div className="stat-widget">
          <div className="stat-widget-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><TrendingUp size={24} /></div>
          <div><p className="stat-widget-label">Spent</p><h3 className="stat-widget-value">₹{totalSpent.toLocaleString()}</h3></div>
        </div>
      </div>

      {showForm && (
        <div className="create-form animate-slide-up">
          <h2>Project Details</h2>
          <form onSubmit={handleCreateProject} className="project-form">
            <div className="form-group">
              <label>Title</label>
              <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="form-input-dash" placeholder="e.g. Website Redesign" />
            </div>
            <div className="form-group">
              <label>Budget (₹)</label>
              <input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="form-input-dash" placeholder="5000" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="form-input-dash" rows="3" placeholder="Describe the requirements..."></textarea>
            </div>
            <div className="pf-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Publish Project</button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-grid">
        <section className="client-main-section">
          <div className="section-header">
            <h2>Top Freelancers</h2>
            <Link to="/freelancers" className="link-text">Browse All</Link>
          </div>
          <div className="project-grid-dash">
            {freelancers.slice(0, 4).map(f => (
              <div key={f.id} className="project-card-glass freelancer-card-dash animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="stat-widget-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', width: '48px', height: '48px', borderRadius: '12px' }}>
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{f.name}</h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{f.role || 'Professional Freelancer'}</p>
                    </div>
                  </div>
                  <div className="freelancer-rating" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: '#f59e0b', fontWeight: 600 }}>
                    <Star size={16} fill="currentColor" /> {f.rating || '4.5'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', margin: '4px 0' }}>
                  <OnlineStatus isOnline={f.online} />
                  <AvailabilityBadge status={f.availability || 'AVAILABLE'} />
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <TrustScore score={f.trustScore || 88} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.location || 'Remote'}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedFreelancer(f)}>
                      Contact
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/freelancers/${f.id}`)}>
                      Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="dashboard-sidebar-content">
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
            <div className="section-header" style={{ marginBottom: '1rem' }}>
              <h3>Your Projects</h3>
              <Link to="/projects" className="link-text" style={{ fontSize: '0.85rem' }}>Manage All</Link>
            </div>
            <div className="project-list-dash" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {projects.length > 0 ? (
                projects.map(p => (
                  <div key={p.id} className="project-card-mini" style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <div className="pcm-info">
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{p.title}</h4>
                      <div className="pcm-meta" style={{ marginTop: '4px' }}>
                        <span className="pcm-budget" style={{ fontSize: '0.85rem' }}>₹{p.budget?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="pcm-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', justifyContent: 'space-between' }}>
                      {p.status === 'PENDING' ? (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}
                          onClick={() => setProjectToActivate(p)}
                        >
                          Activate
                        </button>
                      ) : (
                        <span className={`status-badge ${p.status?.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 6px' }}>{p.status}</span>
                      )}
                      <button className="icon-btn delete-btn-dash" onClick={() => handleDeleteProject(p.id)} title="Delete Project" style={{ padding: '4px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', margin: '20px 0' }}>No projects created yet.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {projectToActivate && (
        <PaymentModal 
          project={projectToActivate} 
          onClose={() => setProjectToActivate(null)}
          onActivated={() => {
            setProjectToActivate(null);
            fetchData();
          }}
        />
      )}

      {selectedFreelancer && (
        <ContactModal 
          freelancer={selectedFreelancer} 
          onClose={() => setSelectedFreelancer(null)} 
        />
      )}
    </div>
  );
};

export default ClientDashboard;
