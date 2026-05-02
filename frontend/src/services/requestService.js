import api from './api';

export const requestService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.employee_id) params.append('employee_id', filters.employee_id);
    if (filters.manager_id) params.append('manager_id', filters.manager_id);
    
    const response = await api.get(`/requests?${params.toString()}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  create: async (requestData) => {
    const response = await api.post('/requests', requestData);
    return response.data;
  },

  update: async (id, requestData) => {
    const response = await api.put(`/requests/${id}`, requestData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/requests/${id}`);
    return response.data;
  },

  submit: async (id) => {
    const response = await api.post(`/requests/${id}/submit`);
    return response.data;
  },

  approve: async (id) => {
    const response = await api.post(`/requests/${id}/approve`);
    return response.data;
  },

  reject: async (id) => {
    const response = await api.post(`/requests/${id}/reject`);
    return response.data;
  }
};

// Made with Bob
