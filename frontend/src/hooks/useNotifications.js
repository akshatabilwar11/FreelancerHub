import { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

const useNotifications = (userId, intervalMs = 10000) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotificationsByUser(userId);
        const newNotifications = data || [];
        
        // Check for truly new notifications to trigger alerts
        if (notifications.length > 0 && newNotifications.length > notifications.length) {
          const latest = newNotifications[0];
          if (latest && !latest.isRead) {
             // Dispatch a custom event for global toast listeners
             window.dispatchEvent(new CustomEvent('new-notification', { detail: latest }));
          }
        }

        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.isRead).length);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, intervalMs);
    return () => clearInterval(intervalId);
  }, [userId, intervalMs, notifications.length]);

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return { notifications, unreadCount, markAsRead };
};

export default useNotifications;
