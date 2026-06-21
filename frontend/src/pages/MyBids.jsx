import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Send, Clock, CheckCircle, XCircle, Briefcase, Calendar, ChevronLeft, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import './MyBids.css';

const MyBids = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');

  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // Unique localStorage key scoped to both user ID AND email to prevent
  // cross-account data leaks when DB IDs are reused after a reset.
  const bidsKey = user ? `bids_${user.id}_${user.email}` : null;

  useEffect(() => {
    if (!user?.id || !bidsKey) return;

    const syncBids = async () => {
      try {
        // Load only THIS user's bids from localStorage
        let storedBids = JSON.parse(localStorage.getItem(bidsKey)) || [];

        if (storedBids.length === 0) {
          // Brand-new freelancer — start with a genuinely empty bids list.
          // Do NOT auto-populate fake bids from other projects; that was causing
          // new accounts to show proposals they never submitted.
          setBids([]);
          setLoading(false);
          return;
        }

        // Cross-reference status of each bid against the live database
        const updatedBids = await Promise.all(
          storedBids.map(async (bid) => {
            try {
              const proj = await projectService.getProjectById(bid.projectId);
              if (proj) {
                let currentStatus = bid.status;
                if (proj.freelancerId == user.id) {
                  currentStatus = 'ACCEPTED';
                } else if (proj.freelancerId && proj.freelancerId != user.id) {
                  currentStatus = 'REJECTED';
                } else if (proj.status === 'PENDING' || proj.status === 'OPEN') {
                  currentStatus = 'PENDING';
                }
                return { ...bid, projectTitle: proj.title, clientName: `Client #${proj.clientId}`, status: currentStatus };
              }
            } catch (err) {
              console.error(`Failed to fetch status for project #${bid.projectId}`, err);
            }
            return bid;
          })
        );

        // Persist updated statuses and update UI
        localStorage.setItem(bidsKey, JSON.stringify(updatedBids));
        setBids(updatedBids);
      } catch (err) {
        console.error('Failed to sync bids details', err);
      } finally {
        setLoading(false);
      }
    };

    syncBids();
  }, [user, bidsKey]);

  const filteredBids = filter === 'ALL' 
    ? bids 
    : bids.filter(b => b.status === filter);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="bid-status-badge accepted"><CheckCircle size={14} /> Accepted</span>;
      case 'REJECTED':
        return <span className="bid-status-badge rejected"><XCircle size={14} /> Rejected</span>;
      default:
        return <span className="bid-status-badge pending"><Clock size={14} /> Pending</span>;
    }
  };

  return (
    <div className="my-bids-page animate-fade-in">
      <div className="bids-hero">
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.8)' }}>
            <ChevronLeft size={20} /> Back
          </button>
          <h1 className="bids-title">My Bids & Proposals</h1>
          <p className="bids-subtitle">Track the status of your submitted project proposals.</p>
        </div>
      </div>

      <div className="container bids-body">
        <div className="bids-overview">
          <div className="stat-widget glass-panel">
            <div className="stat-widget-icon" style={{ background: 'rgba(59,130,246,0.2)' }}>
              <Send size={24} color="#3B82F6" />
            </div>
            <div>
              <p className="stat-widget-label">Total Submitted</p>
              <h3 className="stat-widget-value">{bids.length}</h3>
            </div>
          </div>
          <div className="stat-widget glass-panel">
            <div className="stat-widget-icon" style={{ background: 'rgba(16,185,129,0.2)' }}>
              <CheckCircle size={24} color="#10B981" />
            </div>
            <div>
              <p className="stat-widget-label">Won Projects</p>
              <h3 className="stat-widget-value">{bids.filter(b => b.status === 'ACCEPTED').length}</h3>
            </div>
          </div>
          <div className="stat-widget glass-panel">
            <div className="stat-widget-icon" style={{ background: 'rgba(245,158,11,0.2)' }}>
              <Clock size={24} color="#F59E0B" />
            </div>
            <div>
              <p className="stat-widget-label">Pending Decision</p>
              <h3 className="stat-widget-value">{bids.filter(b => b.status === 'PENDING').length}</h3>
            </div>
          </div>
        </div>

        <section className="bids-history">
          <div className="section-header bids-filters">
            <div className="filter-group">
              <button className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>All Bids</button>
              <button className={`filter-btn ${filter === 'PENDING' ? 'active' : ''}`} onClick={() => setFilter('PENDING')}>Pending</button>
              <button className={`filter-btn ${filter === 'ACCEPTED' ? 'active' : ''}`} onClick={() => setFilter('ACCEPTED')}>Accepted</button>
              <button className={`filter-btn ${filter === 'REJECTED' ? 'active' : ''}`} onClick={() => setFilter('REJECTED')}>Rejected</button>
            </div>
          </div>

          {filteredBids.length === 0 ? (
            <div className="empty-state glass-panel">
              <Briefcase size={48} />
              <p>No bids found for this category.</p>
              <Link to="/projects" className="btn btn-primary mt-4">Browse Projects</Link>
            </div>
          ) : (
            <div className="bids-list">
              {filteredBids.map(bid => (
                <div key={bid.id} className="bid-item glass-panel">
                  <div className="bid-item-header">
                    <div className="bid-project-info">
                      <Link to={`/projects/${bid.projectId}`} className="bid-project-title">
                        {bid.projectTitle} <ArrowUpRight size={14} />
                      </Link>
                      <p className="bid-client-name">{bid.clientName}</p>
                    </div>
                    {getStatusBadge(bid.status)}
                  </div>
                  
                  <div className="bid-details-grid">
                    <div className="bid-detail-box">
                      <span className="detail-label">Bid Amount</span>
                      <span className="detail-value highlight">₹{bid.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bid-detail-box">
                      <span className="detail-label">Est. Duration</span>
                      <span className="detail-value">{bid.duration} Days</span>
                    </div>
                    <div className="bid-detail-box">
                      <span className="detail-label">Submitted On</span>
                      <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={14} /> {bid.submittedOn}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyBids;
