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
    try {
      let response = await fetch(`${BASE_URL}/instructor/exams/${examId}/download-csv/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      // Handle token refresh if unauthorized
      if (response.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            response = await fetch(`${BASE_URL}/instructor/exams/${examId}/download-csv/`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${newToken}`,
              },
            });
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
      throw error;
    }
  }, [accessToken, refreshAccessToken, logout]);

  // Download all exam results as CSV
  const downloadAllResultsCSV = useCallback(async () => {
    try {
      let response = await fetch(`${BASE_URL}/instructor/download-all-results-csv/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      // Handle token refresh if unauthorized
      if (response.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            response = await fetch(`${BASE_URL}/instructor/download-all-results-csv/`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${newToken}`,
              },
            });
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
      throw error;
    }
  }, [accessToken, refreshAccessToken, logout]);

  // Download PDF for specific exam
  const downloadExamResultsPDF = useCallback(async (examId) => {
    try {
      let response = await fetch(`${BASE_URL}/instructor/exams/${examId}/download-pdf/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      // Handle token refresh if unauthorized
      if (response.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            response = await fetch(`${BASE_URL}/instructor/exams/${examId}/download-pdf/`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${newToken}`,
              },
            });
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
      throw error;
    }
  }, [accessToken, refreshAccessToken, logout]);

  // Download all exam results as PDF
  const downloadAllResultsPDF = useCallback(async () => {
    try {
      let response = await fetch(`${BASE_URL}/instructor/download-all-results-pdf/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      // Handle token refresh if unauthorized
      if (response.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            response = await fetch(`${BASE_URL}/instructor/download-all-results-pdf/`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${newToken}`,
              },
            });
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
      throw error;
    }
  }, [accessToken, refreshAccessToken, logout]);

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
  };
};