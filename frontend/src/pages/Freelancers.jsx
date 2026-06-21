import React, { useState, useEffect } from 'react';
import { Search, User, Star, MapPin, Mail, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import projectService from '../services/projectService';
import OnlineStatus from '../components/common/OnlineStatus';
import TrustScore from '../components/common/TrustScore';
import AvailabilityBadge from '../components/common/AvailabilityBadge';
import ContactModal from '../components/ContactModal';
import './Freelancers.css';

const Freelancers = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const data = await userService.getAllUsers();
        // Filter only freelancers (assuming they have a role property)
        const freelancersList = data.filter(u => u.role === 'FREELANCER' || !u.role);
        
        // Fetch real-time availability for each freelancer
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
      } catch (error) {
        console.error('Failed to fetch freelancers', error);
        // Mock data
        setFreelancers([
          { id: 1, name: 'Amit Sharma', role: 'Full Stack Dev', rating: 4.8, location: 'Bangalore', availability: 'AVAILABLE' },
          { id: 2, name: 'Priya Singh', role: 'UI/UX Designer', rating: 4.9, location: 'Mumbai', availability: 'BUSY' },
          { id: 3, name: 'Rahul Verma', role: 'Content Writer', rating: 4.5, location: 'Delhi', availability: 'OVERLOADED' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchFreelancers();
  }, []);

  const filteredFreelancers = freelancers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.role && f.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="freelancers-page container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Find Top Freelancers</h1>
        <p className="page-subtitle">Browse and connect with experts across various industries.</p>
      </div>

      <div className="filter-bar card-glass">
        <div className="search-group">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or skills..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary flex-center gap-2">
          <Filter size={18} /> Filters
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Finding the best talent for you...</p>
        </div>
      ) : (
        <div className="freelancers-grid">
          {filteredFreelancers.length > 0 ? (
            filteredFreelancers.map(freelancer => (
              <div key={freelancer.id} className="freelancer-card card-glass animate-slide-up">
                <div className="freelancer-avatar-wrap">
                  <div className="freelancer-avatar">
                    <User size={40} className="text-blue" />
                  </div>
                  <div className="freelancer-rating">
                    <Star size={14} fill="currentColor" /> {freelancer.rating || '4.5'}
                  </div>
                </div>
                
                <h3 className="freelancer-name">{freelancer.name}</h3>
                <p className="freelancer-role">{freelancer.role || 'Professional Freelancer'}</p>
                <div style={{ marginBottom: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <OnlineStatus isOnline={freelancer.online} />
                  <AvailabilityBadge status={freelancer.availability || 'AVAILABLE'} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <TrustScore score={freelancer.trustScore || 88} />
                </div>
                
                <div className="freelancer-meta">
                  <div className="meta-item">
                    <MapPin size={16} /> {freelancer.location || 'Remote'}
                  </div>
                </div>
                
                <div className="freelancer-actions">
                  <button 
                    className="btn btn-primary btn-full flex-center gap-2"
                    onClick={() => setSelectedFreelancer(freelancer)}
                  >
                    <Mail size={18} /> Contact
                  </button>
                  <button 
                    className="btn btn-outline btn-full"
                    onClick={() => navigate(`/freelancers/${freelancer.id}`)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state card-glass">
              <Search size={48} />
              <p>No freelancers found matching your search.</p>
            </div>
          )}
        </div>
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

export default Freelancers;
