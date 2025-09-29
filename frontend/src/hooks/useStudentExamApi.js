import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

const BASE_URL = 'http://127.0.0.1:8000/students';

export const useStudentExamApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { accessToken, refreshAccessToken, logout } = useAuth();

  const apiCall = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
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
            const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
              ...options,
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
                ...options.headers,
              },
            });
            
            if (!retryResponse.ok) {
              const errorData = await retryResponse.json().catch(() => ({}));
              throw new Error(errorData.error || `HTTP error! status: ${retryResponse.status}`);
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
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `HTTP error! status: ${response.status}`);
        error.response = { status: response.status, data: errorData };
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('API call failed:', err);
      
      // Set more user-friendly error messages
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else if (err.response?.status === 404) {
        setError('Resource not found.');
      } else if (err.response?.status === 403) {
        setError(err.response.data?.error || 'Access denied.');
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken, refreshAccessToken, logout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Student Exam API functions
  const getAvailableExams = useCallback(async () => {
    return await apiCall('/exams/');
  }, [apiCall]);

  const getExamDetails = useCallback(async (examId) => {
    return await apiCall(`/exams/${examId}/`);
  }, [apiCall]);

  const startExamAttempt = useCallback(async (examId) => {
    return await apiCall(`/exams/${examId}/start/`, {
      method: 'POST',
    });
  }, [apiCall]);

  const submitExamAnswers = useCallback(async (examId, answers) => {
    return await apiCall(`/exams/${examId}/submit/`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }, [apiCall]);

  const getExamResults = useCallback(async (examId) => {
    return await apiCall(`/exams/${examId}/results/`);
  }, [apiCall]);

  return {
    loading,
    error,
    clearError,
    // Exam functions
    getAvailableExams,
    getExamDetails,
    startExamAttempt,
    submitExamAnswers,
    getExamResults,
  };
};