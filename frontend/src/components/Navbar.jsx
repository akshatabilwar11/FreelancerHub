import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Menu, X, LayoutDashboard, LogOut, User, Home, Moon, Sun, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import useNotifications from '../hooks/useNotifications';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications(user?.id);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <nav className="navbar glass-panel">
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
          <Briefcase className="logo-icon" />
          <span>FreelencerHub</span>
        </Link>

        {/* Desktop centre links */}
        <div className="navbar-links desktop-only">
          <Link to="/" className="nav-link">{t('nav_home')}</Link>
          {!user?.roles?.some(r => r.toUpperCase().includes('CLIENT')) && <Link to="/projects" className="nav-link">{t('nav_projects')}</Link>}
          {user?.roles?.some(r => r.toUpperCase().includes('ADMIN')) && <Link to="/users" className="nav-link">{t('nav_users')}</Link>}
          {user?.roles?.some(r => r.toUpperCase().includes('CLIENT')) && <Link to="/freelancers" className="nav-link">{t('nav_freelancers')}</Link>}
          {user?.roles?.some(r => r.toUpperCase().includes('FREELANCER')) && <Link to="/bids" className="nav-link">{t('nav_my_bids')}</Link>}
          {isAuthenticated && <Link to="/payments" className="nav-link">{t('nav_payments')}</Link>}
          {isAuthenticated && <Link to="/messages" className="nav-link">{t('nav_messages')}</Link>}
        </div>

        {/* Desktop right actions */}
          <div className="navbar-actions desktop-only">
            <button 
              className="theme-toggle-btn" 
              onClick={toggleDarkMode}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <select onChange={changeLanguage} value={i18n.language} className="lang-select glass-panel">
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="hi">हिन्दी</option>
            </select>

            {isAuthenticated ? (
              <>
                <div 
                  className={`notification-wrapper ${unreadCount > 0 ? 'pulse-bell' : ''}`} 
                  style={{ position: 'relative', cursor: 'pointer', margin: '0 10px' }} 
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="unread-badge">
                      {unreadCount}
                    </span>
                  )}
                  {showNotifications && (
                    <div className="notification-dropdown glass-panel" style={{ position: 'absolute', top: '30px', right: '-50px', width: '250px', background: 'var(--bg-card)', padding: '10px', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px' }}>{t('notifications_title')}</h4>
                      {notifications.length === 0 ? (
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('notifications_empty')}</p>
                      ) : (
                        notifications.slice(0, 5).map((notif, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => !notif.isRead && markAsRead(notif.id)}
                            style={{ 
                              padding: '8px 0', 
                              borderBottom: '1px solid var(--border-color)', 
                              fontSize: '12px',
                              opacity: notif.isRead ? 0.6 : 1,
                              cursor: notif.isRead ? 'default' : 'pointer'
                            }}
                          >
                            {notif.message}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <Link to="/profile" className="nav-user">
                  <img src="/assets/avatar.png" alt="User" className="nav-avatar" />
                  {user?.name || user?.email?.split('@')[0]}
                </Link>
                <Link to="/dashboard" className="btn btn-secondary" id="nav-dashboard-btn">
                  <LayoutDashboard size={16} /> {t('nav_dashboard')}
                </Link>
                <button id="nav-logout-btn" className="btn btn-primary" onClick={handleLogout}>
                  <LogOut size={16} /> {t('nav_logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary" style={{ borderColor: '#ef4444', color: '#ef4444' }}>{t('nav_admin')}</Link>
                <Link to="/login" className="btn btn-secondary" id="nav-login-btn">{t('nav_login')}</Link>
                <Link to="/register" className="btn btn-primary" id="nav-register-btn">{t('nav_signup')}</Link>
              </>
            )}
          </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn mobile-only"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="mobile-menu" style={{
          position: 'absolute', top: '100%', left: 0, right: 0, background: 'white',
          padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)', borderTop: '1px solid #e2e8f0', zIndex: 1000
        }}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{
                padding: '1.25rem', textAlign: 'center', background: '#f8fafc', 
                borderRadius: '12px', fontWeight: '700', color: '#0f172a'
              }}>Dashboard</Link>
              <button onClick={handleLogout} style={{
                padding: '1.25rem', textAlign: 'center', background: '#fef2f2', 
                borderRadius: '12px', fontWeight: '700', color: '#ef4444'
              }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} style={{
                padding: '1.25rem', textAlign: 'center', color: '#ef4444', 
                fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>{t('nav_admin')}</Link>
              <Link to="/login" onClick={() => setMobileOpen(false)} style={{
                padding: '1.25rem', textAlign: 'center', background: '#f8fafc', 
                borderRadius: '12px', fontWeight: '700', color: '#0f172a', border: '1px solid #e2e8f0'
              }}>{t('nav_login')}</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} style={{
                padding: '1.25rem', textAlign: 'center', background: '#14B8A6', 
                borderRadius: '12px', fontWeight: '700', color: 'white', boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
              }}>{t('nav_signup')}</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
