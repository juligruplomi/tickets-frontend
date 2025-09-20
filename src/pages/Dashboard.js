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
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">{t('dashboard')} - {config.empresa.nombre}</h2>
            
            {/* Controles minimalistas en la esquina */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select 
                value={currentLanguage} 
                onChange={(e) => changeLanguage(e.target.value)}
                style={{ 
                  padding: '5px 8px', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--card-background)',
                  color: 'var(--text-color)',
                  fontSize: '14px'
                }}
              >
                <option value="es">🇪🇸 ES</option>
                <option value="en">🇬🇧 EN</option>
                <option value="ca">🏴󠁥󠁳󠁣󠁴󠁿 CA</option>
                <option value="de">🇩🇪 DE</option>
                <option value="it">🇮🇹 IT</option>
                <option value="pt">🇵🇹 PT</option>
              </select>
              
              <button
                onClick={toggleDarkMode}
                style={{
                  padding: '5px 8px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          <div style={{ 
            padding: '20px', 
            backgroundColor: `${config.empresa.colores.secundario}20`,
            borderLeft: `4px solid ${config.empresa.colores.primario}`,
            marginBottom: '20px',
            borderRadius: '4px'
          }}>
            <h3 style={{ color: config.empresa.colores.primario, margin: '0 0 10px 0' }}>
              {t('bienvenida')}
            </h3>
            <p style={{ margin: 0 }}>
              Hola <strong>{user?.nombre || user?.email}</strong>, 
              tienes rol de <strong>{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</strong>
            </p>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h3>{t('estado_sistema') || 'Estado del sistema'}:</h3>
            <ul>
              <li>✅ API funcionando en: <strong>{apiUrl}</strong></li>
              <li>✅ Autenticación activa</li>
              <li>✅ Configuración cargada</li>
              <li>✅ Tema: {darkMode ? 'Oscuro' : 'Claro'}</li>
              <li>✅ Idioma: {currentLanguage.toUpperCase()}</li>
            </ul>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h3>{t('funcionalidades') || 'Funcionalidades disponibles'}:</h3>
            <ul>
              <li>📋 Gestión de {t('tickets')} ({config.tickets.estados.length} estados disponibles)</li>
              <li>👥 Administración de {t('usuarios')} {user?.role === 'admin' ? '(Disponible)' : '(Solo Admin)'}</li>
              <li>⚙️ {t('configuracion')} del sistema {user?.role === 'admin' ? '(Disponible)' : '(Solo Admin)'}</li>
              <li>📊 Reportes y estadísticas</li>
            </ul>
          </div>

          {user?.role === 'admin' && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px',
              backgroundColor: `${config.empresa.colores.acento}20`,
              borderRadius: '5px',
              border: `1px solid ${config.empresa.colores.acento}40`
            }}>
              <h4 style={{ color: config.empresa.colores.acento, margin: '0 0 10px 0' }}>
                Panel de Administrador
              </h4>
              <p style={{ margin: 0 }}>
                Como administrador, puedes personalizar mensajes, colores, categorías de tickets y más 
                desde la sección de {t('configuracion').toLowerCase()}.
              </p>
            </div>
          )}

          <div style={{ 
            marginTop: '30px', 
            paddingTop: '20px', 
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
            color: darkMode ? '#ccc' : '#666',
            fontSize: '14px'
          }}>
            {t('footer')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;