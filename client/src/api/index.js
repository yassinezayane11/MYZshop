import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dbach_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dbach_admin_token');
      localStorage.removeItem('dbach_admin_user');
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// Products API
export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/meta/categories'),
  create: (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
};

// Orders API
export const ordersApi = {
  create: (data) => api.post('/orders', data),
  track: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status, note) => api.patch(`/orders/${id}/status`, { status, note }),
};

// Delivery API
export const deliveryApi = {
  getConfig: () => api.get('/delivery'),
  getPriceForCity: (city) => api.get(`/delivery/price/${encodeURIComponent(city)}`),
  updateConfig: (data) => api.put('/delivery', data),
};

// Admin API
export const adminApi = {
  login: (credentials) => api.post('/admin/login', credentials),
  getStats: () => api.get('/admin/stats'),
  changePassword: (data) => api.post('/admin/change-password', data),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (name) => api.post('/categories', { name }),
  update: (id, name) => api.put(`/categories/${id}`, { name }),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Colors API
export const colorsApi = {
  getAll: () => api.get('/colors'),
  create: (name, hex) => api.post('/colors', { name, hex }),
  update: (id, name, hex) => api.put(`/colors/${id}`, { name, hex }),
  delete: (id) => api.delete(`/colors/${id}`),
};
