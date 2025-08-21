import { useState, useEffect } from 'react';
import { adminApi } from '@/services/adminApi';

export const useAdmin = () => {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getClasses();
      setClasses(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch classes');
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getWebinars();
      setWebinars(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch webinars');
      console.error('Error fetching webinars:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboardStats();
      setDashboardStats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard stats');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, data) => {
    try {
      await adminApi.updateUser(id, data);
      await fetchUsers(); // Refresh users list
      return true;
    } catch (err) {
      setError('Failed to update user');
      console.error('Error updating user:', err);
      return false;
    }
  };

  const deleteUser = async (id) => {
    try {
      await adminApi.deleteUser(id);
      await fetchUsers(); // Refresh users list
      return true;
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
      return false;
    }
  };

  return {
    users,
    classes,
    webinars,
    dashboardStats,
    loading,
    error,
    fetchUsers,
    fetchClasses,
    fetchWebinars,
    fetchDashboardStats,
    updateUser,
    deleteUser,
  };
};

export default useAdmin;