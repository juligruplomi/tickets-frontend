import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './RolesPage.css';

function RolesPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState({
    operario: {
      nombre: 'Operario',
      descripcion: 'Usuario básico que puede crear y ver sus propios gastos',
      activo: true,
      permisos: {
        crear_gastos: true,
        ver_propios_gastos: true,
        editar_propios_gastos: true,
        eliminar_propios_gastos: true,
        aprobar_gastos_equipo: false,
        ver_todos_gastos: false,
        ver_usuarios: false,
        crear_usuarios: false,
        editar_usuarios: false,
        generar_informes: false,
        exportar_datos: false,
        configurar_sistema: false
      }
    },
    supervisor: {
      nombre: 'Supervisor',
      descripcion: 'Puede aprobar gastos de su equipo hasta límite establecido',
      activo: true,
      permisos: {
        crear_gastos: true,
        ver_propios_gastos: true,
        editar_propios_gastos: true,
        eliminar_propios_gastos: false,
        aprobar_gastos_equipo: true,
        ver_todos_gastos: false,
        ver_usuarios: false,
        crear_usuarios: false,
        editar_usuarios: false,
        generar_informes: true,
        exportar_datos: true,
        configurar_sistema: false
      }
    },
    administrador: {
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema',
      activo: true,
      permisos: {
        crear_gastos: true,
        ver_propios_gastos: true,
        editar_propios_gastos: true,
        eliminar_propios_gastos: true,
        aprobar_gastos_equipo: true,
        ver_todos_gastos: true,
        ver_usuarios: true,
        crear_usuarios: true,
        editar_usuarios: true,
        generar_informes: true,
        exportar_datos: true,
        configurar_sistema: true
      }
    },
    contabilidad: {
      nombre: 'Contabilidad',
      descripcion: 'Puede revisar y procesar todos los gastos para contabilidad',
      activo: true,
      permisos: {
        crear_gastos: false,
        ver_propios_gastos: true,
        editar_propios_gastos: false,
        eliminar_propios_gastos: false,
        aprobar_gastos_equipo: false,
        ver_todos_gastos: true,
        ver_usuarios: false,
        crear_usuarios: false,
        editar_usuarios: false,
        generar_informes: true,
        exportar_datos: true,
        configurar_sistema: false
      }
    }
  });

  const [message, setMessage] = useState('');

  const permisosDisponibles = [
    { id: 'crear_gastos', label: 'Crear Gastos', descripcion: 'Permite crear nuevos gastos' },
    { id: 'ver_propios_gastos', label: 'Ver Propios_gastos', descripcion: 'Puede ver sus propios gastos' },
    { id: 'editar_propios_gastos', label: 'Editar Propios_gastos', descripcion: 'Puede editar sus propios gastos pendientes' },
    { id: 'eliminar_propios_gastos', label: 'Eliminar Propios_gastos', descripcion: 'Puede eliminar sus propios gastos pendientes' },
    { id: 'aprobar_gastos_equipo', label: 'Aprobar Gastos_equipo', descripcion: 'Puede aprobar/rechazar gastos del equipo' },
    { id: 'ver_todos_gastos', label: 'Ver Todos_gastos', descripcion: 'Puede ver gastos de todos los usuarios' },
    { id: 'ver_usuarios', label: 'Ver Usuarios', descripcion: 'Puede ver la lista de usuarios' },
    { id: 'crear_usuarios', label: 'Crear Usuarios', descripcion: 'Puede crear nuevos usuarios' },
    { id: 'editar_usuarios', label: 'Editar Usuarios', descripcion: 'Puede modificar usuarios existentes' },
    { id: 'generar_informes', label: 'Generar Informes', descripcion: 'Puede generar reportes y estadísticas' },
    { id: 'exportar_datos', label: 'Exportar Datos', descripcion: 'Puede exportar datos a Excel/CSV' },
    { id: 'configurar_sistema', label: 'Configurar Sistema', descripcion: 'Acceso a configuración del sistema' }
  ];

  const handleTogglePermiso = (roleKey, permisoId) => {
    setRoles(prevRoles => ({
      ...prevRoles,
      [roleKey]: {
        ...prevRoles[roleKey],
        permisos: {
          ...prevRoles[roleKey].permisos,
          [permisoId]: !prevRoles[roleKey].permisos[permisoId]
        }
      }
    }));
  };

  const handleToggleRoleActivo = (roleKey) => {
    setRoles(prevRoles => ({
      ...prevRoles,
      [roleKey]: {
        ...prevRoles[roleKey],
        activo: !prevRoles[roleKey].activo
      }
    }));
  };

  const handleSaveChanges = () => {
    // Guardar en localStorage por ahora (demo)
    localStorage.setItem('roles_config', JSON.stringify(roles));
    setMessage('✅ Configuración de roles guardada correctamente');
    setTimeout(() => setMessage(''), 3000);
  };

  // Cargar roles desde localStorage si existen
  useEffect(() => {
    const savedRoles = localStorage.getItem('roles_config');
    if (savedRoles) {
      setRoles(JSON.parse(savedRoles));
    }
  }, []);

  if (user?.role !== 'administrador') {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body">
            <p style={{ textAlign: 'center', padding: '20px' }}>
              ⛔ No tienes permisos para acceder a esta sección.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card roles-card">
        <div className="card-header">
          <h2>🛡️ Roles y Permisos</h2>
          <p className="subtitle">Gestiona los roles del sistema y sus permisos asociados</p>
        </div>
        
        <div className="card-body">
          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          <div className="roles-grid">
            {Object.entries(roles).map(([roleKey, roleData]) => (
              <div key={roleKey} className="role-card">
                <div className="role-header">
                  <div className="role-title-section">
                    <h3>{roleData.nombre}</h3>
                    <p className="role-description">{roleData.descripcion}</p>
                  </div>
                  <div className="role-toggle">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={roleData.activo}
                        onChange={() => handleToggleRoleActivo(roleKey)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className="toggle-label">
                      {roleData.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="role-permissions">
                  <h4>Permisos:</h4>
                  <div className="permissions-list">
                    {permisosDisponibles.map(permiso => (
                      <div key={permiso.id} className="permission-item">
                        <label className="permission-checkbox">
                          <input
                            type="checkbox"
                            checked={roleData.permisos[permiso.id] || false}
                            onChange={() => handleTogglePermiso(roleKey, permiso.id)}
                          />
                          <div className="permission-info">
                            <span className="permission-label">{permiso.label}</span>
                            <span className="permission-desc">{permiso.descripcion}</span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button 
              className="button button-primary"
              onClick={handleSaveChanges}
            >
              💾 Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RolesPage;
