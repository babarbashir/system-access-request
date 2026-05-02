import api from './api';

export const systemService = {
  getAll: async () => {
    const response = await api.get('/systems');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/systems/${id}`);
    return response.data;
  },

  create: async (systemData) => {
    const response = await api.post('/systems', systemData);
    return response.data;
  },

  update: async (id, systemData) => {
    const response = await api.put(`/systems/${id}`, systemData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/systems/${id}`);
    return response.data;
  }
};

// Made with Bob
