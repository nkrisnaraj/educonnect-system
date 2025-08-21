import api from './api';

export const adminApi = {
  // User management (Students)
  getUsers: () => api.get('/edu_admin/students/'),
  getUserById: (id) => api.get(`/edu_admin/students/${id}/`),
  updateUser: (id, data) => api.put(`/edu_admin/students/${id}/`, data),
  deleteUser: (id) => api.delete(`/edu_admin/students/${id}/`),
  
  // Class management
  getClasses: () => api.get('/edu_admin/classes/'),
  getClassById: (id) => api.get(`/edu_admin/classes/${id}/`),
  createClass: (data) => api.post('/edu_admin/create_with_webinar/', data),
  updateClass: (id, data) => api.put(`/edu_admin/classes/${id}/update/`, data),
  deleteClass: (id) => api.delete(`/edu_admin/classes/${id}/`),
  
  // Webinar management
  getWebinars: () => api.get('/edu_admin/webinars-list/'),
  createWebinar: (data) => api.post('/edu_admin/create-webinar/', data),
  updateWebinar: (id, data) => api.put(`/edu_admin/webinars/${id}/`, data),
  deleteWebinar: (id) => api.delete(`/edu_admin/webinars/${id}/`),
  
  // Webinar sync operations
  comprehensiveSync: () => api.post('/edu_admin/comprehensive-sync/'),
  getSyncStatus: () => api.get('/edu_admin/sync-status/'),
  
  // Zoom management
  getZoomAccounts: () => api.get('/edu_admin/zoom-accounts/'),
  
  // Payment management
  getPayments: () => api.get('/edu_admin/payments/'),
  updatePaymentStatus: (id, status) => api.put(`/edu_admin/payments/${id}/`, { status }),
  
  // Analytics
  getDashboardStats: () => api.get('/edu_admin/dashboard/'),
  getReports: () => api.get('/edu_admin/reports/'),
  getPaymentAnalytics: () => api.get('/edu_admin/payments/analytics/'),
  
  // Reports (placeholder for future implementation)
  generateUserReport: () => api.get('/edu_admin/reports/users/'),
  generateFinancialReport: () => api.get('/edu_admin/reports/financial/'),
};

export default adminApi;