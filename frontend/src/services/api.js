import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to normalize backend responses and errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorData = error.response?.data || {
      success: false,
      error: error.message || 'Network communication error',
      code: 'NETWORK_ERROR'
    };
    return Promise.reject(errorData);
  }
);

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token })
};

export const productService = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, updates) => api.patch(`/products/${id}`, updates),
  deleteProduct: (id) => api.delete(`/products/${id}`)
};

export const reportService = {
  createReport: (reportData) => api.post('/reports', reportData)
};

export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (productId, quantity = 1) => api.post('/cart/items', { productId, quantity }),
  updateQuantity: (productId, quantity) => api.patch(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`),
  clear: () => api.delete('/cart')
};

export const orderService = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`)
};

export const paymentService = {
  createPaymentOrder: (orderId) => api.post('/payments/create-order', { orderId }),
  verifyPayment: (paymentData) => api.post('/payments/verify', paymentData)
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getReports: (params = {}) => api.get('/admin/reports', { params }),
  updateReport: (id, data) => api.patch(`/admin/reports/${id}`, data),
  updateProductStatus: (id, data) => api.patch(`/admin/products/${id}/status`, data),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.patch(`/admin/users/${id}/status`, data),
  getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params })
};
