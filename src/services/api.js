// Configuración de la API
import axios from 'axios';

// URL del backend correcto en Vercel
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://tickets-alpha-pink.vercel.app';

console.log('🌐 API_BASE_URL:', API_BASE_URL);

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 segundos para permitir subida de fotos grandes
  maxContentLength: 10000000, // 10MB máximo
  maxBodyLength: 10000000, // 10MB máximo
});

// Interceptor para añadir token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== FUNCIONES DE AUTENTICACIÓN ====================

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getMe: () => api.get('/auth/me'),
};

// ==================== FUNCIONES DE USUARIOS ====================

export const userService = {
  getAll: () => api.get('/usuarios'),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (userData) => api.post('/usuarios', userData),
  update: (id, userData) => api.put(`/usuarios/${id}`, userData),
  delete: (id) => api.delete(`/usuarios/${id}`),
};

// ==================== FUNCIONES DE GASTOS ====================

export const gastosService = {
  getAll: (params = {}) => api.get('/gastos', { params }),
  getById: (id) => api.get(`/gastos/${id}`),
  createGasto: (gastoData) => {
    // Para gastos con foto, aumentar timeout
    const config = gastoData.foto_justificante ? { timeout: 90000 } : {};
    return api.post('/gastos', gastoData, config);
  },
  update: (id, gastoData) => api.put(`/gastos/${id}`, gastoData),
  delete: (id) => api.delete(`/gastos/${id}`),
  aprobar: (id) => api.put(`/gastos/${id}`, { estado: 'aprobado' }),
  rechazar: (id, comentarios) => api.put(`/gastos/${id}`, { estado: 'rechazado', comentarios }),
};

// ==================== FUNCIONES DE CONFIGURACIÓN ====================

export const configService = {
  getSystemConfig: () => api.get('/config/sistema'),
  getAdminConfig: () => api.get('/config/admin'),
};

// Exportar tanto como default como named export
export default api;
export { api };
