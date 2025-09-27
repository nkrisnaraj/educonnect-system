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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('API call failed:', err);
      setError(err.message);
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