import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth APIs
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Profile APIs
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data: any) => api.put('/profile', data),
};

// Document APIs
export const documentAPI = {
  upload: (formData: FormData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => api.get('/documents'),
  delete: (filename: string) => api.delete(`/documents/${filename}`),
};

// Chat APIs
export const chatAPI = {
  createSession: (title?: string) => api.post('/chat', { title }),
  getSessions: () => api.get('/chat'),
  getSession: (sessionId: string) => api.get(`/chat/${sessionId}`),
  sendMessage: (sessionId: string, message: string) =>
    api.post(`/chat/${sessionId}/chat`, { message }),
  updateSession: (sessionId: string, title: string) =>
    api.patch(`/chat/${sessionId}`, { title }),
  deleteSession: (sessionId: string) => api.delete(`/chat/${sessionId}`),
};
