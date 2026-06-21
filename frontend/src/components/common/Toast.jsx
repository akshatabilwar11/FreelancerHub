import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import './Toast.css';

const Toast = () => {
  const [notification, setNotification] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleNewNotification = (e) => {
      setNotification(e.detail);
      setShow(true);
      setTimeout(() => setShow(false), 5000); // Auto hide after 5s
    };

    window.addEventListener('new-notification', handleNewNotification);
    return () => window.removeEventListener('new-notification', handleNewNotification);
  }, []);

  if (!notification) return null;

  return (
    <div className={`toast-notification glass-panel ${show ? 'show' : ''}`}>
      <div className="toast-icon">
        <Bell size={20} />
      </div>
      <div className="toast-body">
        <h4>New Notification</h4>
        <p>{notification.message}</p>
      </div>
      <button className="toast-close" onClick={() => setShow(false)}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
