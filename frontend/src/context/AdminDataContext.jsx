'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';

const AdminDataContext = createContext();

// Initial state
const initialState = {
  users: [],
  classes: [],
  webinars: [],
  dashboardStats: {},
  selectedUser: null,
  selectedClass: null,
  loading: false,
  error: null,
  filters: {
    userType: 'all',
    classStatus: 'all',
    dateRange: 'all',
  },
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USERS: 'SET_USERS',
  SET_CLASSES: 'SET_CLASSES',
  SET_WEBINARS: 'SET_WEBINARS',
  SET_DASHBOARD_STATS: 'SET_DASHBOARD_STATS',
  SET_SELECTED_USER: 'SET_SELECTED_USER',
  SET_SELECTED_CLASS: 'SET_SELECTED_CLASS',
  UPDATE_FILTERS: 'UPDATE_FILTERS',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
const adminDataReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case actionTypes.SET_USERS:
      return { ...state, users: action.payload };
    case actionTypes.SET_CLASSES:
      return { ...state, classes: action.payload };
    case actionTypes.SET_WEBINARS:
      return { ...state, webinars: action.payload };
    case actionTypes.SET_DASHBOARD_STATS:
      return { ...state, dashboardStats: action.payload };
    case actionTypes.SET_SELECTED_USER:
      return { ...state, selectedUser: action.payload };
    case actionTypes.SET_SELECTED_CLASS:
      return { ...state, selectedClass: action.payload };
    case actionTypes.UPDATE_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Context Provider
export const AdminDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminDataReducer, initialState);
  const adminHook = useAdmin();

  // Sync with useAdmin hook
  useEffect(() => {
    dispatch({ type: actionTypes.SET_USERS, payload: adminHook.users });
  }, [adminHook.users]);

  useEffect(() => {
    dispatch({ type: actionTypes.SET_CLASSES, payload: adminHook.classes });
  }, [adminHook.classes]);

  useEffect(() => {
    dispatch({ type: actionTypes.SET_WEBINARS, payload: adminHook.webinars });
  }, [adminHook.webinars]);

  useEffect(() => {
    dispatch({ type: actionTypes.SET_DASHBOARD_STATS, payload: adminHook.dashboardStats });
  }, [adminHook.dashboardStats]);

  useEffect(() => {
    dispatch({ type: actionTypes.SET_LOADING, payload: adminHook.loading });
  }, [adminHook.loading]);

  useEffect(() => {
    dispatch({ type: actionTypes.SET_ERROR, payload: adminHook.error });
  }, [adminHook.error]);

  // Context value
  const value = {
    ...state,
    // Actions
    setSelectedUser: (user) => dispatch({ type: actionTypes.SET_SELECTED_USER, payload: user }),
    setSelectedClass: (classItem) => dispatch({ type: actionTypes.SET_SELECTED_CLASS, payload: classItem }),
    updateFilters: (filters) => dispatch({ type: actionTypes.UPDATE_FILTERS, payload: filters }),
    clearError: () => dispatch({ type: actionTypes.CLEAR_ERROR }),
    // Admin operations
    fetchUsers: adminHook.fetchUsers,
    fetchClasses: adminHook.fetchClasses,
    fetchWebinars: adminHook.fetchWebinars,
    fetchDashboardStats: adminHook.fetchDashboardStats,
    updateUser: adminHook.updateUser,
    deleteUser: adminHook.deleteUser,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};

// Custom hook to use the context
export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};

export default AdminDataContext;