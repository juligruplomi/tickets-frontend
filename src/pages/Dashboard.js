import React from 'react';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  
  // Obtener la URL de la API desde la configuración
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Dashboard</h2>
        </div>
        <div className="card-body">
          <p>Bienvenido al sistema de tickets, {user?.nombre || user?.email}!</p>
          <p>El backend está funcionando correctamente en: <strong>{apiUrl}</strong></p>
          
          <div style={{ marginTop: '20px' }}>
            <h3>Estado del sistema:</h3>
            <ul>
              <li>✅ API funcionando</li>
              <li>✅ Autenticación activa</li>
              <li>✅ Usuario: {user?.role === 'admin' ? 'Administrador' : 'Usuario'}</li>
            </ul>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h3>Funcionalidades disponibles:</h3>
            <ul>
              <li>Gestión de tickets</li>
              <li>Administración de usuarios {user?.role === 'admin' ? '(Disponible)' : '(Solo Admin)'}</li>
              <li>Reportes y estadísticas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;