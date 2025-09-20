import axios from 'axios';

// Configuración base de la API usando variable de entorno
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funciones específicas para la API
export const authAPI = {
  login: (email, password) => {
    // Cambiar a JSON en lugar de FormData
    return api.post('/auth/login', {
      username: email,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  
  me: () => 
    api.get('/auth/me'),
};

export const ticketsAPI = {
  getAll: (params = {}) => 
    api.get('/tickets', { params }),
  
  getById: (id) => 
    api.get(`/tickets/${id}`),
  
  create: (data) => 
    api.post('/tickets', data),
  
  update: (id, data) => 
    api.put(`/tickets/${id}`, data),
  
  delete: (id) => 
    api.delete(`/tickets/${id}`),
  
  updateStatus: (id, status) =>
    api.patch(`/tickets/${id}/status`, { status }),
};

export const usersAPI = {
  getAll: (params = {}) => 
    api.get('/usuarios', { params }),
  
  getById: (id) => 
    api.get(`/usuarios/${id}`),
  
  create: (data) => 
    api.post('/usuarios', data),
  
  update: (id, data) => 
    api.put(`/usuarios/${id}`, data),
  
  delete: (id) => 
    api.delete(`/usuarios/${id}`),
};

export const configAPI = {
  get: () => 
    api.get('/config'),
  
  update: (data) => 
    api.put('/config', data),
};