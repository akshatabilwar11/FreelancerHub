import api from './api';

const projectService = {
  getAllProjects: async () => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (e) { console.error(e); throw e; }
  },

  getProjectById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (e) { console.error(e); throw e; }
  },

  getProjectsByClient: async (clientId) => {
    try {
      const response = await api.get(`/projects/client/${clientId}`);
      return response.data;
    } catch (e) { console.error(e); throw e; }
  },

  createProject: async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (e) { console.error(e); throw e; }
  },

  getActiveHiresCount: async (clientId) => {
    try {
      const response = await api.get(`/projects/client/${clientId}/active-hires`);
      return response.data;
    } catch (e) { 
      console.error(e); 
      return 0; 
    }
  },

  activateProject: async (id) => {
    try {
      const response = await api.put(`/projects/${id}/activate`);
      return response.data;
    } catch (e) { console.error(e); throw e; }
  },

  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (e) { console.error(e); throw e; }
  },

  getFreelancerAvailability: async (freelancerId) => {
    try {
      const response = await api.get(`/projects/freelancer/${freelancerId}/availability`);
      return response.data;
    } catch (e) {
      console.error(e);
      return 'AVAILABLE';
    }
  },
};

export default projectService;
