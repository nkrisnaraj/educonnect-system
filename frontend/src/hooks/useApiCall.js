import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { accessToken, refreshAccessToken, logout } = useAuth();

  const apiCall = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (response.status === 401) {
        // Try to refresh token
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            // Retry with new token
            const retryResponse = await fetch(url, {
              ...options,
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
                ...options.headers,
              },
            });
            
            if (!retryResponse.ok) {
              throw new Error(`HTTP error! status: ${retryResponse.status}`);
            }
            
            const data = await retryResponse.json();
            return data;
          } else {
            logout();
            return null;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          logout();
          return null;
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('API call failed:', err);
      setError(err.message || 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [accessToken, refreshAccessToken, logout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { apiCall, loading, error, clearError };
};