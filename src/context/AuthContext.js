import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, authAPI } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay token al cargar la página
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Intentar obtener info del usuario
      authAPI.me().then(response => {
        setUser(response.data);
        setIsAuthenticated(true);
      }).catch(() => {
        // Token inválido, limpiar
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Usar la función del authAPI que ya corregimos
      const response = await authAPI.login(email, password);

      if (response.data && response.data.access_token) {
        const token = response.data.access_token;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(response.data.user);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: 'Respuesta inválida del servidor' };
      }
    } catch (error) {
      console.error('Login error:', error.response?.data);
      setLoading(false);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Credenciales incorrectas' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}