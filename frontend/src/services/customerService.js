import api from './api.js';

export const customerService = {
  list: async (params) => (await api.get('/customers', { params })).data,
  get: async (id) => (await api.get(`/customers/${id}`)).data,
  create: async (payload) => (await api.post('/customers', payload)).data,
  update: async (id, payload) => (await api.put(`/customers/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/customers/${id}`)).data,
  summary: async () => (await api.get('/customers/summary')).data,
};
