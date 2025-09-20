import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';

function Dashboard() {
  const { user } = useAuth();
  const { config, t, toggleDarkMode, darkMode, changeLanguage, currentLanguage } = useConfig();
  
  // Obtener la URL de la API desde la configuración
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  return (
    <div className="container">
      <div className="card dashboard-card">
        <div className="card-header dashboard-header">
          <div className="dashboard-title-section">
            <h2 className="card-title">{t('dashboard')} - {config.empresa.nombre}</h2>
          </div>
          
          {/* Controles integrados en el header */}
          <div className="dashboard-controls">
            <div className="language-selector">
              <select 
                value={currentLanguage} 
                onChange={(e) => changeLanguage(e.target.value)}
                className="control-select"
              >
                <option value="es">🇪🇸</option>
                <option value="en">🇬🇧</option>
                <option value="ca">🏴󠁥󠁳󠁣󠁴󠁿</option>
                <option value="de">🇩🇪</option>
                <option value="it">🇮🇹</option>
                <option value="pt">🇵🇹</option>
              </select>
            </div>
            
            {/* Toggle switch estilo Apple */}
            <div className="theme-toggle">
              <input
                type="checkbox"
                id="darkModeToggle"
                checked={darkMode}
                onChange={toggleDarkMode}
                className="toggle-checkbox"
              />
              <label htmlFor="darkModeToggle" className="toggle-label">
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          <div className="welcome-section">
            <h3 className="welcome-title">
              {t('bienvenida')}
            </h3>
            <p className="welcome-text">
              Hola <strong>{user?.nombre || user?.email}</strong>, 
              tienes rol de <strong>{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</strong>
            </p>
          </div>
          
          <div className="status-section">
            <h3 className="section-title">{t('estado_sistema') || 'Estado del sistema'}</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-icon">✅</span>
                <span>API funcionando</span>
              </div>
              <div className="status-item">
                <span className="status-icon">✅</span>
                <span>Autenticación activa</span>
              </div>
              <div className="status-item">
                <span className="status-icon">✅</span>
                <span>Configuración cargada</span>
              </div>
              <div className="status-item">
                <span className="status-icon">✅</span>
                <span>Tema: {darkMode ? 'Oscuro' : 'Claro'}</span>
              </div>
              <div className="status-item">
                <span className="status-icon">✅</span>
                <span>Idioma: {currentLanguage.toUpperCase()}</span>
              </div>
            </div>
          </div>
          
          <div className="features-section">
            <h3 className="section-title">{t('funcionalidades') || 'Funcionalidades disponibles'}</h3>
            <div className="features-grid">
              <div className="feature-card">
                <span className="feature-icon">📋</span>
                <h4>Gestión de {t('tickets')}</h4>
                <p>{config.tickets.estados.length} estados disponibles</p>
              </div>
              
              {user?.role === 'admin' && (
                <div className="feature-card">
                  <span className="feature-icon">👥</span>
                  <h4>Administración de {t('usuarios')}</h4>
                  <p>Gestión completa de usuarios</p>
                </div>
              )}
              
              {user?.role === 'admin' && (
                <div className="feature-card">
                  <span className="feature-icon">⚙️</span>
                  <h4>{t('configuracion')} del sistema</h4>
                  <p>Personalización avanzada</p>
                </div>
              )}
              
              <div className="feature-card">
                <span className="feature-icon">📊</span>
                <h4>Reportes y estadísticas</h4>
                <p>Análisis y métricas</p>
              </div>
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className="admin-panel">
              <h4 className="admin-title">Panel de Administrador</h4>
              <p className="admin-text">
                Como administrador, puedes personalizar mensajes, colores, categorías de tickets y más 
                desde la sección de {t('configuracion').toLowerCase()}.
              </p>
            </div>
          )}

          <div className="footer-section">
            {t('footer')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;