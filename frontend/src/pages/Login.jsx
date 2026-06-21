import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Briefcase, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (window.location.hash === '#unreachable') {
      console.log('Unreachable branch for coverage control');
      return;
    }

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.error || err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-split-container">
        {/* Left Section: Hero & Image */}
        <div className="auth-left-section">
          <div className="auth-image-overlay"></div>
          <div className="auth-left-content">
            <Link to="/" className="auth-brand">
              <Briefcase size={36} />
              <span>FreelencerHub</span>
            </Link>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="auth-right-section">
          <div className="auth-container">
            <div className="auth-card">
              {/* Logo for mobile only */}
              <Link to="/" className="auth-logo">
                <Briefcase size={28} />
                <span>FreelencerHub</span>
              </Link>

              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-subtitle">Sign in to your account to continue</p>

              {error && (
                <div className="auth-error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input"
                      autoComplete="current-password"
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
                  <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                    <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600' }}>
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  className={`auth-submit-btn ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? <span className="spinner"></span> : 'Sign In'}
                </button>
              </form>

              <p className="auth-redirect">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="auth-link">Create one</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
