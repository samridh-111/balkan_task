import axios from 'axios';
import { toast } from 'sonner';

// Event emitter for auth state changes
const authEvents = {
  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  emit(event, data) {
    this.listeners.forEach(listener => listener(event, data));
  }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Handle authentication errors
    if (response?.status === 401) {
      // Clear auth data but don't redirect - let the router guards handle it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Emit event to notify auth context
      authEvents.emit('logout');
      return Promise.reject(error);
    }

    // Handle quota exceeded errors
    if (response?.status === 413 || response?.data?.error?.includes('quota')) {
      toast.error('Storage Quota Exceeded', {
        description: 'You have reached your storage limit. Please delete some files or contact support.',
        duration: 5000,
      });
      return Promise.reject(error);
    }

    // Handle rate limit errors
    if (response?.status === 429 || response?.data?.error?.includes('rate limit')) {
      toast.error('Rate Limit Exceeded', {
        description: 'Too many requests. Please wait a moment before trying again.',
        duration: 3000,
      });
      return Promise.reject(error);
    }

    // Handle server errors
    if (response?.status >= 500) {
      toast.error('Server Error', {
        description: 'Something went wrong on our end. Please try again later.',
        duration: 3000,
      });
    }

    // Handle other client errors (400-499)
    if (response?.status >= 400 && response?.status < 500 && response?.status !== 401) {
      const message = response?.data?.error || 'Request failed';
      toast.error('Request Error', {
        description: message,
        duration: 3000,
      });
    }

    return Promise.reject(error);
  }
);

export { authEvents };
export default api;