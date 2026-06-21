import api from './api';

const paymentService = {
  getAllPayments: async () => {
    try {
      const response = await api.get('/payments');
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  processPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getFreelancerEarnings: async (freelancerId) => {
    try {
      const response = await api.get(`/payments/stats/freelancer/${freelancerId}`);
      return response.data;
    } catch (error) {
      console.error(error);
      return 0;
    }
  },

  getProjectsSpent: async (projectIds) => {
    try {
      const response = await api.post('/payments/stats/projects', projectIds);
      return response.data;
    } catch (error) {
      console.error(error);
      return 0;
    }
  },

  releasePayment: async (paymentId) => {
    try {
      const response = await api.post(`/payments/${paymentId}/release`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};

export default paymentService;
