import api from './api.js';

export const productService = {
  list: async (params) => (await api.get('/products', { params })).data,
  get: async (id) => (await api.get(`/products/${id}`)).data,
  create: async (payload) => (await api.post('/products', payload)).data,
  update: async (id, payload) => (await api.put(`/products/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/products/${id}`)).data,
  categories: async () => (await api.get('/products/categories')).data,
};
