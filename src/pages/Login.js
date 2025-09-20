import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: 'admin@gruplomi.com',
    password: 'admin123'
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

  const testUsers = [
    { email: 'admin@gruplomi.com', password: 'admin123', role: 'Administrador' },
    { email: 'supervisor@gruplomi.com', password: 'super123', role: 'Supervisor' },
    { email: 'operario@gruplomi.com', password: 'opera123', role: 'Operario' },
    { email: 'contabilidad@gruplomi.com', password: 'conta123', role: 'Contabilidad' }
  ];

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
        
        <div className="test-users">
          <p><strong>Usuarios de prueba:</strong></p>
          <div className="test-users-grid">
            {testUsers.map((user, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setTestUser(user)}
                className="test-user-btn"
                disabled={loading}
              >
                <div className="test-user-role">{user.role}</div>
                <div className="test-user-email">{user.email}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="login-footer">
          <p><small>Haz clic en cualquier usuario para cargar sus credenciales</small></p>
        </div>
      </div>
    </div>
  );
}

export default Login;