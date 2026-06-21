import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Eye, Moon, Sun, Globe, Save, Trash2, Smartphone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './Settings.css';

const Settings = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    offers: true
  });

  const toggleNotif = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="settings-page animate-fade-in">
      <div className="settings-hero">
        <div className="container">
          <h1 className="settings-title">Account Settings</h1>
          <p className="settings-subtitle">Manage your account preferences and security settings.</p>
        </div>
      </div>

      <div className="container settings-body">
        <div className="settings-grid">
          <aside className="settings-nav">
            <button className="settings-nav-item active"><Shield size={18} /> General</button>
            <button className="settings-nav-item"><Bell size={18} /> Notifications</button>
            <button className="settings-nav-item"><Shield size={18} /> Security</button>
            <button className="settings-nav-item"><Smartphone size={18} /> Linked Devices</button>
          </aside>

          <main className="settings-main">
            {/* Appearance Section */}
            <section className="settings-section glass-panel">
              <div className="section-header-inline">
                <div className="header-icon-wrap bg-purple-soft">
                  <Moon size={20} />
                </div>
                <div>
                  <h3>Appearance</h3>
                  <p>Customize how FreelencerHub looks on your device.</p>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Dark Mode</h4>
                  <p>Reduce eye strain and save battery life.</p>
                </div>
                <button className={`toggle-btn ${isDarkMode ? 'active' : ''}`} onClick={toggleDarkMode}>
                  <div className="toggle-slider"></div>
                </button>
              </div>
            </section>

            {/* Notifications Section */}
            <section className="settings-section glass-panel">
              <div className="section-header-inline">
                <div className="header-icon-wrap bg-blue-soft">
                  <Bell size={20} />
                </div>
                <div>
                  <h3>Notifications</h3>
                  <p>Choose what updates you want to receive.</p>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Email Notifications</h4>
                  <p>Receive project updates and bids via email.</p>
                </div>
                <button className={`toggle-btn ${notifications.email ? 'active' : ''}`} onClick={() => toggleNotif('email')}>
                  <div className="toggle-slider"></div>
                </button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Push Notifications</h4>
                  <p>Get real-time alerts in your browser.</p>
                </div>
                <button className={`toggle-btn ${notifications.push ? 'active' : ''}`} onClick={() => toggleNotif('push')}>
                  <div className="toggle-slider"></div>
                </button>
              </div>
            </section>

            {/* Security Section */}
            <section className="settings-section glass-panel">
              <div className="section-header-inline">
                <div className="header-icon-wrap bg-red-soft">
                  <Shield size={20} />
                </div>
                <div>
                  <h3>Security & Privacy</h3>
                  <p>Manage your password and account visibility.</p>
                </div>
              </div>

              <div className="setting-action-row">
                <button className="btn btn-secondary">Change Password</button>
                <button className="btn btn-secondary">Two-Factor Auth</button>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="settings-section danger-zone glass-panel">
              <h3>Danger Zone</h3>
              <p>Permanently delete your account and all associated data.</p>
              <button className="btn btn-danger">
                <Trash2 size={16} /> Delete Account
              </button>
            </section>

            <div className="settings-actions">
              <button className="btn btn-primary">
                <Save size={18} /> Save Settings
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
