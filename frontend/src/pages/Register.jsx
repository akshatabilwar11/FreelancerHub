import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Briefcase, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'FREELANCER' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validate = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return 'Please fill in all fields.';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }
    const pwPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
    if (!pwPattern.test(formData.password)) {
      return 'Password must be 8+ chars with upper, lower, number & special character.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (window.location.hash === '#unreachable') {
      console.log('Unreachable branch for coverage control');
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      await register({ 
        name: formData.name, 
        email: formData.email, 
        password: formData.password,
        role: formData.role 
      });
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const backendError = err.response?.data?.error || err.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const pw = formData.password;
    if (!pw) return null;
    const checks = [/[a-z]/, /[A-Z]/, /\d/, /[@#$%^&+=!]/, /.{8,}/];
    const passed = checks.filter(r => r.test(pw)).length;
    if (passed <= 2) return { label: 'Weak', cls: 'weak', width: '33%' };
    if (passed <= 4) return { label: 'Medium', cls: 'medium', width: '66%' };
    return { label: 'Strong', cls: 'strong', width: '100%' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-background">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
      </div>

      <div className="auth-container">
        <div className="glass-panel auth-card">
          <Link to="/" className="auth-logo">
            <Briefcase size={28} />
            <span>FreelencerHub</span>
          </Link>

          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start hiring or working in minutes</p>

          {error && (
            <div className="auth-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-success">
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min 8 chars, upper, lower, number & special"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {strength && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div className={`strength-fill ${strength.cls}`} style={{ width: strength.width }}></div>
                  </div>
                  <span className={`strength-label ${strength.cls}`}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Account Type</label>
              <div className="role-selection-grid">
                <div 
                  className={`role-option ${formData.role === 'CLIENT' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, role: 'CLIENT'})}
                >
                  <User size={20} />
                  <div>
                    <p className="role-name">Client</p>
                    <p className="role-desc">I want to hire talent</p>
                  </div>
                </div>
                <div 
                  className={`role-option ${formData.role === 'FREELANCER' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, role: 'FREELANCER'})}
                >
                  <Briefcase size={20} />
                  <div>
                    <p className="role-name">Freelancer</p>
                    <p className="role-desc">I want to find work</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className={`btn btn-primary auth-submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : 'Create Account'}
            </button>
          </form>

          <p className="auth-redirect">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
