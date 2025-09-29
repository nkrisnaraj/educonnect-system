import { useState, useEffect } from 'react';
import api from '@/services/api';

export const useDashboard = (userType = 'student') => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      switch (userType) {
        case 'student':
          endpoint = '/api/students/dashboard/';
          break;
        case 'instructor':
          endpoint = '/api/instructor/dashboard/';
          break;
        case 'admin':
          endpoint = '/api/admin/dashboard/';
          break;
        default:
          endpoint = '/api/students/dashboard/';
      }

      const response = await api.get(endpoint);
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userType]);

  // Calculate derived stats
  const getStats = () => {
    if (!dashboardData) return {};

    const stats = {
      totalClasses: dashboardData.classes?.length || 0,
      upcomingClasses: dashboardData.classes?.filter(c => 
        new Date(c.date) > new Date()
      ).length || 0,
      completedClasses: dashboardData.classes?.filter(c => 
        new Date(c.date) < new Date()
      ).length || 0,
      totalWebinars: dashboardData.webinars?.length || 0,
    };

    if (userType === 'instructor') {
      stats.totalStudents = dashboardData.students?.length || 0;
      stats.totalEarnings = dashboardData.earnings?.total || 0;
    }

    if (userType === 'admin') {
      stats.totalUsers = dashboardData.users?.length || 0;
      stats.totalRevenue = dashboardData.revenue?.total || 0;
      stats.activeUsers = dashboardData.users?.filter(u => u.is_active).length || 0;
    }

    return stats;
  };

  return {
    dashboardData,
    loading,
    error,
    stats: getStats(),
    refreshData,
    fetchDashboardData,
  };
};

export default useDashboard;