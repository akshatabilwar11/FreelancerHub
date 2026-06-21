import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Briefcase, DollarSign, User, Clock, ChevronLeft, Send, ShieldCheck, Info } from 'lucide-react';
import projectService from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [coupon, setCoupon] = useState('');

  const [clientProjectsCount, setClientProjectsCount] = useState(0);

  const mockProjects = [
    { id: 1, title: 'AI-Powered E-commerce Platform', description: 'Building a next-generation shopping experience with personalized AI recommendations and real-time inventory.', budget: 15000, clientId: 101 },
    { id: 2, title: 'Corporate Brand Identity Redesign', description: 'Full-scale visual identity overhaul for a global tech firm, including logo, typography, and digital assets.', budget: 8500, clientId: 102 },
    { id: 3, title: 'Blockchain Smart Contract Audit', description: 'Security analysis and auditing for a DeFi protocol launching on Ethereum and Polygon networks.', budget: 12000, clientId: 103 },
    { id: 4, title: 'Real Estate Mobile App', description: 'Cross-platform app for property listing and virtual tours.', budget: 9000, clientId: 104 },
    { id: 5, title: 'Cloud Infrastructure Migration', description: 'Moving legacy servers to AWS with high availability setup.', budget: 20000, clientId: 105 }
  ];

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await projectService.getProjectById(id);
        if (data) {
          setProject(data);
          try {
            const clientProjects = await projectService.getProjectsByClient(data.clientId);
            if (Array.isArray(clientProjects)) {
              setClientProjectsCount(clientProjects.length);
            }
          } catch (e) {
            console.error('Failed to load client projects count', e);
          }
        } else {
          // Fallback to mock data
          const mock = mockProjects.find(p => p.id === parseInt(id));
          setProject(mock);
        }
      } catch (err) {
        console.error('Failed to load project details, checking mock data', err);
        const mock = mockProjects.find(p => p.id === parseInt(id));
        setProject(mock);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const [bidDuration, setBidDuration] = useState('');

  const handleBidSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Save to localStorage for My Bids page
    if (user?.id && user?.email) {
      const newBid = {
        id: Date.now(),
        projectId: parseInt(id),
        projectTitle: project?.title || 'Project',
        amount: parseFloat(bidAmount) || 0,
        duration: parseInt(bidDuration) || 30,
        status: 'PENDING',
        submittedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        clientName: `Client #${project?.clientId || 'Unknown'}`
      };

      try {
        // Use the same scoped key as MyBids.jsx (id + email) so bids never cross user accounts
        const bidsKey = `bids_${user.id}_${user.email}`;
        const existingBids = JSON.parse(localStorage.getItem(bidsKey)) || [];
        // Remove any existing bid for the same project to avoid duplicates
        const filtered = existingBids.filter(b => b.projectId !== newBid.projectId);
        localStorage.setItem(bidsKey, JSON.stringify([...filtered, newBid]));
      } catch (e) {
        console.error('Failed to save bid to localStorage', e);
      }
    }

    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1000);
  };

  if (loading) return (
    <div className="dash-loading container" style={{padding: '5rem 0'}}>
      <span className="spinner"></span> Loading project details...
    </div>
  );

  if (!project) return (
    <div className="container" style={{padding: '5rem 0', textAlign: 'center'}}>
      <h2>Project not found</h2>
      <Link to="/projects" className="btn btn-secondary mt-4">Back to Marketplace</Link>
    </div>
  );

  return (
    <div className="project-details-page animate-fade-in">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} /> Back
        </button>

        <div className="project-details-grid">
          <div className="project-details-main">
            <div className="glass-panel project-info-card">
              <div className="project-header-top">
                <span className="project-tag">Web Development</span>
                <span className="project-posted">
                  {project.createdAt
                    ? `Posted on ${new Date(project.createdAt).toLocaleDateString('en-IN', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })} at ${new Date(project.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit', hour12: true
                      })}`
                    : 'Posted recently'}
                </span>
              </div>
              <h1 className="project-title-large">{project.title}</h1>
              
              <div className="project-stats-meta">
                <div className="meta-stat">
                  <div className="icon-placeholder" style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--primary-color)' }}>₹</div>
                  <div>
                    <p className="meta-label">Budget</p>
                    <p className="meta-value">₹{project.budget?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="meta-stat">
                  <Clock size={18} />
                  <div>
                    <p className="meta-label">Duration</p>
                    <p className="meta-value">1 - 3 Months</p>
                  </div>
                </div>
                <div className="meta-stat">
                  <ShieldCheck size={18} />
                  <div>
                    <p className="meta-label">Payment</p>
                    <p className="meta-value">Verified</p>
                  </div>
                </div>
              </div>

              <div className="project-description-section">
                <h3>Description</h3>
                <p>{project.description}</p>
                <p>We are looking for a skilled developer who can take ownership of this project and deliver high-quality results within the timeline.</p>
              </div>

              <div className="project-skills-section">
                <h3>Required Skills</h3>
                <div className="skills-list">
                  {['React', 'Spring Boot', 'REST API', 'MySQL'].map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="project-details-sidebar">


            {user?.id && project?.clientId && Number(user.id) === Number(project.clientId) ? (
              <div className="glass-panel bid-card" style={{ textAlign: 'center' }}>
                <Briefcase size={40} color="var(--primary-color)" style={{ margin: '0 auto 1rem' }} />
                <h3>Your Project</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  You are the owner of this project. You can view bids and manage it from your dashboard.
                </p>
                <Link to="/dashboard" className="btn btn-primary btn-full">
                  Go to Dashboard
                </Link>
              </div>
            ) : user?.roles?.some(r => r.includes('FREELANCER')) ? (
              <div className="glass-panel bid-card">
                <h3>Place a Bid</h3>
                {success ? (
                  <div className="success-message">
                    <ShieldCheck size={40} color="#10B981" />
                    <p>Your bid has been submitted successfully!</p>
                    <button className="btn btn-secondary btn-full" onClick={() => {
                      setSuccess(false);
                    }}>Bid Again</button>
                  </div>
                ) : (
                  <form onSubmit={handleBidSubmit} className="bid-form">
                    <div className="form-group">
                      <label>Your Bid Amount (₹)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder={`e.g. ${project.budget}`}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Estimated Duration (Days)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="e.g. 30" 
                        value={bidDuration}
                        onChange={(e) => setBidDuration(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Cover Letter</label>
                      <textarea 
                        className="form-input" 
                        rows={4} 
                        placeholder="Why are you the best fit for this project?"
                        value={bidMessage}
                        onChange={(e) => setBidMessage(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Bid'} <Send size={16} />
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="glass-panel bid-card" style={{ textAlign: 'center' }}>
                <ShieldCheck size={40} color="var(--primary-color)" style={{ margin: '0 auto 1rem' }} />
                <h3>Client Account</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  You are logged in as a Client. Only Freelancers can place bids on projects.
                </p>
              </div>
            )}

            <div className="glass-panel client-card">
              <h3>About the Client</h3>
              <div className="client-info">
                <div className="client-avatar">
                  <User size={24} />
                </div>
                <div>
                  <p className="client-name">Client #{project.clientId}</p>
                  <p className="client-meta">United States</p>
                </div>
              </div>
              <div className="client-stats">
                <div className="c-stat">
                  <span>5.0</span> <StarRating rating={5} />
                </div>
                <p>{clientProjectsCount} project{clientProjectsCount !== 1 ? 's' : ''} posted</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const StarRating = ({ rating }) => (
  <div className="star-rating">
    {[...Array(rating)].map((_, i) => (
      <ShieldCheck key={i} size={12} fill="#FBBF24" color="#FBBF24" />
    ))}
  </div>
);

export default ProjectDetails;
