import React, { useState, useEffect } from 'react';
import { Send, Inbox, Clock, User, RefreshCw, MessageSquare, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import userService from '../services/userService';
import './Notifications.css'; // Reuse notification styles for consistency

const MessageItem = ({ message, type }) => {
  const [senderName, setSenderName] = useState(`User #${type === 'inbox' ? message.senderId : message.userId}`);

  useEffect(() => {
    const fetchName = async () => {
      try {
        const idToFetch = type === 'inbox' ? message.senderId : message.userId;
        if (idToFetch) {
          const user = await userService.getUserById(idToFetch);
          setSenderName(user.name);
        }
      } catch (err) {
        // Fallback to ID
      }
    };
    fetchName();
  }, [message, type]);

  return (
    <div className={`notif-item glass-panel ${type === 'inbox' && !message.isRead ? 'notif-unread' : 'notif-read'}`}>
      <div className="notif-icon-wrap">
        <MessageSquare size={20} className={type === 'inbox' ? 'icon-unread' : 'icon-read'} />
      </div>
      <div className="notif-body">
        <p className="notif-message">{message.message}</p>
        <div className="notif-meta">
          <span>{type === 'inbox' ? 'From' : 'To'}: <strong>{senderName}</strong></span>
          {message.createdAt && (
            <span style={{ marginLeft: '10px', opacity: 0.7 }}>
               • {new Date(message.createdAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inbox');
  const [error, setError] = useState('');
  
  const isAdmin = user?.roles?.some(r => r.toUpperCase().includes('ADMIN'));

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const received = await notificationService.getNotificationsByUser(user.id);
      const sent = await notificationService.getNotificationsBySender(user.id);
      setMessages(received);
      setSentMessages(sent);
      
      if (isAdmin) {
        const all = await notificationService.getAllNotifications();
        setAllMessages(all);
      }
    } catch (err) {
      setError('Could not load messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const displayList = activeTab === 'inbox' 
    ? messages 
    : (activeTab === 'sent' ? sentMessages : allMessages);

  return (
    <div className="notifications-page animate-fade-in">
      <div className="notif-hero" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #0f172a 100%)' }}>
        <div className="container">
          <div className="notif-hero-row">
            <div>
              <h1 className="notif-title">Messages & Inquiries</h1>
              <p className="notif-subtitle">Manage your communications with other users.</p>
            </div>
            <button className="btn btn-secondary" onClick={loadData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin-icon' : ''} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="container notif-body">
        <div className="notif-tabs">
          <button 
            className={`notif-tab ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('inbox')}
          >
            <Inbox size={18} /> Inbox ({messages.length})
          </button>
          <button 
            className={`notif-tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            <Send size={18} /> Sent ({sentMessages.length})
          </button>
          {isAdmin && (
            <button 
              className={`notif-tab ${activeTab === 'global' ? 'active' : ''}`}
              onClick={() => setActiveTab('global')}
              style={{ color: 'var(--accent-color)' }}
            >
              <Shield size={18} /> Global Log ({allMessages.length})
            </button>
          )}
        </div>

        {loading ? (
          <div className="notif-loading"><span className="spinner"></span> Loading...</div>
        ) : displayList.length === 0 ? (
          <div className="notif-empty glass-panel">
            <MessageSquare size={48} />
            <p>No messages in your {activeTab} yet.</p>
          </div>
        ) : (
          <div className="notif-list">
            {displayList.map(msg => (
              <MessageItem key={msg.id} message={msg} type={activeTab} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
