import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Trash2, UserCheck, Shield, Search, Filter, MoreVertical } from 'lucide-react';
import userService from '../services/userService';
import './Freelancers.css'; // Reuse some grid/card styling

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users', err);
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

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-management-page container animate-fade-in" style={{ padding: '2rem 0' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Monitor and manage all platform participants.</p>
      </div>

      <div className="filter-bar card-glass" style={{ marginBottom: '2rem' }}>
        <div className="search-group">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="badge badge-admin flex-center gap-2">
          <Shield size={16} /> Admin Secured
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading user database...</p>
        </div>
      ) : (
        <div className="card-glass" style={{ overflowX: 'auto', padding: '0' }}>
          <table className="user-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1.25rem' }}>User Info</th>
                <th style={{ padding: '1.25rem' }}>Role</th>
                <th style={{ padding: '1.25rem' }}>Trust Score</th>
                <th style={{ padding: '1.25rem' }}>Status</th>
                <th style={{ padding: '1.25rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600' }}>{u.name}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <span className={`role-badge role-${u.role?.toLowerCase()}`} style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                      background: u.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.1)' : (u.role === 'CLIENT' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)'),
                      color: u.role === 'ADMIN' ? '#ef4444' : (u.role === 'CLIENT' ? '#3b82f6' : '#10b981')
                    }}>
                      {u.role || 'USER'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '60px', height: '6px', background: 'var(--border-color)', borderRadius: '3px' }}>
                        <div style={{ width: `${u.trustScore || 85}%`, height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                      </div>
                      <span style={{ fontSize: '0.85rem' }}>{u.trustScore || 85}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#10b981' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                      Active
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="icon-btn delete-btn" onClick={() => handleDeleteUser(u.id)} style={{ color: '#ef4444', padding: '6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)' }}>
                        <Trash2 size={16} />
                      </button>
                      <button className="icon-btn approve-btn" style={{ color: '#3b82f6', padding: '6px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.1)' }}>
                        <UserCheck size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No users found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersPage;
