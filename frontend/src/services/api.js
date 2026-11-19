import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // Render's free tier can take ~30-60s to wake from sleep.
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sari_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'The server took too long to respond.'
        : error.message || 'Network error. Please check your connection.');
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('sari_token');
      localStorage.removeItem('sari_user');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
