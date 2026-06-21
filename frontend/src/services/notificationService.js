import api from './api';

const notificationService = {
  getAllNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getNotificationsByUser: async (userId) => {
    try {
      const response = await api.get(`/notifications/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getNotificationsBySender: async (senderId) => {
    try {
      const response = await api.get(`/notifications/sender/${senderId}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  sendNotification: async ({ userId, senderId, message }) => {
    try {
      const response = await api.post('/notifications', { userId, senderId, message, isRead: false });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  
  markAsRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};

export default notificationService;
