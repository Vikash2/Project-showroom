import axios from 'axios';
import { auth } from '../config/firebase';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - token expired or invalid
        console.error('Authentication error:', data);
      } else if (status === 403) {
        // Forbidden - insufficient permissions
        console.error('Permission denied:', data);
      }
      
      // Return formatted error
      return Promise.reject({
        code: data.code || 'UNKNOWN_ERROR',
        message: data.error || 'An error occurred',
        details: data.details,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server. Please check your internet connection.',
      });
    } else {
      // Something else happened
      return Promise.reject({
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

export default api;
