import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Scan endpoints
export const createScan = (data) => api.post('/scans', data);
export const getScan = (id) => api.get(`/scans/${id}`);
export const getAllScans = (params) => api.get('/scans', { params });
export const deleteScan = (id) => api.delete(`/scans/${id}`);

// Report endpoints
export const getStats = () => api.get('/reports/stats');
export const getTopViolations = () => api.get('/reports/top-violations');

export default api;