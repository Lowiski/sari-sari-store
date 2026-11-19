import api from './api.js';

export const salesService = {
  list: async (params) => (await api.get('/sales', { params })).data,
  get: async (id) => (await api.get(`/sales/${id}`)).data,
  create: async (payload) => (await api.post('/sales', payload)).data,
  summary: async (params) => (await api.get('/sales/summary', { params })).data,
  nextInvoice: async () => (await api.get('/sales/next-invoice')).data,
};
