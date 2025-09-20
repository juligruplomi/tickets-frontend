import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystemConfig } from '../hooks/useSystemConfig';

function Dashboard() {
  const { user } = useAuth();
  const { config, loading } = useSystemConfig();
  
  // Obtener la URL de la API desde la configuración
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  if (loading) {
    return <div className="container">Cargando configuración...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Dashboard - {config.empresa.nombre}</h2>
        </div>
        <div className="card-body">
          <div style={{ 
            padding: '20px', 
            backgroundColor: config.empresa.colores.secundario,
            borderLeft: `4px solid ${config.empresa.colores.primario}`,
            marginBottom: '20px'
          }}>
            <h3 style={{ color: config.empresa.colores.primario, margin: '0 0 10px 0' }}>
              {config.mensajes.bienvenida}
            </h3>
            <p style={{ margin: 0 }}>
              Hola <strong>{user?.nombre || user?.email}</strong>, 
              tienes rol de <strong>{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</strong>
            </p>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h3>Estado del sistema:</h3>
            <ul>
              <li>✅ API funcionando en: <strong>{apiUrl}</strong></li>
              <li>✅ Autenticación activa</li>
              <li>✅ Configuración cargada</li>
              <li>✅ Tema: {config.apariencia.modo_oscuro ? 'Oscuro' : 'Claro'}</li>
            </ul>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h3>Funcionalidades disponibles:</h3>
            <ul>
              <li>📋 Gestión de tickets ({config.tickets.estados.length} estados disponibles)</li>
              <li>👥 Administración de usuarios {user?.role === 'admin' ? '(Disponible)' : '(Solo Admin)'}</li>
              <li>⚙️ Configuración del sistema {user?.role === 'admin' ? '(Disponible)' : '(Solo Admin)'}</li>
              <li>📊 Reportes y estadísticas</li>
            </ul>
          </div>

          {user?.role === 'admin' && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px',
              backgroundColor: config.empresa.colores.acento + '20',
              borderRadius: '5px'
            }}>
              <h4 style={{ color: config.empresa.colores.acento, margin: '0 0 10px 0' }}>
                Panel de Administrador
              </h4>
              <p style={{ margin: 0 }}>
                Como administrador, puedes personalizar mensajes, colores, categorías de tickets y más 
                desde la sección de configuración.
              </p>
            </div>
          )}

          <div style={{ 
            marginTop: '30px', 
            paddingTop: '20px', 
            borderTop: '1px solid #eee',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px'
          }}>
            {config.mensajes.footer}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;