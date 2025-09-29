import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

const BASE_URL = 'http://127.0.0.1:8000';

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
            
            const contentType = retryResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              return await retryResponse.json();
            }
            return retryResponse;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          logout();
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken, refreshAccessToken, logout]);

  // Get instructor's exams
  const getExams = useCallback(async () => {
    return await apiCall('/instructor/exams/');
  }, [apiCall]);

  // Create new exam
  const createExam = useCallback(async (examData) => {
    return await apiCall('/instructor/exams/', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }, [apiCall]);

  // Update exam
  const updateExam = useCallback(async (examId, examData) => {
    return await apiCall(`/instructor/exams/${examId}/`, {
      method: 'PUT',
      body: JSON.stringify(examData),
    });
  }, [apiCall]);

  // Delete exam
  const deleteExam = useCallback(async (examId) => {
    return await apiCall(`/instructor/exams/${examId}/`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  // Get exam results
  const getExamResults = useCallback(async () => {
    return await apiCall('/instructor/exam-results/');
  }, [apiCall]);

  // Get exam details with students
  const getExamDetails = useCallback(async (examId) => {
    return await apiCall(`/instructor/exams/${examId}/details/`);
  }, [apiCall]);

  // Get classes
  const getClasses = useCallback(async () => {
    return await apiCall('/instructor/instructor-classes/');
  }, [apiCall]);

  // Download CSV for specific exam
  const downloadExamResultsCSV = useCallback(async (examId) => {
    const downloadHelper = async (endpoint, token) => {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response;
    };

    try {
      setLoading(true);
      setError(null);
      
      let response = await downloadHelper(`/instructor/exams/${examId}/download-csv/`, accessToken);
      
      // Handle token refresh if unauthorized
      if (response.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            response = await downloadHelper(`/instructor/exams/${examId}/download-csv/`, newToken);
          } else {
            logout();
            throw new Error('Authentication failed');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          logout();
          throw new Error('Authentication failed');
        }
      }
      
      if (!response.ok) {
        throw new Error('Failed to download CSV');
      }
      
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error downloading CSV:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [accessToken, refreshAccessToken, logout, setLoading, setError]);

  // Download all exam results as CSV
  const downloadAllResultsCSV = useCallback(async () => {
    const downloadHelper = async (endpoint, token) => {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response;
    };

    try {
      setLoading(true);
      setError(null);
      
      let response = await downloadHelper('/instructor/download-all-results-csv/', accessToken);
      
      // Handle token refresh if unauthorized
      if (response.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            response = await downloadHelper('/instructor/download-all-results-csv/', newToken);
          } else {
            logout();
            throw new Error('Authentication failed');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          logout();
          throw new Error('Authentication failed');
        }
      }
      
      if (!response.ok) {
        throw new Error('Failed to download all results CSV');
      }
      
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error downloading all results CSV:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [accessToken, refreshAccessToken, logout, setLoading, setError]);

  // Download PDF for specific exam
  const downloadExamResultsPDF = useCallback(async (examId) => {
    const downloadHelper = async (endpoint, token) => {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response;
    };

    try {
      setLoading(true);
      setError(null);
      
      let response = await downloadHelper(`/instructor/exams/${examId}/download-pdf/`, accessToken);
      
      // Handle token refresh if unauthorized
      if (response.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            response = await downloadHelper(`/instructor/exams/${examId}/download-pdf/`, newToken);
          } else {
            logout();
            throw new Error('Authentication failed');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          logout();
          throw new Error('Authentication failed');
        }
      }
      
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [accessToken, refreshAccessToken, logout, setLoading, setError]);

  // Download all exam results as PDF
  const downloadAllResultsPDF = useCallback(async () => {
    const downloadHelper = async (endpoint, token) => {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response;
    };

    try {
      setLoading(true);
      setError(null);
      
      let response = await downloadHelper('/instructor/download-all-results-pdf/', accessToken);
      
      // Handle token refresh if unauthorized
      if (response.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            response = await downloadHelper('/instructor/download-all-results-pdf/', newToken);
          } else {
            logout();
            throw new Error('Authentication failed');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          logout();
          throw new Error('Authentication failed');
        }
      }
      
      if (!response.ok) {
        throw new Error('Failed to download all results PDF');
      }
      
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error downloading all results PDF:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [accessToken, refreshAccessToken, logout, setLoading, setError]);

  // Get students
  const getStudents = useCallback(async () => {
    return await apiCall('/instructor/students/');
  }, [apiCall]);

  // Get student performance
  const getStudentPerformance = useCallback(async (studentId) => {
    return await apiCall(`/instructor/student-performance/${studentId}/`);
  }, [apiCall]);

  // Get dashboard stats
  const getDashboardStats = useCallback(async () => {
    return await apiCall('/instructor/dashboard/stats/');
  }, [apiCall]);

  // Get courses
  const getCourses = useCallback(async () => {
    return await apiCall('/instructor/courses/');
  }, [apiCall]);

  // Create course
  const createCourse = useCallback(async (courseData) => {
    return await apiCall('/instructor/courses/', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }, [apiCall]);

  // Update course
  const updateCourse = useCallback(async (courseId, courseData) => {
    return await apiCall(`/instructor/courses/${courseId}/`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }, [apiCall]);

  // Delete course
  const deleteCourse = useCallback(async (courseId) => {
    return await apiCall(`/instructor/courses/${courseId}/`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  // Get announcements
  const getAnnouncements = useCallback(async () => {
    return await apiCall('/instructor/announcements/');
  }, [apiCall]);

  // Create announcement
  const createAnnouncement = useCallback(async (announcementData) => {
    return await apiCall('/instructor/announcements/', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
  }, [apiCall]);

  // Update announcement
  const updateAnnouncement = useCallback(async (announcementId, announcementData) => {
    return await apiCall(`/instructor/announcements/${announcementId}/`, {
      method: 'PUT',
      body: JSON.stringify(announcementData),
    });
  }, [apiCall]);

  // Delete announcement
  const deleteAnnouncement = useCallback(async (announcementId) => {
    return await apiCall(`/instructor/announcements/${announcementId}/`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  // Notifications API methods
  const getNotifications = useCallback(async () => {
    return await apiCall('/instructor/notifications/');
  }, [apiCall]);

  const markNotificationAsRead = useCallback(async (notificationId) => {
    return await apiCall(`/instructor/notifications/${notificationId}/mark-read/`, {
      method: 'POST',
    });
  }, [apiCall]);

  const markAllNotificationsAsRead = useCallback(async () => {
    return await apiCall('/instructor/notifications/mark-all-read/', {
      method: 'POST',
    });
  }, [apiCall]);

  const deleteNotification = useCallback(async (notificationId) => {
    return await apiCall(`/instructor/notifications/${notificationId}/delete/`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  const deleteAllNotifications = useCallback(async () => {
    return await apiCall('/instructor/notifications/delete-all/', {
      method: 'DELETE',
    });
  }, [apiCall]);

  // Notes API methods
  const getNotes = useCallback(async () => {
    return await apiCall('/instructor/notes/');
  }, [apiCall]);

  const createNote = useCallback(async (formData) => {
    return await apiCall('/instructor/notes/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });
  }, [accessToken, refreshAccessToken, logout]);

  const updateNote = useCallback(async (noteId, formData) => {
    return await apiCall(`/instructor/notes/${noteId}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });
  }, [accessToken, refreshAccessToken, logout]);

  const deleteNote = useCallback(async (noteId) => {
    return await apiCall(`/instructor/notes/${noteId}/`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  // Question management methods
  const getExamQuestions = useCallback(async (examId) => {
    return await apiCall(`/instructor/exams/${examId}/questions/`);
  }, [apiCall]);

  const createQuestion = useCallback(async (examId, questionData) => {
    return await apiCall(`/instructor/exams/${examId}/questions/`, {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }, [apiCall]);

  const updateQuestion = useCallback(async (examId, questionId, questionData) => {
    return await apiCall(`/instructor/exams/${examId}/questions/${questionId}/`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  }, [apiCall]);

  const deleteQuestion = useCallback(async (examId, questionId) => {
    return await apiCall(`/instructor/exams/${examId}/questions/${questionId}/`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  // Exam management methods
  const duplicateExam = useCallback(async (examId) => {
    return await apiCall(`/instructor/exams/${examId}/duplicate/`, {
      method: 'POST',
    });
  }, [apiCall]);

  const publishExam = useCallback(async (examId) => {
    return await apiCall(`/instructor/exams/${examId}/publish/`, {
      method: 'POST',
    });
  }, [apiCall]);

  const getExamSubmissions = useCallback(async (examId) => {
    return await apiCall(`/instructor/exams/${examId}/submissions/`);
  }, [apiCall]);

  const getExamAnalytics = useCallback(async (examId) => {
    return await apiCall(`/instructor/exams/${examId}/analytics/`);
  }, [apiCall]);

  return {
    loading,
    error,
    // Exam methods
    getExams,
    createExam,
    updateExam,
    deleteExam,
    getExamResults,
    getExamDetails,
    // Classes methods
    getClasses,
    // Download methods
    downloadExamResultsCSV,
    downloadAllResultsCSV,
    downloadExamResultsPDF,
    downloadAllResultsPDF,
    // Student methods
    getStudents,
    getStudentPerformance,
    // Dashboard methods
    getDashboardStats,
    // Course methods
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    // Announcement methods
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    // Notes methods
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    // Question methods
    getExamQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    // Exam management methods
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