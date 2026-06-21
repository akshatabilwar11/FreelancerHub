import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import './Home.css';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getAllProjects();
        // Handle paginated response from Spring Boot (Page object)
        const projectsList = data.content || data;
        
        if (Array.isArray(projectsList) && projectsList.length > 0) {
          // Filter to show available projects (e.g., OPEN or ACTIVE, or just all real projects)
          // Sort by newest first assuming higher ID or createdAt means newer
          const sortedProjects = [...projectsList].sort((a, b) => b.id - a.id);
          setFeaturedProjects(sortedProjects.slice(0, 3));
        } else {
          setFeaturedProjects([]);
        }
      } catch (error) {
        console.error('Failed to load featured projects.', error);
        setFeaturedProjects([]);
      }
    };
    fetchProjects();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content animate-slide-up">
            <h1 className="hero-title">
              Find the perfect <span className="text-gradient">freelance</span> talent for your business
            </h1>
            <p className="hero-subtitle">
              Connect with top experts for any project, from web development to graphic design and everything in between.
            </p>
            
            <form onSubmit={handleSearch} className="search-bar-wrap">
              <div className="search-input-group">
                <Search className="search-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="What service are you looking for today?" 
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary search-btn">Search</button>
            </form>
          </div>
          
          <div className="hero-visual animate-fade-in">
            <div className="main-image-wrapper">
              <img src="/assets/images/hero.png" alt="Freelancers working" className="floating-image" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="featured-section section-padding">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Projects</h2>
            <button onClick={() => navigate('/projects')} className="btn-text">
              View All <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="projects-grid">
            {featuredProjects.map(project => (
              <div key={project.id} className="project-card card-glass animate-fade-in">
                <div className="project-tag">{project.category || 'Featured'}</div>
                <h3 className="project-card-title">{project.title}</h3>
                <p className="project-card-budget">Budget: ₹{project.budget.toLocaleString('en-IN')}</p>
                <button 
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="btn btn-outline btn-full"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>


      <footer className="footer">
        <p>&copy; 2026 FreelencerHub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
