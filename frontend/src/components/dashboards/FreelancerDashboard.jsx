import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Send, DollarSign, Award, Star, Clock } from 'lucide-react';
import projectService from '../../services/projectService';
import paymentService from '../../services/paymentService';
import SkillBar from '../common/SkillBar';
import FileUploader from '../common/FileUploader';
import TrustScore from '../common/TrustScore';
import '../../pages/Dashboard.css';

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [availableProjects, setAvailableProjects] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalProjects, setTotalProjects] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pData = await projectService.getAllProjects();
        const projectsList = pData.content || pData;
        const total = pData.totalElements !== undefined ? pData.totalElements : (Array.isArray(projectsList) ? projectsList.length : 0);
        setTotalProjects(total);
        if (Array.isArray(projectsList)) {
            setAvailableProjects(projectsList.slice(0, 5));
        } else {
            setAvailableProjects([]);
        }

        const eData = await paymentService.getFreelancerEarnings(user.id);
        setEarnings(eData);
      } catch (err) {
        console.error('Freelancer: Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  return (
    <div className="freelancer-dashboard">
      <div className="dashboard-hero freelancer-hero">
        <div className="hero-content">
          <h1>Welcome, {user.name}!</h1>
          <p>You have {totalProjects} new project{totalProjects !== 1 ? 's' : ''} matching your skills. Start bidding now!</p>
          <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
            <TrustScore score={user.trustScore || 95} />
          </div>
          <Link to="/projects" className="btn btn-primary">
            <Search size={20} /> Browse Projects
          </Link>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-widget">
          <div className="stat-widget-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><DollarSign size={24} /></div>
          <div><p className="stat-widget-label">Earnings</p><h3 className="stat-widget-value">₹{earnings.toLocaleString()}</h3></div>
        </div>
        <div className="stat-widget">
          <div className="stat-widget-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><Send size={24} /></div>
          <div><p className="stat-widget-label">Active Bids</p><h3 className="stat-widget-value">5</h3></div>
        </div>
        <div className="stat-widget">
          <div className="stat-widget-icon" style={{ background: '#fefce8', color: '#ca8a04' }}><Star size={24} /></div>
          <div><p className="stat-widget-label">Rating</p><h3 className="stat-widget-value">4.9/5</h3></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="freelancer-section">
          <div className="section-header">
            <h2>Recommended for You</h2>
            <Link to="/projects" className="link-text">See More</Link>
          </div>
          <div className="project-grid-dash">
            {availableProjects.map(p => (
              <div key={p.id} className="project-card-glass">
                <div className="pcg-header">
                  <h3>{p.title}</h3>
                  <span className="pcg-budget">₹{p.budget?.toLocaleString()}</span>
                </div>
                <p className="pcg-desc">{p.description.substring(0, 80)}...</p>
                <div className="pcg-footer">
                  <span className="pcg-tag">Verified Client</span>
                  <Link to={`/projects/${p.id}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                    Bid Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="dashboard-sidebar-content">
          <div className="profile-completion-card glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Upload Portfolio</h3>
            <FileUploader onUpload={(files) => console.log('Files uploaded:', files)} />
          </div>

          <div className="skills-card glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>My Skills</h3>
            <SkillBar skill="React" percentage={90} color="#61DBFB" />
            <SkillBar skill="Node.js" percentage={75} color="#68A063" />
            <SkillBar skill="Spring Boot" percentage={80} color="#6DB33F" />
            <SkillBar skill="UI/UX Design" percentage={65} color="#FF61F6" />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
