import api from './api.js';

export const inventoryService = {
  stock: async () => (await api.get('/inventory')).data,
  transactions: async (params) => (await api.get('/inventory/transactions', { params })).data,
  alerts: async () => (await api.get('/inventory/alerts')).data,
  valuation: async () => (await api.get('/inventory/valuation')).data,
  stockIn: async (payload) => (await api.post('/inventory/stock-in', payload)).data,
  stockOut: async (payload) => (await api.post('/inventory/stock-out', payload)).data,
};
