import api, { apiLongTimeout } from './api';

export const adminApi = {
  // User management (Students) - using long timeout for large datasets
  getUsers: () => apiLongTimeout.get('/edu_admin/students/'),
  getUserById: (id) => api.get(`/edu_admin/students/${id}/`),
  updateUser: (id, data) => api.put(`/edu_admin/students/${id}/`, data),
  deleteUser: (id) => api.delete(`/edu_admin/students/${id}/`),
  
  // Class management
  getClasses: () => apiLongTimeout.get('/edu_admin/classes/'),
  getClassById: (id) => api.get(`/edu_admin/classes/${id}/`),
  createClass: (data) => api.post('/edu_admin/create_with_webinar/', data),
  updateClass: (id, data) => api.put(`/edu_admin/classes/${id}/update/`, data),
  deleteClass: (id) => api.delete(`/edu_admin/classes/${id}/`),
  
  // Webinar management - using long timeout for large datasets
  getWebinars: () => apiLongTimeout.get('/edu_admin/webinars-list/'),
  createWebinar: (data) => api.post('/edu_admin/create-webinar/', data),
  updateWebinar: (id, data) => api.put(`/edu_admin/webinars/${id}/`, data),
  deleteWebinar: (id) => api.delete(`/edu_admin/webinars/${id}/`),
  
  // Webinar sync operations
  comprehensiveSync: () => apiLongTimeout.post('/edu_admin/comprehensive-sync/'),
  getSyncStatus: () => api.get('/edu_admin/sync-status/'),
  
  // Zoom management
  getZoomAccounts: () => api.get('/edu_admin/zoom-accounts/'),
  
  // Payment management - using long timeout for large datasets
  getPayments: () => apiLongTimeout.get('/edu_admin/payments/'),
  updatePaymentStatus: (id, status) => api.put(`/edu_admin/payments/${id}/`, { status }),
  
  // Analytics
  getDashboardStats: () => api.get('/edu_admin/dashboard/'),
  getReports: () => apiLongTimeout.get('/edu_admin/reports/'),
  getPaymentAnalytics: () => apiLongTimeout.get('/edu_admin/payments/analytics/'),
  
  // Reports - using long timeout for report generation
  generateUserReport: () => apiLongTimeout.get('/edu_admin/reports/users/'),
  generateFinancialReport: () => apiLongTimeout.get('/edu_admin/reports/financial/'),
};

export default adminApi;