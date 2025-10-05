import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(typeof result.error === 'string' ? result.error : 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión');
    }
    
    setLoading(false);
  };

  // Usuarios de prueba eliminados por seguridad
  const testUsers = [];

  const setTestUser = (user) => {
    setFormData({
      email: user.email,
      password: user.password
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>💰 Sistema de Gastos</h1>
          <h2>GrupLomi</h2>
          <p>Inicia sesión para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
              disabled={loading}
              placeholder="usuario@gruplomi.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
              disabled={loading}
              placeholder="Ingresa tu contraseña"
            />
          </div>
          
          <button 
            type="submit" 
            className="button login-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="login-footer">
          <p><small>© 2025 GrupLomi - Sistema de Gestión de Gastos</small></p>
        </div>
      </div>
    </div>
  );
}

export default Login;