import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Users, Briefcase, DollarSign, ShieldAlert, BarChart, Trash2, UserCheck } from 'lucide-react';
import userService from '../../services/userService';
import FraudAlerts from './FraudAlerts';
import '../../pages/Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error('Admin: Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        await userService.deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-hero admin-hero">
        <div className="hero-content">
          <h1>System Control Center</h1>
          <p>Welcome back, Administrator. Monitoring platform integrity and growth.</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-widget">
          <div className="stat-widget-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><Users size={24} /></div>
          <div><p className="stat-widget-label">Total Users</p><h3 className="stat-widget-value">{users.length}</h3></div>
        </div>
        <div className="stat-widget">
          <div className="stat-widget-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><ShieldAlert size={24} /></div>
          <div><p className="stat-widget-label">Reports</p><h3 className="stat-widget-value">2 Active</h3></div>
        </div>
        <div className="stat-widget">
          <div className="stat-widget-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}><DollarSign size={24} /></div>
          <div><p className="stat-widget-label">Revenue</p><h3 className="stat-widget-value">₹1,24,000</h3></div>
        </div>
      </div>

      <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <section className="admin-section">
        <div className="section-header">
          <h2>User Management</h2>
          <div className="badge badge-admin">Platform Security</div>
        </div>
        
        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`role-badge role-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                  <td><span className="status-active">Active</span></td>
                  <td className="table-actions">
                    <button className="icon-btn delete-btn" onClick={() => handleDeleteUser(u.id)} title="Remove User"><Trash2 size={16} /></button>
                    <button className="icon-btn approve-btn" title="Approve Account"><UserCheck size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </section>

        <aside className="admin-sidebar">
          <FraudAlerts />
        </aside>
      </div>
    </div>
  );
};

export default AdminDashboard;
