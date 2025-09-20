import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { api } from '../services/api';

function Dashboard() {
  const { user } = useAuth();
  const { config, t, darkMode, currentLanguage } = useConfig();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/reportes/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    switch(role) {
      case 'administrador': return 'Administrador';
      case 'supervisor': return 'Supervisor';
      case 'operario': return 'Operario';
      case 'contabilidad': return 'Contabilidad';
      default: return role;
    }
  };

  const getRoleFeatures = (role) => {
    switch(role) {
      case 'administrador':
        return [
          { icon: '💰', title: 'Gestión Completa de Gastos', desc: 'Ver, aprobar y gestionar todos los gastos' },
          { icon: '👥', title: 'Administración de Usuarios', desc: 'Crear y gestionar usuarios del sistema' },
          { icon: '⚙️', title: 'Configuración del Sistema', desc: 'Personalizar límites, categorías y configuración' },
          { icon: '📊', title: 'Reportes Avanzados', desc: 'Análisis completo y exportación de datos' }
        ];
      case 'supervisor':
        return [
          { icon: '✅', title: 'Aprobación de Gastos', desc: 'Revisar y aprobar gastos de tu equipo' },
          { icon: '🔍', title: 'Supervisión de Equipo', desc: 'Monitorear gastos del departamento' },
          { icon: '📋', title: 'Reportes de Departamento', desc: 'Estadísticas y análisis de tu área' }
        ];
      case 'operario':
        return [
          { icon: '➕', title: 'Crear Gastos', desc: 'Registrar dietas, combustible, parking y otros' },
          { icon: '📱', title: 'Mis Gastos', desc: 'Ver el estado de tus gastos registrados' },
          { icon: '📎', title: 'Adjuntar Justificantes', desc: 'Subir tickets y comprobantes' }
        ];
      case 'contabilidad':
        return [
          { icon: '💳', title: 'Gestión de Pagos', desc: 'Procesar y registrar pagos de gastos' },
          { icon: '📊', title: 'Reportes Financieros', desc: 'Análisis contable y exportación' },
          { icon: '🧾', title: 'Conciliación', desc: 'Validar y conciliar gastos aprobados' }
        ];
      default:
        return [];
    }
  };

  const getAccessibleSections = (role) => {
    const sections = {
      'administrador': ['gastos', 'usuarios', 'configuracion', 'reportes'],
      'supervisor': ['gastos', 'reportes'],
      'operario': ['gastos'],
      'contabilidad': ['gastos', 'reportes']
    };
    return sections[role] || ['gastos'];
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card dashboard-card">
        <div className="card-header dashboard-header">
          <div className="dashboard-title-section">
            <h2 className="card-title">📊 Panel de Control</h2>
          </div>
        </div>
        
        <div className="card-body">
          {/* Sección de bienvenida específica para gastos */}
          <div className="welcome-section">
            <h3 className="welcome-title">
              Bienvenido al Sistema de Gestión de Gastos
            </h3>
            <p className="welcome-text">
              Hola <strong>{user?.nombre || user?.email}</strong>, 
              tienes rol de <strong>{getRoleDisplayName(user?.role)}</strong>
              {user?.departamento && ` en el departamento de ${user.departamento}`}
            </p>
          </div>
          
          {/* Estadísticas del dashboard */}
          {dashboardData && (
            <div className="stats-section">
              <h3 className="section-title">Resumen de Gastos</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-content">
                    <div className="stat-number">{dashboardData.total_gastos}</div>
                    <div className="stat-label">Total Gastos</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <div className="stat-number">{dashboardData.total_importe.toFixed(2)}€</div>
                    <div className="stat-label">Importe Total</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-content">
                    <div className="stat-number">{dashboardData.pendientes}</div>
                    <div className="stat-label">Pendientes</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <div className="stat-number">{dashboardData.aprobados}</div>
                    <div className="stat-label">Aprobados</div>
                  </div>
                </div>
              </div>
              
              {/* Estadísticas por tipo de gasto */}
              <div className="expense-types-section">
                <h4 className="section-title">Gastos por Tipo</h4>
                <div className="expense-types-grid">
                  <div className="expense-type-card">
                    <span className="expense-icon">🍽️</span>
                    <div className="expense-info">
                      <div className="expense-name">Dietas</div>
                      <div className="expense-count">{dashboardData.por_tipo.dietas} gastos</div>
                    </div>
                  </div>
                  
                  <div className="expense-type-card">
                    <span className="expense-icon">🅿️</span>
                    <div className="expense-info">
                      <div className="expense-name">Aparcamiento</div>
                      <div className="expense-count">{dashboardData.por_tipo.aparcamiento} gastos</div>
                    </div>
                  </div>
                  
                  <div className="expense-type-card">
                    <span className="expense-icon">⛽</span>
                    <div className="expense-info">
                      <div className="expense-name">Combustible</div>
                      <div className="expense-count">{dashboardData.por_tipo.gasolina} gastos</div>
                    </div>
                  </div>
                  
                  <div className="expense-type-card">
                    <span className="expense-icon">📎</span>
                    <div className="expense-info">
                      <div className="expense-name">Otros</div>
                      <div className="expense-count">{dashboardData.por_tipo.otros} gastos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Funcionalidades disponibles según el rol */}
          <div className="features-section">
            <h3 className="section-title">Funcionalidades Disponibles</h3>
            <div className="features-grid">
              {getRoleFeatures(user?.role).map((feature, index) => (
                <div key={index} className="feature-card">
                  <span className="feature-icon">{feature.icon}</span>
                  <h4>{feature.title}</h4>
                  <p>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Secciones accesibles */}
          <div className="access-section">
            <h3 className="section-title">Secciones Disponibles</h3>
            <div className="access-grid">
              {getAccessibleSections(user?.role).includes('gastos') && (
                <div className="access-card">
                  <span className="access-icon">💰</span>
                  <h4>Gestión de Gastos</h4>
                  <p>
                    {user?.role === 'operario' ? 'Crear y gestionar tus gastos' :
                     user?.role === 'supervisor' ? 'Aprobar gastos de tu equipo' :
                     'Gestión completa de gastos empresariales'}
                  </p>
                </div>
              )}
              
              {getAccessibleSections(user?.role).includes('usuarios') && (
                <div className="access-card">
                  <span className="access-icon">👥</span>
                  <h4>Gestión de Usuarios</h4>
                  <p>Administrar usuarios, roles y permisos del sistema</p>
                </div>
              )}
              
              {getAccessibleSections(user?.role).includes('reportes') && (
                <div className="access-card">
                  <span className="access-icon">📊</span>
                  <h4>Reportes y Análisis</h4>
                  <p>
                    {user?.role === 'supervisor' ? 'Reportes de tu departamento' :
                     'Análisis completo y estadísticas del sistema'}
                  </p>
                </div>
              )}
              
              {getAccessibleSections(user?.role).includes('configuracion') && (
                <div className="access-card">
                  <span className="access-icon">⚙️</span>
                  <h4>Configuración</h4>
                  <p>Personalizar límites, categorías y configuración del sistema</p>
                </div>
              )}
            </div>
          </div>

          {/* Información específica del rol */}
          {user?.role && (
            <div className="role-info-panel">
              <h4 className="role-title">Información de tu Rol: {getRoleDisplayName(user.role)}</h4>
              <div className="role-content">
                {user.role === 'administrador' && (
                  <p>Como administrador, tienes acceso completo al sistema. Puedes gestionar usuarios, configurar límites de gastos, aprobar cualquier importe y generar reportes completos. Los controles de idioma y tema están disponibles en la barra de navegación superior.</p>
                )}
                {user.role === 'supervisor' && (
                  <p>Como supervisor, puedes aprobar gastos de tu equipo hasta el límite establecido (consultar con administración). Tienes acceso a reportes de tu departamento y puedes supervisar los gastos pendientes de aprobación.</p>
                )}
                {user.role === 'operario' && (
                  <p>Como operario, puedes registrar todos tus gastos laborales: dietas, combustible, parking y otros gastos. Recuerda adjuntar siempre los justificantes correspondientes. Puedes seguir el estado de tus gastos en tiempo real.</p>
                )}
                {user.role === 'contabilidad' && (
                  <p>Desde contabilidad, gestionas los pagos de gastos aprobados, generas reportes financieros y realizas la conciliación contable. Tienes acceso a todas las funciones financieras del sistema.</p>
                )}
              </div>
            </div>
          )}

          {/* Accesos rápidos según el rol */}
          <div className="quick-actions">
            <h4 className="section-title">Acciones Rápidas</h4>
            <div className="quick-actions-grid">
              {user?.role === 'operario' && (
                <button className="quick-action-btn" onClick={() => window.location.href = '/gastos'}>
                  <span className="action-icon">➕</span>
                  <span>Nuevo Gasto</span>
                </button>
              )}
              
              {(user?.role === 'supervisor' || user?.role === 'administrador') && (
                <button className="quick-action-btn" onClick={() => window.location.href = '/gastos?filter=pendiente'}>
                  <span className="action-icon">✅</span>
                  <span>Aprobar Gastos</span>
                </button>
              )}
              
              {user?.role === 'contabilidad' && (
                <button className="quick-action-btn" onClick={() => window.location.href = '/gastos?filter=aprobado'}>
                  <span className="action-icon">💳</span>
                  <span>Procesar Pagos</span>
                </button>
              )}
              
              <button className="quick-action-btn" onClick={() => window.location.href = '/gastos'}>
                <span className="action-icon">📋</span>
                <span>Ver Gastos</span>
              </button>
            </div>
          </div>

          <div className="footer-section">
            © 2025 {config?.empresa?.nombre || 'GrupLomi'} - Sistema de Gestión de Gastos Empresariales
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;