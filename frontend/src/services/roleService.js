import api from './api';

export const roleService = {
  getAll: async () => {
    const response = await api.get('/roles');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  getBySystem: async (systemId) => {
    const response = await api.get(`/roles/system/${systemId}`);
    return response.data;
  },

  create: async (roleData) => {
    const response = await api.post('/roles', roleData);
    return response.data;
  },

  update: async (id, roleData) => {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  }
};

// Made with Bob
