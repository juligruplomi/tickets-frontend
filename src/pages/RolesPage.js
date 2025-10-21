import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './RolesPage.css';

function RolesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState({});
  const [message, setMessage] = useState('');

  const permisosDisponibles = [
    { id: 'ver_gastos', label: 'Ver Gastos', descripcion: 'Puede ver gastos según su rol' },
    { id: 'crear_gastos', label: 'Crear Gastos', descripcion: 'Permite crear nuevos gastos' },
    { id: 'editar_gastos', label: 'Editar Gastos', descripcion: 'Puede editar gastos' },
    { id: 'eliminar_gastos', label: 'Eliminar Gastos', descripcion: 'Puede eliminar gastos' },
    { id: 'aprobar_gastos', label: 'Aprobar Gastos', descripcion: 'Puede aprobar/rechazar gastos' },
    { id: 'ver_usuarios', label: 'Ver Usuarios', descripcion: 'Puede ver la lista de usuarios' },
    { id: 'crear_usuarios', label: 'Crear Usuarios', descripcion: 'Puede crear nuevos usuarios' },
    { id: 'editar_usuarios', label: 'Editar Usuarios', descripcion: 'Puede modificar usuarios existentes' },
    { id: 'eliminar_usuarios', label: 'Eliminar Usuarios', descripcion: 'Puede eliminar usuarios' },
    { id: 'ver_reportes', label: 'Ver Reportes', descripcion: 'Puede generar reportes y estadísticas' },
    { id: 'exportar_datos', label: 'Exportar Datos', descripcion: 'Puede exportar datos a Excel/CSV' },
    { id: 'configurar_sistema', label: 'Configurar Sistema', descripcion: 'Acceso a configuración del sistema' }
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/roles');
      
      // El backend devuelve un array de roles: [{id, nombre, permisos: []}]
      const rolesFormatted = {};
      
      if (Array.isArray(response.data)) {
        response.data.forEach(role => {
          // Convertir array de permisos a objeto para los checkboxes
          const permisosObj = {};
          if (Array.isArray(role.permisos)) {
            role.permisos.forEach(permiso => {
              permisosObj[permiso] = true;
            });
          }
          
          rolesFormatted[role.id] = {
            nombre: role.nombre,
            descripcion: getDescripcionRol(role.id),
            activo: true,
            permisos: permisosObj
          };
        });
      }
      
      setRoles(rolesFormatted);
    } catch (error) {
      console.error('Error loading roles:', error);
      setMessage('❌ Error al cargar roles: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const getDescripcionRol = (roleId) => {
    const descripciones = {
      admin: 'Control total del sistema',
      supervisor: 'Puede aprobar gastos de su equipo',
      empleado: 'Puede crear y gestionar sus propios gastos',
      contabilidad: 'Gestiona pagos y reportes financieros'
    };
    return descripciones[roleId] || '';
  };

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

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setMessage('');
      
      // Enviar PUT a cada rol modificado
      const updatePromises = Object.entries(roles).map(async ([roleKey, roleData]) => {
        // Convertir permisos de objeto a array
        const permisosArray = Object.keys(roleData.permisos).filter(p => roleData.permisos[p]);
        
        try {
          await api.put(`/roles/${roleKey}`, {
            permisos: permisosArray
          });
          return { roleKey, success: true };
        } catch (error) {
          console.error(`Error updating role ${roleKey}:`, error);
          return { roleKey, success: false, error };
        }
      });
      
      const results = await Promise.all(updatePromises);
      const failures = results.filter(r => !r.success);
      
      if (failures.length === 0) {
        setMessage('✅ Configuración de roles guardada correctamente');
        // Recargar roles para confirmar cambios
        await loadRoles();
      } else {
        setMessage(`⚠️ Algunos roles no se guardaron: ${failures.map(f => f.roleKey).join(', ')}`);
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving roles:', error);
      setMessage('❌ Error al guardar: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'administrador' && user?.role !== 'admin') {
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

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando roles...</p>
            </div>
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
            <div className={`alert ${message.includes('Error') || message.includes('❌') ? 'alert-error' : 'alert-success'}`}>
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
                            disabled={roleKey === 'administrador'}
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
              disabled={saving}
            >
              {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
          
          <div className="info-panel">
            <h4>ℹ️ Información sobre Roles</h4>
            <p>
              Los roles definen los permisos que tienen los usuarios en el sistema. 
              El rol de <strong>Administrador</strong> tiene todos los permisos y no se puede modificar.
            </p>
            <ul>
              <li><strong>Administrador:</strong> Control total del sistema</li>
              <li><strong>Supervisor:</strong> Puede aprobar gastos de su equipo</li>
              <li><strong>Contabilidad:</strong> Gestiona pagos y reportes financieros</li>
              <li><strong>Operario/Empleado:</strong> Puede crear y gestionar sus propios gastos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RolesPage;
