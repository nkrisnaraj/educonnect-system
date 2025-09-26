import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Check sessionStorage first (matches AuthContext), then localStorage as fallback
      const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 API Request with token:', `${token.substring(0, 20)}...`);
      } else {
        console.log('⚠️ No token found in storage');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response?.status === 401) {
      console.log('🚪 401 Unauthorized - redirecting to login');
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Create a separate instance for long-running operations
export const apiLongTimeout = axios.create({
  baseURL: BASE_URL,
  timeout: 300000, // 5 minutes for long operations like Zoom sync
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add the same interceptors to the long timeout instance
apiLongTimeout.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 API Request (Long Timeout) with token:', `${token.substring(0, 20)}...`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiLongTimeout.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('❌ API Error (Long Timeout):', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response?.status === 401) {
      console.log('🚪 401 Unauthorized - redirecting to login');
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;