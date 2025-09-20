import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';

function Dashboard() {
  const { user } = useAuth();
  const { config, t, darkMode, currentLanguage } = useConfig();
  
  // Obtener la URL de la API desde la configuración
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  return (
    <div className="container">
      <div className="card dashboard-card">
        <div className="card-header dashboard-header">
          <div className="dashboard-title-section">
            <h2 className="card-title">{t('dashboard')} - {config.empresa.nombre}</h2>
          </div>
        </div>
        
        <div className="card-body">
          <div className="welcome-section">
            <h3 className="welcome-title">
              {t('bienvenida')}
            </h3>
            <p className="welcome-text">
              {t('hola') || 'Hola'} <strong>{user?.nombre || user?.email}</strong>, 
              {t('tienes_rol') || 'tienes rol de'} <strong>{user?.role === 'admin' ? t('administrador') || 'Administrador' : t('usuario') || 'Usuario'}</strong>
            </p>
          </div>
          
          <div className="status-section">
            <h3 className="section-title">{t('estado_sistema')}</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-icon">✅</span>
                <span>{t('api_funcionando') || 'API funcionando'}</span>
              </div>
              <div className="status-item">
                <span className="status-icon">✅</span>
                <span>{t('autenticacion_activa') || 'Autenticación activa'}</span>
              </div>
              <div className="status-item">
                <span className="status-icon">✅</span>
                <span>{t('configuracion_cargada') || 'Configuración cargada'}</span>
              </div>
              <div className="status-item">
                <span className="status-icon">✅</span>
                <span>{t('tema') || 'Tema'}: {darkMode ? t('oscuro') || 'Oscuro' : t('claro') || 'Claro'}</span>
              </div>
              <div className="status-item">
                <span className="status-icon">✅</span>
                <span>{t('idioma')}: {currentLanguage.toUpperCase()}</span>
              </div>
            </div>
          </div>
          
          <div className="features-section">
            <h3 className="section-title">{t('funcionalidades')}</h3>
            <div className="features-grid">
              <div className="feature-card">
                <span className="feature-icon">📋</span>
                <h4>{t('gestion_de') || 'Gestión de'} {t('tickets')}</h4>
                <p>{config.tickets.estados.length} {t('estados_disponibles') || 'estados disponibles'}</p>
              </div>
              
              {user?.role === 'admin' && (
                <div className="feature-card">
                  <span className="feature-icon">👥</span>
                  <h4>{t('administracion_de') || 'Administración de'} {t('usuarios')}</h4>
                  <p>{t('gestion_completa_usuarios') || 'Gestión completa de usuarios'}</p>
                </div>
              )}
              
              {user?.role === 'admin' && (
                <div className="feature-card">
                  <span className="feature-icon">⚙️</span>
                  <h4>{t('configuracion')} {t('del_sistema') || 'del sistema'}</h4>
                  <p>{t('personalizacion_avanzada') || 'Personalización avanzada'}</p>
                </div>
              )}
              
              <div className="feature-card">
                <span className="feature-icon">📊</span>
                <h4>{t('reportes_estadisticas') || 'Reportes y estadísticas'}</h4>
                <p>{t('analisis_metricas') || 'Análisis y métricas'}</p>
              </div>
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className="admin-panel">
              <h4 className="admin-title">{t('panel_administrador') || 'Panel de Administrador'}</h4>
              <p className="admin-text">
                {t('como_administrador') || 'Como administrador, puedes personalizar mensajes, colores, categorías de tickets y más desde la sección de'} {t('configuracion').toLowerCase()}. {t('controles_navbar') || 'Los controles de idioma y tema están disponibles en la barra de navegación superior'}.
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