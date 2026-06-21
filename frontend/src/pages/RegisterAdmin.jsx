import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import './Auth.css';

const RegisterAdmin = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', code: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.code) {
      setError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    try {
      // Direct call to auth-service for admin registration
      await axios.post('http://localhost:8080/auth/register-admin', formData);
      setSuccess('Admin account created successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Check your secret code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-background">
        <div className="auth-orb auth-orb-1" style={{ background: 'var(--accent-color)' }}></div>
      </div>

      <div className="auth-container">
        <div className="glass-panel auth-card border-accent">
          <div className="auth-logo">
            <ShieldCheck size={32} className="text-accent" />
            <span>Admin Portal</span>
          </div>

          <h1 className="auth-title">Create Admin Account</h1>
          <p className="auth-subtitle">Elevated access for platform management</p>

          {error && <div className="auth-error"><AlertCircle size={16} /><span>{error}</span></div>}
          {success && <div className="auth-success"><CheckCircle size={16} /><span>{success}</span></div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input type="text" name="name" placeholder="Admin Name" onChange={handleChange} className="form-input" />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input type="email" name="email" placeholder="admin@freelencerhub.com" onChange={handleChange} className="form-input" />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input type="password" name="password" placeholder="••••••••" onChange={handleChange} className="form-input" />
              </div>
            </div>

            <div className="form-group">
              <label>Admin Verification Code</label>
              <div className="input-wrapper">
                <ShieldCheck className="input-icon" size={18} />
                <input type="text" name="code" placeholder="Enter SECRET123" onChange={handleChange} className="form-input" style={{ letterSpacing: '2px', fontWeight: 'bold' }} />
              </div>
              <p className="help-text">Authorized personnel only.</p>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading} style={{ background: 'var(--accent-color)' }}>
              {loading ? 'Creating...' : 'Register as Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterAdmin;
