import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User API endpoints
const userAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getAll: () => api.get('/users'),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Complaint API endpoints
const complaintAPI = {
  create: (complaintData) => api.post('/complaints', complaintData),
  getAll: () => api.get('/complaints'),
  getByUser: (userId) => api.get(`/complaints?userId=${userId}`),
  update: (id, complaintData) => api.put(`/complaints/${id}`, complaintData),
  updateStatus: (id, statusData) => api.put(`/complaints/${id}/status`, statusData),
  escalate: (id, escalationData) => api.put(`/complaints/${id}/escalate`, escalationData),
  delete: (id) => api.delete(`/complaints/${id}`),
  getEligibleEscalation: () => api.get('/complaints/eligible-escalation'),
  getEligibleForEscalation: () => api.get('/complaints/eligible-escalation'), // Alias for compatibility
  triggerAutoEscalation: () => api.post('/complaints/auto-escalate'),
  processImage: (imageData) => api.post('/complaints/process-image', imageData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  }),
};

// Official API endpoints
const officialAPI = {
  register: (officialData) => api.post('/officials/register', officialData),
  login: (credentials) => api.post('/officials/login', credentials),
  getAll: () => api.get('/officials'),
  update: (id, officialData) => api.put(`/officials/${id}`, officialData),
  delete: (id) => api.delete(`/officials/${id}`),
  getDashboard: (department, designation, officialId) => {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (designation) params.append('designation', designation);
    if (officialId) params.append('officialId', officialId);
    return api.get(`/officials/dashboard?${params.toString()}`);
  }
};

// Validation API endpoints
const validationAPI = {
  create: (requestData) => api.post('/validation', requestData),
  getAll: () => api.get('/validation'),
  getPending: (userId) => api.get(`/validation/pending/${userId}`),
  update: (id, requestData) => api.put(`/validation/${id}`, requestData),
  delete: (id) => api.delete(`/validation/${id}`),
};

// System API endpoints
const systemAPI = {
  checkHash: () => api.get('/system/hash-check'),
};

// Prediction API endpoints (placeholder for now)
const predictionAPI = {
  predict: (imageData) => api.post('/predict', imageData),
};

export { api, userAPI, complaintAPI, officialAPI, validationAPI, systemAPI, predictionAPI };
export default api;