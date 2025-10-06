import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response || error.message);
    
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - Server took too long to respond';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network error - Make sure backend server is running on port 5000';
    } else if (error.response) {
      error.message = error.response.data?.error || error.response.data?.message || error.message;
    }
    
    return Promise.reject(error);
  }
);

// Scan endpoints
export const createScan = (data) => api.post('/scans', data);
export const getScan = (id) => api.get(`/scans/${id}`);
export const getAllScans = (params) => api.get('/scans', { params });
export const deleteScan = (id) => api.delete(`/scans/${id}`);

// Report endpoints
export const getStats = () => api.get('/reports/stats');
export const getTopViolations = () => api.get('/reports/top-violations');

// Health check
export const checkHealth = () => api.get('/health');

export default api;