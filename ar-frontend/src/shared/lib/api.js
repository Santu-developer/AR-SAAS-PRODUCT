// ─── src/shared/lib/api.js ───────────────────────────────────────────────
// API Service Layer — wraps Axios with typed query builders and error handling
// Provides consistent patterns for all API interactions across features.
// ──────────────────────────────────────────────────────────────────────────

import apiClient from './axios';
import { toast } from 'react-hot-toast';

// ─── Response Helpers ────────────────────────────────────────────────────

/**
 * Extract data from API response — handles both direct and paginated responses.
 * API responses follow { success, message, data } pattern.
 */
export function extractData(response) {
  return response.data?.data ?? response.data;
}

/**
 * Extract pagination metadata from API response.
 */
export function extractPagination(response) {
  const data = response.data?.data || {};
  return {
    content: data.content || data || [],
    totalElements: data.totalElements || 0,
    totalPages: data.totalPages || 0,
    currentPage: data.currentPage || 0,
    pageSize: data.pageSize || 20,
  };
}

// ─── Error Handler ───────────────────────────────────────────────────────

/**
 * Extract a human-readable error message from an API error.
 * Falls back through response message → status text → generic message.
 */
export function getErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Show a toast notification for API errors.
 */
export function showApiError(error, defaultMsg = 'Operation failed') {
  const msg = getErrorMessage(error);
  toast.error(msg || defaultMsg);
  return msg;
}

/**
 * Show a success toast.
 */
export function showApiSuccess(message = 'Operation successful') {
  toast.success(message);
}

// ─── Auth API ────────────────────────────────────────────────────────────

export const authApi = {
  login: (data) => apiClient.post('/api/v1/auth/login', data).then(extractData),
  register: (data) => apiClient.post('/api/v1/auth/register', data).then(extractData),
  me: () => apiClient.get('/api/v1/auth/me').then(extractData),
  refresh: (refreshToken) =>
    apiClient.post('/api/v1/auth/refresh', { refreshToken }).then(extractData),
  logout: () => apiClient.post('/api/v1/auth/logout').then(extractData),
  forgotPassword: (email) =>
    apiClient.post('/api/v1/auth/forgot-password', { email }).then(extractData),
  resetPassword: (data) =>
    apiClient.post('/api/v1/auth/reset-password', data).then(extractData),
};

// ─── Restaurant API ───────────────────────────────────────────────────────

export const restaurantApi = {
  list: (params) => apiClient.get('/api/v1/restaurants', { params }).then(extractData),
  get: (id) => apiClient.get(`/api/v1/restaurants/${id}`).then(extractData),
  create: (data) => apiClient.post('/api/v1/restaurants', data).then(extractData),
  update: (id, data) => apiClient.put(`/api/v1/restaurants/${id}`, data).then(extractData),
  delete: (id) => apiClient.delete(`/api/v1/restaurants/${id}`).then(extractData),
  toggleActive: (id, activate) =>
    apiClient.post(`/api/v1/restaurants/${id}/${activate ? 'activate' : 'deactivate'}`).then(extractData),
};

// ─── Owner API ────────────────────────────────────────────────────────────

export const ownerApi = {
  // Profile
  getProfile: () => apiClient.get('/api/v1/owner/restaurant').then(extractData),
  updateProfile: (data) => apiClient.put('/api/v1/owner/restaurant', data).then(extractData),
  getSettings: () => apiClient.get('/api/v1/owner/restaurant/settings').then(extractData),
  updateSettings: (data) => apiClient.put('/api/v1/owner/restaurant/settings', data).then(extractData),

  // Tables
  listTables: () => apiClient.get('/api/v1/owner/tables').then(extractData),
  createTable: (data) => apiClient.post('/api/v1/owner/tables', data).then(extractData),
  getTable: (id) => apiClient.get(`/api/v1/owner/tables/${id}`).then(extractData),
  updateTable: (id, data) => apiClient.put(`/api/v1/owner/tables/${id}`, data).then(extractData),
  deleteTable: (id) => apiClient.delete(`/api/v1/owner/tables/${id}`).then(extractData),
  getQR: (id) => apiClient.get(`/api/v1/owner/tables/${id}/qr`).then(extractData),
  regenerateQR: (id) => apiClient.post(`/api/v1/owner/tables/${id}/qr/regenerate`).then(extractData),

  // Categories
  listCategories: () => apiClient.get('/api/v1/owner/categories').then(extractData),
  createCategory: (data) => apiClient.post('/api/v1/owner/categories', data).then(extractData),
  updateCategory: (id, data) => apiClient.put(`/api/v1/owner/categories/${id}`, data).then(extractData),
  deleteCategory: (id) => apiClient.delete(`/api/v1/owner/categories/${id}`).then(extractData),

  // Menu Items
  listMenuItems: (params) => apiClient.get('/api/v1/owner/menu-items', { params }).then(extractData),
  createMenuItem: (data) => apiClient.post('/api/v1/owner/menu-items', data).then(extractData),
  getMenuItem: (id) => apiClient.get(`/api/v1/owner/menu-items/${id}`).then(extractData),
  updateMenuItem: (id, data) => apiClient.put(`/api/v1/owner/menu-items/${id}`, data).then(extractData),
  deleteMenuItem: (id) => apiClient.delete(`/api/v1/owner/menu-items/${id}`).then(extractData),
  toggleAvailability: (id) =>
    apiClient.patch(`/api/v1/owner/menu-items/${id}/availability`).then(extractData),
  uploadMedia: (id, data) =>
    apiClient.post(`/api/v1/owner/menu-items/${id}/media`, data).then(extractData),

  // Orders
  listOrders: (params) => apiClient.get('/api/v1/owner/orders', { params }).then(extractData),
  getOrder: (id) => apiClient.get(`/api/v1/owner/orders/${id}`).then(extractData),
  updateOrderStatus: (id, status) =>
    apiClient.patch(`/api/v1/owner/orders/${id}/status`, { status }).then(extractData),
  assignStaff: (id, staffId) =>
    apiClient.patch(`/api/v1/owner/orders/${id}/assign-staff`, { staffId }).then(extractData),

  // Staff
  listStaff: () => apiClient.get('/api/v1/owner/staff').then(extractData),
  createStaff: (data) => apiClient.post('/api/v1/owner/staff', data).then(extractData),
  getStaff: (id) => apiClient.get(`/api/v1/owner/staff/${id}`).then(extractData),
  updateStaff: (id, data) => apiClient.put(`/api/v1/owner/staff/${id}`, data).then(extractData),
  toggleStaffActive: (id, active) =>
    apiClient.patch(`/api/v1/owner/staff/${id}/status`, { active }).then(extractData),
  deleteStaff: (id) => apiClient.delete(`/api/v1/owner/staff/${id}`).then(extractData),

  // Subscription & Billing
  getSubscription: () => apiClient.get('/api/v1/owner/subscription').then(extractData),
  createCheckout: (data) => apiClient.post('/api/v1/owner/subscription/checkout', data).then(extractData),
  changePlan: (data) => apiClient.post('/api/v1/owner/subscription/change-plan', data).then(extractData),
  cancelSubscription: () => apiClient.post('/api/v1/owner/subscription/cancel').then(extractData),

  // Invoices
  listInvoices: (params) => apiClient.get('/api/v1/owner/invoices', { params }).then(extractData),
  getInvoice: (id) => apiClient.get(`/api/v1/owner/invoices/${id}`).then(extractData),
  generateInvoice: (orderId) =>
    apiClient.post(`/api/v1/owner/orders/${orderId}/invoice/generate`).then(extractData),

  // Support
  listTickets: () => apiClient.get('/api/v1/owner/support-tickets').then(extractData),
  createTicket: (data) => apiClient.post('/api/v1/owner/support-tickets', data).then(extractData),
  getTicket: (id) => apiClient.get(`/api/v1/owner/support-tickets/${id}`).then(extractData),
  replyTicket: (id, message) =>
    apiClient.post(`/api/v1/owner/support-tickets/${id}/reply`, { message }).then(extractData),

  // Analytics
  getDashboard: () => apiClient.get('/api/v1/owner/analytics/dashboard').then(extractData),
  getPopularItems: () => apiClient.get('/api/v1/owner/analytics/popular-items').then(extractData),
  getOrdersTrend: (params) => apiClient.get('/api/v1/owner/analytics/orders-trend', { params }).then(extractData),
  getRatings: () => apiClient.get('/api/v1/owner/analytics/ratings').then(extractData),
};

// ─── Super Admin API ──────────────────────────────────────────────────────

export const adminApi = {
  // Restaurants
  listRestaurants: (params) => apiClient.get('/api/v1/admin/restaurants', { params }).then(extractData),
  createRestaurant: (data) => apiClient.post('/api/v1/admin/restaurants', data).then(extractData),
  getRestaurant: (id) => apiClient.get(`/api/v1/admin/restaurants/${id}`).then(extractData),
  updateRestaurant: (id, data) => apiClient.put(`/api/v1/admin/restaurants/${id}`, data).then(extractData),
  toggleStatus: (id, status) =>
    apiClient.patch(`/api/v1/admin/restaurants/${id}/status`, { status }).then(extractData),
  impersonate: (id) => apiClient.post(`/api/v1/admin/restaurants/${id}/impersonate`).then(extractData),

  // Plans
  listPlans: () => apiClient.get('/api/v1/admin/plans').then(extractData),
  createPlan: (data) => apiClient.post('/api/v1/admin/plans', data).then(extractData),
  getPlan: (id) => apiClient.get(`/api/v1/admin/plans/${id}`).then(extractData),
  updatePlan: (id, data) => apiClient.put(`/api/v1/admin/plans/${id}`, data).then(extractData),
  deletePlan: (id) => apiClient.delete(`/api/v1/admin/plans/${id}`).then(extractData),

  // Subscriptions
  listSubscriptions: (params) => apiClient.get('/api/v1/admin/subscriptions', { params }).then(extractData),
  getSubscription: (id) => apiClient.get(`/api/v1/admin/subscriptions/${id}`).then(extractData),
  updateSubscriptionStatus: (id, status) =>
    apiClient.patch(`/api/v1/admin/subscriptions/${id}/status`, { status }).then(extractData),

  // Support
  listTickets: (params) => apiClient.get('/api/v1/admin/support-tickets', { params }).then(extractData),
  getTicket: (id) => apiClient.get(`/api/v1/admin/support-tickets/${id}`).then(extractData),
  replyTicket: (id, message) =>
    apiClient.post(`/api/v1/admin/support-tickets/${id}/reply`, { message }).then(extractData),
  updateTicketStatus: (id, status) =>
    apiClient.patch(`/api/v1/admin/support-tickets/${id}/status`, { status }).then(extractData),

  // Analytics
  getDashboard: () => apiClient.get('/api/v1/admin/analytics/dashboard').then(extractData),
  getRevenue: (params) => apiClient.get('/api/v1/admin/analytics/revenue', { params }).then(extractData),
  getTrials: () => apiClient.get('/api/v1/admin/analytics/trials').then(extractData),

  // Invoices
  listInvoices: (params) => apiClient.get('/api/v1/admin/invoices', { params }).then(extractData),
  listSubscriptionInvoices: () => apiClient.get('/api/v1/admin/subscription-invoices').then(extractData),
};

// ─── Staff API ────────────────────────────────────────────────────────────

export const staffApi = {
  listOrders: (params) => apiClient.get('/api/v1/staff/orders', { params }).then(extractData),
  getOrder: (id) => apiClient.get(`/api/v1/staff/orders/${id}`).then(extractData),
  updateOrderStatus: (id, status) =>
    apiClient.patch(`/api/v1/staff/orders/${id}/status`, { status }).then(extractData),
  getKitchenBoard: () => apiClient.get('/api/v1/staff/kitchen/board').then(extractData),
};

// ─── Public / Customer API ────────────────────────────────────────────────

export const publicApi = {
  // Menu
  getTableMenu: (slug, tableNumber) =>
    apiClient.get(`/api/v1/public/menu/${slug}/table/${tableNumber}`).then(extractData),
  listCategories: (slug) =>
    apiClient.get(`/api/v1/public/menu/${slug}/categories`).then(extractData),
  listMenuItems: (slug, params) =>
    apiClient.get(`/api/v1/public/menu/${slug}/items`, { params }).then(extractData),
  getMenuItem: (slug, id) =>
    apiClient.get(`/api/v1/public/menu/${slug}/items/${id}`).then(extractData),

  // Orders
  placeOrder: (data) => apiClient.post('/api/v1/public/orders', data).then(extractData),
  getOrderStatus: (id) => apiClient.get(`/api/v1/public/orders/${id}`).then(extractData),
  cancelOrder: (id) => apiClient.post(`/api/v1/public/orders/${id}/cancel`).then(extractData),

  // Feedback
  submitFeedback: (data) => apiClient.post('/api/v1/public/feedback', data).then(extractData),

  // Invoices
  getOrderInvoice: (id) => apiClient.get(`/api/v1/public/orders/${id}/invoice`).then(extractData),
  downloadInvoice: (id) =>
    apiClient.get(`/api/v1/public/orders/${id}/invoice/download`, { responseType: 'blob' }).then(extractData),
};

// ─── Customer Auth API ────────────────────────────────────────────────────

export const customerAuthApi = {
  sendOTP: (data) => apiClient.post('/api/v1/customer/auth/send-otp', data).then(extractData),
  verifyOTP: (data) => apiClient.post('/api/v1/customer/auth/verify-otp', data).then(extractData),
  getProfile: () => apiClient.get('/api/v1/customer/profile').then(extractData),
  listOrders: (params) => apiClient.get('/api/v1/customer/orders', { params }).then(extractData),
};

// ─── Payments API ─────────────────────────────────────────────────────────

export const paymentsApi = {
  createOrder: (data) => apiClient.post('/api/v1/payments/razorpay/order', data).then(extractData),
  verifyPayment: (data) => apiClient.post('/api/v1/payments/razorpay/verify', data).then(extractData),
};

// ─── Analytics API ────────────────────────────────────────────────────────

export const analyticsApi = {
  getSummary: (params) => apiClient.get('/api/v1/analytics/summary', { params }).then(extractData),
  getDailyScans: (params) => apiClient.get('/api/v1/analytics/scans/daily', { params }).then(extractData),
  getTopItems: (params) => apiClient.get('/api/v1/analytics/menu/top-items', { params }).then(extractData),
  getMonthlyRevenue: (params) => apiClient.get('/api/v1/analytics/revenue/monthly', { params }).then(extractData),
};

// ─── Media Upload API ─────────────────────────────────────────────────────

export const mediaApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/v1/media/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(extractData);
  },
  uploadModel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/v1/media/upload/model', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(extractData);
  },
  delete: (publicId) => apiClient.delete(`/api/v1/media/${publicId}`).then(extractData),
};

// ─── Health API ───────────────────────────────────────────────────────────

export const healthApi = {
  check: () => apiClient.get('/api/v1/health').then(extractData),
};
