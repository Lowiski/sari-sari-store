import api from './api.js';

export const analyticsService = {
  overview: async (params) => (await api.get('/analytics/overview', { params })).data,
  descriptive: async (params) => (await api.get('/analytics/descriptive', { params })).data,
  predictive: async (params) => (await api.get('/analytics/predictive', { params })).data,
  prescriptive: async (params) => (await api.get('/analytics/prescriptive', { params })).data,
  marketing: async () => (await api.get('/analytics/marketing')).data,
  salesReport: async (params) => (await api.get('/reports/sales', { params })).data,
  inventoryReport: async (params) => (await api.get('/reports/inventory', { params })).data,
};
