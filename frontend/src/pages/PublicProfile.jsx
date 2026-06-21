import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Star, MapPin, Calendar, Award, Briefcase, ChevronLeft } from 'lucide-react';
import userService from '../services/userService';
import projectService from '../services/projectService';
import OnlineStatus from '../components/common/OnlineStatus';
import TrustScore from '../components/common/TrustScore';
import ContactModal from '../components/ContactModal';
import './Profile.css';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState(null);
  const [freelancerProjects, setFreelancerProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        const data = await userService.getUserById(id);
        setFreelancer(data);
        
        const projectsData = await projectService.getAllProjects();
        const projectsList = projectsData.content || projectsData;
        if (Array.isArray(projectsList)) {
          const assignedProjects = projectsList.filter(p => p.freelancerId == id);
          setFreelancerProjects(assignedProjects);
        }
      } catch (error) {
        console.error('Failed to fetch freelancer profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancer();
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><div className="spinner"></div></div>;
  if (!freelancer) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><h2>Freelancer not found</h2><button className="btn btn-secondary" onClick={() => navigate('/freelancers')}>Back to List</button></div>;

  return (
    <div className="profile-page animate-fade-in">
      <div className="profile-hero" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f172a 100%)' }}>
        <div className="container">
          <button className="btn-back" onClick={() => navigate(-1)} style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <ChevronLeft size={20} /> Back
          </button>
          <div className="profile-header">
            <div className="profile-avatar-large">
              {freelancer.name[0].toUpperCase()}
            </div>
            <div className="profile-info-main">
              <h1 className="profile-name" style={{ color: 'white' }}>{freelancer.name}</h1>
              <p className="profile-tagline" style={{ color: 'rgba(255,255,255,0.8)' }}>{freelancer.role || 'Professional Freelancer'}</p>
              <div className="profile-badges">
                <span className="profile-badge">
                  <Star size={14} fill="currentColor" /> 4.9 Rating
                </span>
                <span className="profile-badge">
                  <Shield size={14} /> Verified Expert
                </span>
              </div>
            </div>
            <div className="profile-header-actions">
              <button className="btn btn-primary" onClick={() => setShowContactModal(true)}>
                <Mail size={18} /> Contact Expert
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container profile-content">
        <div className="profile-grid">
          <div className="profile-sidebar">
            <div className="glass-panel profile-card">
              <h3>Professional Stats</h3>
              {freelancerProjects.length > 0 && (
                <>
                  <div className="info-item">
                    <Award size={18} />
                    <span>98% Job Success</span>
                  </div>
                  <div className="info-item">
                    <Briefcase size={18} />
                    <span>{freelancerProjects.length} Project{freelancerProjects.length !== 1 ? 's' : ''} Completed</span>
                  </div>
                </>
              )}
              <div className="info-item">
                <MapPin size={18} />
                <span>Remote / Global</span>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                 <TrustScore score={freelancer.trustScore || 90} />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <OnlineStatus isOnline={freelancer.online} />
              </div>
            </div>
          </div>

          <div className="profile-main">
            <div className="glass-panel profile-card">
              <h3>Expertise & Bio</h3>
              <p>Passionate {freelancer.role || 'expert'} with extensive experience in delivering high-quality solutions. Specialized in creating scalable, performant, and user-friendly applications tailored to client needs.</p>
              <div className="skills-list" style={{ marginTop: '1.5rem' }}>
                {['Strategic Planning', 'Technical Implementation', 'UI/UX Oversight', 'Cloud Architecture'].map(skill => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>

            {freelancerProjects.length > 0 && (
              <div className="glass-panel profile-card">
                <h3>Portfolio Highlights</h3>
                <div className="portfolio-preview" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {freelancerProjects.map(proj => (
                    <div key={proj.id} style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                      <Briefcase size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                      <p style={{ fontSize: '14px', fontWeight: '600' }}>{proj.title}</p>
                      <span className={`pub-badge status-${proj.status?.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '5px' }}>
                        {proj.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showContactModal && (
        <ContactModal 
          freelancer={freelancer} 
          onClose={() => setShowContactModal(false)} 
        />
      )}
    </div>
  );
};

export default PublicProfile;
