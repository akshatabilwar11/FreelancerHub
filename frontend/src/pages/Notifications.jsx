import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, Inbox, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import './Notifications.css';

const NotificationItem = ({ notification, onMarkRead }) => (
  <div className={`notif-item glass-panel ${notification.isRead ? 'notif-read' : 'notif-unread'}`}>
    <div className="notif-icon-wrap">
      {notification.isRead
        ? <CheckCircle size={20} className="icon-read" />
        : <Bell size={20} className="icon-unread" />}
    </div>
    <div className="notif-body">
      <p className="notif-message">{notification.message}</p>
      <span className="notif-meta">User #{notification.userId}</span>
    </div>
    {!notification.isRead && (
      <button
        className="notif-mark-btn"
        onClick={() => onMarkRead(notification.id)}
        title="Mark as read"
      >
        <CheckCircle size={16} />
      </button>
    )}
  </div>
);

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread | read
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationService.getAllNotifications();
      setNotifications(data);
    } catch (err) {
      setError('Could not load notifications. Is the notification service running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Local mark-read (UI optimistic, no backend PATCH endpoint yet)
  const handleMarkRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read')   return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notifications-page animate-fade-in">
      {/* Header */}
      <div className="notif-hero">
        <div className="container">
          <div className="notif-hero-row">
            <div>
              <h1 className="notif-title">
                Notifications
                {unreadCount > 0 && <span className="notif-badge-count">{unreadCount}</span>}
              </h1>
              <p className="notif-subtitle">Stay up to date with your project activity.</p>
            </div>
            <button
              id="refresh-notifications-btn"
              className="btn btn-secondary"
              onClick={loadNotifications}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="container notif-body">
        {/* Filter tabs */}
        <div className="notif-tabs">
          {['all', 'unread', 'read'].map(tab => (
            <button
              key={tab}
              id={`notif-tab-${tab}`}
              className={`notif-tab ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'unread' && unreadCount > 0 && (
                <span className="tab-count">{unreadCount}</span>
              )}
            </button>
          ))}
          {unreadCount > 0 && (
            <button
              id="mark-all-read-btn"
              className="notif-mark-all-btn"
              onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Content */}
        {error ? (
          <div className="notif-error glass-panel">
            <Clock size={40} />
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="notif-loading">
            <span className="spinner"></span> Loading notifications…
          </div>
        ) : filtered.length === 0 ? (
          <div className="notif-empty glass-panel">
            <Inbox size={48} />
            <p>
              {filter === 'unread' ? 'All caught up! No unread notifications.' :
               filter === 'read'   ? 'No read notifications yet.' :
               'No notifications yet.'}
            </p>
          </div>
        ) : (
          <div className="notif-list">
            {filtered.map(n => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        )}
      </div>
      {window.location.hash === '#u1' && <div>u1</div>}
      {window.location.hash === '#u2' && <div>u2</div>}
      {window.location.hash === '#u3' && <div>u3</div>}
    </div>
  );
};

export default Notifications;
