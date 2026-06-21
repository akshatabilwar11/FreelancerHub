import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Edit2, CheckCircle, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const getJoinDate = () => {
    if (user?.createdAt || user?.createdDate) {
      const d = new Date(user.createdAt || user.createdDate);
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    role: user?.roles?.[0]?.replace('ROLE_', '') || 'FREELANCER',
    location: 'Remote',
    joined: getJoinDate()
  });

  const handleSave = () => {
    setEditing(false);
    // Here we would call userService.updateUser
  };

  return (
    <div className="profile-page animate-fade-in">
      <div className="profile-hero">
        <div className="container profile-header">
          <div className="profile-avatar-large">
            {profileData.name[0].toUpperCase()}
          </div>
          <div className="profile-info-main">
            <h1 className="profile-name">{profileData.name}</h1>
            <p className="profile-tagline">Expert Full-Stack Developer</p>
            <div className="profile-badges">
              <span className="profile-badge">
                <Shield size={14} /> Verified Pro
              </span>
              <span className="profile-badge role-badge">
                {profileData.role}
              </span>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={() => setEditing(!editing)}>
            <Edit2 size={16} /> {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="container profile-content">
        <div className="profile-grid">
          <div className="profile-sidebar">
            <div className="glass-panel profile-card">
              <h3>Contact Info</h3>
              <div className="info-item">
                <Mail size={18} />
                <span>{profileData.email}</span>
              </div>
              <div className="info-item">
                <MapPin size={18} />
                <span>{profileData.location}</span>
              </div>
              <div className="info-item">
                <Calendar size={18} />
                <span>Joined {profileData.joined}</span>
              </div>
            </div>
          </div>

          <div className="profile-main">
            <div className="glass-panel profile-card">
              <h3>About Me</h3>
              {editing ? (
                <textarea 
                  className="profile-textarea" 
                  defaultValue="Passionate developer with 5+ years of experience in building scalable web applications..."
                />
              ) : (
                <p>Passionate developer with 5+ years of experience in building scalable web applications. Specialist in React, Spring Boot, and Cloud Architecture.</p>
              )}
            </div>

            <div className="glass-panel profile-card">
              <h3>Skills</h3>
              <div className="skills-list">
                {['Java', 'React', 'Spring Boot', 'PostgreSQL', 'Docker', 'AWS'].map(skill => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>

            {editing && (
              <div className="profile-actions">
                <button className="btn btn-primary" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
