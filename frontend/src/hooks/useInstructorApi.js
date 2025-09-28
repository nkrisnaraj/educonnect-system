import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

const BASE_URL = 'http://127.0.0.1:8000/instructor';

export const useInstructorApi = () => {
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

  // Classes API methods
  const getClasses = useCallback(async () => {
    return await apiCall('/instructor/classes/');
  }, [apiCall]);

  const createClass = useCallback(async (classData) => {
    return await apiCall('/classes/', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  }, [apiCall]);

  const updateClass = useCallback(async (classId, classData) => {
    return await apiCall(`/classes/${classId}/`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    });
  }, [apiCall]);

  const deleteClass = useCallback(async (classId) => {
    return await apiCall(`/classes/${classId}/`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  // Students API methods
  const getStudents = useCallback(async () => {
    return await apiCall('/students/');
  }, [apiCall]);

  const getStudentsWithChats = useCallback(async () => {
    return await apiCall('/chat/instructor/students/');
  }, [apiCall]);

  // Study Notes API methods
  const getNotes = useCallback(async (searchQuery = '', relatedClass = '') => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (relatedClass) params.append('related_class', relatedClass);
    
    return await apiCall(`/notes/?${params.toString()}`);
  }, [apiCall]);

  const createNote = useCallback(async (noteData) => {
    // For file uploads, don't set Content-Type header
    return await fetch(`${BASE_URL}/notes/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: noteData, // FormData object
    });
  }, [accessToken]);

  const updateNote = useCallback(async (noteId, noteData) => {
    return await apiCall(`/notes/${noteId}/`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }, [apiCall]);

  const deleteNote = useCallback(async (noteId) => {
    return await apiCall(`/notes/${noteId}/`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  // Profile API methods
  const getProfile = useCallback(async () => {
    return await apiCall('/profile/');
  }, [apiCall]);

  const updateProfile = useCallback(async (profileData) => {
    return await fetch(`${BASE_URL}/profile/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: profileData, // FormData for file uploads
    });
  }, [accessToken]);

  // Webinars API methods
  const getWebinars = useCallback(async () => {
    return await apiCall('/classes/');
  }, [apiCall]);

  // Chat API methods
  const getChatMessages = useCallback(async (studentId) => {
    return await apiCall(`/chat/instructor/${studentId}/`);
  }, [apiCall]);

  const sendMessage = useCallback(async (studentId, message) => {
    return await apiCall(`/chat/instructor/${studentId}/send/`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }, [apiCall]);

  const markMessagesRead = useCallback(async (studentId) => {
    return await apiCall(`/chat/instructor/${studentId}/mark_messages_read/`, {
      method: 'POST',
    });
  }, [apiCall]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Generic fetch method for backward compatibility
  const fetchData = useCallback(async (endpoint) => {
    return await apiCall(endpoint);
  }, [apiCall]);

  // Enhanced Exam API functions
  const getExams = useCallback(async () => {
    return await apiCall('/exams/');
  }, [apiCall]);

  const createExam = useCallback(async (examData) => {
    return await apiCall('/exams/', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }, [apiCall]);

  const getExam = useCallback(async (examId) => {
    return await apiCall(`/exams/${examId}/`);
  }, [apiCall]);

  const updateExam = useCallback(async (examId, examData) => {
    return await apiCall(`/exams/${examId}/`, {
      method: 'PUT',
      body: JSON.stringify(examData),
    });
  }, [apiCall]);

  const deleteExam = useCallback(async (examId) => {
    return await apiCall(`/exams/${examId}/`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  const getExamQuestions = useCallback(async (examId) => {
    return await apiCall(`/exams/${examId}/questions/`);
  }, [apiCall]);

  const createQuestion = useCallback(async (examId, questionData) => {
    return await apiCall(`/exams/${examId}/questions/`, {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }, [apiCall]);

  const updateQuestion = useCallback(async (examId, questionId, questionData) => {
    return await apiCall(`/exams/${examId}/questions/${questionId}/`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  }, [apiCall]);

  const deleteQuestion = useCallback(async (examId, questionId) => {
    return await apiCall(`/exams/${examId}/questions/${questionId}/`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  const duplicateExam = useCallback(async (examId) => {
    return await apiCall(`/exams/${examId}/duplicate/`, {
      method: 'POST',
    });
  }, [apiCall]);

  const publishExam = useCallback(async (examId) => {
    return await apiCall(`/exams/${examId}/publish/`, {
      method: 'POST',
    });
  }, [apiCall]);

  const getExamSubmissions = useCallback(async (examId) => {
    return await apiCall(`/exams/${examId}/submissions/`);
  }, [apiCall]);

  const getExamAnalytics = useCallback(async (examId) => {
    return await apiCall(`/exams/${examId}/analytics/`);
  }, [apiCall]);

  // Notifications API methods
  const getNotifications = useCallback(async () => {
    return await apiCall('/notifications/');
  }, [apiCall]);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    return await apiCall(`/notifications/${notificationId}/mark-read/`, {
      method: 'POST',
    });
  }, [apiCall]);

  const markAllNotificationsAsRead = useCallback(async () => {
    return await apiCall('/notifications/mark-all-read/', {
      method: 'POST',
    });
  }, [apiCall]);

  const deleteNotification = useCallback(async (notificationId) => {
    return await apiCall(`/notifications/${notificationId}/delete/`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  const deleteAllNotifications = useCallback(async () => {
    return await apiCall('/notifications/delete-all/', {
      method: 'DELETE',
    });
  }, [apiCall]);

  return {
    loading,
    error,
    clearError,
    fetchData,
    // Classes
    getClasses,
    createClass,
    updateClass,
    deleteClass,
    // Students
    getStudents,
    getStudentsWithChats,
    // Webinars
    getWebinars,
    // Notes
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    // Profile
    getProfile,
    updateProfile,
    // Chat
    getChatMessages,
    sendMessage,
    markMessagesRead,
    // Enhanced Exams
    getExams,
    createExam,
    getExam,
    updateExam,
    deleteExam,
    getExamQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateExam,
    publishExam,
    getExamSubmissions,
    getExamAnalytics,
    // Notifications
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
};