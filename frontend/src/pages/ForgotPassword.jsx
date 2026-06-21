import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import authService from '../services/authService';
import './Auth.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email);
      setStep(2);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to send OTP. Please check your email.';
      setError(status ? `[${status}] ${msg}` : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.verifyOtp(email, otp);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(email, otp, newPassword);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-background">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
      </div>

      <div className="auth-container">
        <div className="glass-panel auth-card">
          <div className="auth-header">
            <Link to="/login" className="back-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <ArrowLeft size={18} /> Back to Login
            </Link>
            <h1 className="auth-title">
              {step === 4 ? 'Success!' : 'Reset Password'}
            </h1>
            <p className="auth-subtitle">
              {step === 1 && 'Enter your email to receive a recovery code.'}
              {step === 2 && `We've sent a 6-digit code to ${email}.`}
              {step === 3 && 'Choose a strong new password.'}
              {step === 4 && 'Your password has been updated.'}
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-group">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  className="auth-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className={`btn btn-primary auth-submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Send Recovery Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="form-group">
              <label>Recovery Code (OTP)</label>
              <div className="input-group">
                <ShieldCheck className="input-icon" size={20} />
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className={`btn btn-primary auth-submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Verify Code'}
            </button>
            <button 
              type="button" 
              className="btn-link" 
              onClick={() => setStep(1)}
              style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}
            >
              Didn't get the code? Try again
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label>New Password</label>
              <div className="input-group">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-group">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className={`btn btn-primary auth-submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Update Password'}
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="success-state animate-scale-up">
            <CheckCircle2 size={64} className="success-icon" />
            <button 
              onClick={() => navigate('/login')} 
              className="btn btn-primary auth-submit-btn"
              style={{ marginTop: '2rem' }}
            >
              Sign In Now
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default ForgotPassword;
