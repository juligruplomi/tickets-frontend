import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Users, Shield, Settings, FileText, DollarSign, Bell, Eye, Edit, Trash2, Plus, Save, X, Check } from 'lucide-react';

function RolesPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingRole, setEditingRole] = useState(null);
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [newRole, setNewRole] = useState({
    nombre: '',
    descripcion: '',
    nivel: 1,
    permisos: []
  });

  // Definición de todos los permisos disponibles en el sistema
  const availablePermissions = [
    {
      categoria: 'Tickets',
      icono: '🎫',
      permisos: [
        { id: 'tickets.ver', nombre: 'Ver tickets', descripcion: 'Permite ver todos los tickets' },
        { id: 'tickets.crear', nombre: 'Crear tickets', descripcion: 'Permite crear nuevos tickets' },
        { id: 'tickets.editar', nombre: 'Editar tickets', descripcion: 'Permite editar tickets existentes' },
        { id: 'tickets.eliminar', nombre: 'Eliminar tickets', descripcion: 'Permite eliminar tickets' },
        { id: 'tickets.asignar', nombre: 'Asignar tickets', descripcion: 'Permite asignar tickets a usuarios' },
        { id: 'tickets.cerrar', nombre: 'Cerrar tickets', descripcion: 'Permite cerrar tickets resueltos' }
      ]
    },
    {
      categoria: 'Gastos',
      icono: '💰',
      permisos: [
        { id: 'gastos.ver', nombre: 'Ver gastos', descripcion: 'Permite ver todos los gastos' },
        { id: 'gastos.crear', nombre: 'Crear gastos', descripcion: 'Permite crear nuevos gastos' },
        { id: 'gastos.editar', nombre: 'Editar gastos', descripcion: 'Permite editar gastos propios' },
        { id: 'gastos.editar_todos', nombre: 'Editar todos los gastos', descripcion: 'Permite editar gastos de cualquier usuario' },
        { id: 'gastos.aprobar', nombre: 'Aprobar gastos', descripcion: 'Permite aprobar gastos pendientes' },
        { id: 'gastos.rechazar', nombre: 'Rechazar gastos', descripcion: 'Permite rechazar gastos' },
        { id: 'gastos.eliminar', nombre: 'Eliminar gastos', descripcion: 'Permite eliminar gastos' },
        { id: 'gastos.exportar', nombre: 'Exportar gastos', descripcion: 'Permite exportar informes de gastos' }
      ]
    },
    {
      categoria: 'Usuarios',
      icono: '👥',
      permisos: [
        { id: 'usuarios.ver', nombre: 'Ver usuarios', descripcion: 'Permite ver lista de usuarios' },
        { id: 'usuarios.crear', nombre: 'Crear usuarios', descripcion: 'Permite crear nuevos usuarios' },
        { id: 'usuarios.editar', nombre: 'Editar usuarios', descripcion: 'Permite editar datos de usuarios' },
        { id: 'usuarios.eliminar', nombre: 'Eliminar usuarios', descripcion: 'Permite eliminar usuarios' },
        { id: 'usuarios.cambiar_rol', nombre: 'Cambiar roles', descripcion: 'Permite cambiar el rol de usuarios' },
        { id: 'usuarios.resetear_contraseña', nombre: 'Resetear contraseñas', descripcion: 'Permite resetear contraseñas de usuarios' }
      ]
    },
    {
      categoria: 'Configuración',
      icono: '⚙️',
      permisos: [
        { id: 'config.ver', nombre: 'Ver configuración', descripcion: 'Permite ver configuración del sistema' },
        { id: 'config.editar', nombre: 'Editar configuración', descripcion: 'Permite modificar configuración del sistema' },
        { id: 'config.backup', nombre: 'Realizar backups', descripcion: 'Permite crear copias de seguridad' },
        { id: 'config.restaurar', nombre: 'Restaurar backups', descripcion: 'Permite restaurar copias de seguridad' }
      ]
    },
    {
      categoria: 'Informes',
      icono: '📊',
      permisos: [
        { id: 'informes.ver', nombre: 'Ver informes', descripcion: 'Permite ver informes del sistema' },
        { id: 'informes.crear', nombre: 'Crear informes', descripcion: 'Permite generar nuevos informes' },
        { id: 'informes.exportar', nombre: 'Exportar informes', descripcion: 'Permite exportar informes a Excel/PDF' },
        { id: 'informes.programar', nombre: 'Programar informes', descripcion: 'Permite programar informes automáticos' }
      ]
    },
    {
      categoria: 'Notificaciones',
      icono: '🔔',
      permisos: [
        { id: 'notif.ver', nombre: 'Ver notificaciones', descripcion: 'Permite ver todas las notificaciones' },
        { id: 'notif.enviar', nombre: 'Enviar notificaciones', descripcion: 'Permite enviar notificaciones a usuarios' },
        { id: 'notif.configurar', nombre: 'Configurar notificaciones', descripcion: 'Permite configurar reglas de notificaciones' }
      ]
    }
  ];

  useEffect(() => {
    if (user?.role === 'administrador') {
      loadRoles();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadRoles = async () => {
    try {
      // Simulamos la carga de roles desde el servidor
      const mockRoles = [
        {
          id: '1',
          nombre: 'Administrador',
          descripcion: 'Control total del sistema',
          nivel: 10,
          usuarios_count: 2,
          is_system: true,
          permisos: availablePermissions.flatMap(cat => cat.permisos.map(p => p.id))
        },
        {
          id: '2',
          nombre: 'Supervisor',
          descripcion: 'Gestión de gastos y usuarios',
          nivel: 5,
          usuarios_count: 5,
          is_system: false,
          permisos: [
            'gastos.ver', 'gastos.aprobar', 'gastos.rechazar', 'gastos.exportar',
            'usuarios.ver', 'informes.ver', 'informes.crear'
          ]
        },
        {
          id: '3',
          nombre: 'Empleado',
          descripcion: 'Acceso básico para empleados',
          nivel: 1,
          usuarios_count: 25,
          is_system: false,
          permisos: [
            'tickets.ver', 'tickets.crear', 
            'gastos.ver', 'gastos.crear', 'gastos.editar'
          ]
        },
        {
          id: '4',
          nombre: 'Auditor',
          descripcion: 'Solo lectura para auditorías',
          nivel: 3,
          usuarios_count: 3,
          is_system: false,
          permisos: [
            'tickets.ver', 'gastos.ver', 'usuarios.ver', 
            'config.ver', 'informes.ver', 'informes.exportar'
          ]
        }
      ];
      
      setRoles(mockRoles);
      setLoading(false);
    } catch (error) {
      console.error('Error loading roles:', error);
      setMessage('Error al cargar los roles');
      setLoading(false);
    }
  };

  const handleEditRole = (role) => {
    if (role.is_system) {
      setMessage('Los roles del sistema no pueden ser editados');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setEditingRole({
      ...role,
      permisos: [...role.permisos]
    });
  };

  const handleDeleteRole = async (roleId) => {
    const role = roles.find(r => r.id === roleId);
    if (role.is_system) {
      setMessage('Los roles del sistema no pueden ser eliminados');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    if (role.usuarios_count > 0) {
      setMessage(`No se puede eliminar el rol "${role.nombre}" porque tiene ${role.usuarios_count} usuarios asignados`);
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar el rol "${role.nombre}"?`)) {
      setRoles(roles.filter(r => r.id !== roleId));
      setMessage(`Rol "${role.nombre}" eliminado exitosamente`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSaveRole = async () => {
    setSaving(true);
    
    try {
      // Simulamos el guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingRole.id) {
        // Actualizar rol existente
        setRoles(roles.map(r => r.id === editingRole.id ? editingRole : r));
        setMessage(`Rol "${editingRole.nombre}" actualizado exitosamente`);
      } else {
        // Crear nuevo rol
        const newRoleWithId = {
          ...newRole,
          id: String(Date.now()),
          usuarios_count: 0,
          is_system: false
        };
        setRoles([...roles, newRoleWithId]);
        setMessage(`Rol "${newRole.nombre}" creado exitosamente`);
        setNewRole({
          nombre: '',
          descripcion: '',
          nivel: 1,
          permisos: []
        });
        setShowNewRoleForm(false);
      }
      
      setEditingRole(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error al guardar el rol');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permissionId, isEditing = true) => {
    if (isEditing && editingRole) {
      const permisos = editingRole.permisos.includes(permissionId)
        ? editingRole.permisos.filter(p => p !== permissionId)
        : [...editingRole.permisos, permissionId];
      
      setEditingRole({ ...editingRole, permisos });
    } else if (!isEditing) {
      const permisos = newRole.permisos.includes(permissionId)
        ? newRole.permisos.filter(p => p !== permissionId)
        : [...newRole.permisos, permissionId];
      
      setNewRole({ ...newRole, permisos });
    }
  };

  const toggleCategoryPermissions = (categoryPermissions, isEditing = true) => {
    const targetObj = isEditing ? editingRole : newRole;
    const setterFunc = isEditing ? setEditingRole : setNewRole;
    
    const categoryPermIds = categoryPermissions.map(p => p.id);
    const allSelected = categoryPermIds.every(id => targetObj.permisos.includes(id));
    
    if (allSelected) {
      // Deseleccionar todos
      setterFunc({
        ...targetObj,
        permisos: targetObj.permisos.filter(p => !categoryPermIds.includes(p))
      });
    } else {
      // Seleccionar todos
      const newPermisos = [...new Set([...targetObj.permisos, ...categoryPermIds])];
      setterFunc({
        ...targetObj,
        permisos: newPermisos
      });
    }
  };

  if (user?.role !== 'administrador') {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body">
            <p>No tienes permisos para acceder a esta sección.</p>
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
              <p>Cargando roles y permisos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card dashboard-card">
        <div className="card-header">
          <h2 className="card-title">
            <Shield style={{ marginRight: '10px', verticalAlign: 'middle' }} />
            Gestión de Roles y Permisos
          </h2>
          {message && (
            <div className={`alert ${message.includes('Error') || message.includes('No se puede') ? 'alert-danger' : 'alert-success'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="card-body">
          {/* Lista de roles */}
          {!editingRole && !showNewRoleForm && (
            <>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="section-title">Roles del Sistema</h3>
                <button
                  className="button button-primary"
                  onClick={() => setShowNewRoleForm(true)}
                >
                  <Plus size={16} style={{ marginRight: '5px' }} />
                  Nuevo Rol
                </button>
              </div>

              <div className="roles-grid">
                {roles.map(role => (
                  <div key={role.id} className="role-card">
                    <div className="role-header">
                      <div>
                        <h4>{role.nombre}</h4>
                        {role.is_system && (
                          <span className="badge badge-system">Sistema</span>
                        )}
                      </div>
                      <div className="role-actions">
                        <button
                          className="button-icon"
                          onClick={() => handleEditRole(role)}
                          title="Editar rol"
                        >
                          <Edit size={16} />
                        </button>
                        {!role.is_system && (
                          <button
                            className="button-icon button-icon-danger"
                            onClick={() => handleDeleteRole(role.id)}
                            title="Eliminar rol"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="role-description">{role.descripcion}</p>
                    <div className="role-stats">
                      <span className="stat">
                        <Users size={14} />
                        {role.usuarios_count} usuarios
                      </span>
                      <span className="stat">
                        <Shield size={14} />
                        {role.permisos.length} permisos
                      </span>
                      <span className="stat">
                        Nivel: {role.nivel}
                      </span>
                    </div>
                    <div className="role-permissions-preview">
                      {availablePermissions.map(category => {
                        const categoryPerms = category.permisos.filter(p => 
                          role.permisos.includes(p.id)
                        );
                        if (categoryPerms.length === 0) return null;
                        
                        return (
                          <div key={category.categoria} className="permission-badge">
                            {category.icono} {categoryPerms.length}/{category.permisos.length}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Formulario de edición de rol */}
          {(editingRole || showNewRoleForm) && (
            <div className="role-edit-form">
              <h3 className="section-title">
                {editingRole ? `Editar Rol: ${editingRole.nombre}` : 'Crear Nuevo Rol'}
              </h3>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nombre del rol:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRole ? editingRole.nombre : newRole.nombre}
                    onChange={(e) => {
                      if (editingRole) {
                        setEditingRole({ ...editingRole, nombre: e.target.value });
                      } else {
                        setNewRole({ ...newRole, nombre: e.target.value });
                      }
                    }}
                    disabled={editingRole?.is_system}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nivel de acceso (1-10):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="form-control"
                    value={editingRole ? editingRole.nivel : newRole.nivel}
                    onChange={(e) => {
                      const nivel = parseInt(e.target.value);
                      if (editingRole) {
                        setEditingRole({ ...editingRole, nivel });
                      } else {
                        setNewRole({ ...newRole, nivel });
                      }
                    }}
                    disabled={editingRole?.is_system}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descripción:</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={editingRole ? editingRole.descripcion : newRole.descripcion}
                  onChange={(e) => {
                    if (editingRole) {
                      setEditingRole({ ...editingRole, descripcion: e.target.value });
                    } else {
                      setNewRole({ ...newRole, descripcion: e.target.value });
                    }
                  }}
                  disabled={editingRole?.is_system}
                />
              </div>

              <h4 className="section-title" style={{ marginTop: '30px' }}>Permisos</h4>
              
              <div className="permissions-grid">
                {availablePermissions.map(category => {
                  const targetPerms = editingRole ? editingRole.permisos : newRole.permisos;
                  const allSelected = category.permisos.every(p => targetPerms.includes(p.id));
                  const someSelected = category.permisos.some(p => targetPerms.includes(p.id));
                  
                  return (
                    <div key={category.categoria} className="permission-category">
                      <div className="category-header">
                        <h5>
                          <span style={{ marginRight: '8px' }}>{category.icono}</span>
                          {category.categoria}
                        </h5>
                        <button
                          className="button-link"
                          onClick={() => toggleCategoryPermissions(category.permisos, !!editingRole)}
                          disabled={editingRole?.is_system}
                        >
                          {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                        </button>
                      </div>
                      
                      <div className="permissions-list">
                        {category.permisos.map(permiso => {
                          const isSelected = targetPerms.includes(permiso.id);
                          
                          return (
                            <div key={permiso.id} className="permission-item">
                              <label className="permission-checkbox">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => togglePermission(permiso.id, !!editingRole)}
                                  disabled={editingRole?.is_system}
                                />
                                <span className="permission-info">
                                  <span className="permission-name">{permiso.nombre}</span>
                                  <span className="permission-desc">{permiso.descripcion}</span>
                                </span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="form-actions">
                <button
                  className="button button-secondary"
                  onClick={() => {
                    setEditingRole(null);
                    setShowNewRoleForm(false);
                    setNewRole({
                      nombre: '',
                      descripcion: '',
                      nivel: 1,
                      permisos: []
                    });
                  }}
                >
                  <X size={16} style={{ marginRight: '5px' }} />
                  Cancelar
                </button>
                
                <button
                  className="button button-primary"
                  onClick={handleSaveRole}
                  disabled={saving || editingRole?.is_system}
                >
                  <Save size={16} style={{ marginRight: '5px' }} />
                  {saving ? 'Guardando...' : 'Guardar Rol'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .role-card {
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 20px;
          background: var(--card-background);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .role-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .role-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .role-header h4 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .badge-system {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          background: #0066CC;
          color: white;
          font-size: 0.75rem;
          margin-left: 8px;
        }

        .role-actions {
          display: flex;
          gap: 8px;
        }

        .button-icon {
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-small);
          padding: 6px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .button-icon:hover {
          background: var(--secondary-color);
        }

        .button-icon-danger:hover {
          background: rgba(220, 53, 69, 0.1);
          border-color: #dc3545;
          color: #dc3545;
        }

        .role-description {
          color: var(--text-color);
          opacity: 0.8;
          font-size: 0.9rem;
          margin: 10px 0;
        }

        .role-stats {
          display: flex;
          gap: 15px;
          margin: 15px 0;
          padding-top: 15px;
          border-top: 1px solid var(--border-color);
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.85rem;
          color: var(--text-color);
          opacity: 0.7;
        }

        .role-permissions-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 15px;
        }

        .permission-badge {
          padding: 4px 10px;
          border-radius: 15px;
          background: var(--secondary-color);
          border: 1px solid var(--border-color);
          font-size: 0.8rem;
        }

        .role-edit-form {
          background: var(--secondary-color);
          padding: 30px;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 200px;
          gap: 20px;
          margin-bottom: 20px;
        }

        .permissions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 25px;
          margin: 20px 0;
        }

        .permission-category {
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 20px;
          background: var(--card-background);
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-color);
        }

        .category-header h5 {
          margin: 0;
          font-size: 1rem;
          display: flex;
          align-items: center;
        }

        .button-link {
          background: none;
          border: none;
          color: var(--primary-color);
          cursor: pointer;
          font-size: 0.85rem;
          text-decoration: underline;
        }

        .button-link:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .permissions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .permission-item {
          padding: 8px;
          border-radius: var(--border-radius-small);
          transition: background 0.2s;
        }

        .permission-item:hover {
          background: var(--secondary-color);
        }

        .permission-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
        }

        .permission-checkbox input {
          margin-top: 3px;
        }

        .permission-checkbox input:disabled {
          cursor: not-allowed;
        }

        .permission-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .permission-name {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .permission-desc {
          font-size: 0.8rem;
          color: var(--text-color);
          opacity: 0.7;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
        }

        .button-secondary {
          background: var(--secondary-color);
          color: var(--text-color);
          border: 1px solid var(--border-color);
        }

        .button-secondary:hover {
          background: var(--card-background);
        }
      `}</style>
    </div>
  );
}

export default RolesPage;