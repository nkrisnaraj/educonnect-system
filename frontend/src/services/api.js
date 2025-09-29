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

// Zoom OAuth API endpoints
export const zoomApi = {
  initiateLogin: () => api.get('/api/auth/zoom/login/'),
  handleCallback: (code, state) => api.get(`/api/auth/zoom/callback/?code=${code}&state=${state}`),
};

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
const apiLongTimeout = axios.create({
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
      const sessionToken = sessionStorage.getItem('accessToken');
      const localToken = localStorage.getItem('accessToken');
      const token = sessionToken || localToken;
      
      console.log('🔍 Token debug:', {
        sessionToken: sessionToken ? `${sessionToken.substring(0, 20)}...` : 'null',
        localToken: localToken ? `${localToken.substring(0, 20)}...` : 'null',
        finalToken: token ? `${token.substring(0, 20)}...` : 'undefined'
      });
      
      if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 API Request (Long Timeout) with token:', `${token.substring(0, 20)}...`);
      } else {
        console.log('⚠️ No valid token found - user may need to login again');
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
export { apiLongTimeout };

// Helper function to check current authentication status
export const checkAuthStatus = () => {
  const sessionToken = sessionStorage.getItem('accessToken');
  const localToken = localStorage.getItem('accessToken');
  const user = sessionStorage.getItem('user');
  const userRole = sessionStorage.getItem('userRole');
  
  console.log('🔍 Current auth status:', {
    hasSessionToken: !!sessionToken,
    hasLocalToken: !!localToken,
    hasUser: !!user,
    userRole: userRole,
    tokenPreview: sessionToken ? `${sessionToken.substring(0, 30)}...` : 'No token'
  });
  
  return {
    isAuthenticated: !!(sessionToken || localToken),
    hasUser: !!user,
    userRole: userRole,
    token: sessionToken || localToken
  };
};

// Function to validate token with backend
export const validateToken = async () => {
  const { token } = checkAuthStatus();
  
  if (!token || token === 'undefined' || token === 'null') {
    console.log('❌ No valid token to validate');
    return { valid: false, error: 'No token found' };
  }
  
  try {
    const response = await fetch('http://localhost:8000/edu_admin/validate-token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });
    
    const result = await response.json();
    console.log('🔍 Token validation result:', result);
    
    if (!result.valid) {
      // Clear invalid tokens
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Token validation error:', error);
    return { valid: false, error: error.message };
  }
};