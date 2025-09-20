import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    nombre: '',
    apellidos: '',
    codigo_empleado: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    foto_file: null,
    foto_url: '/avatars/default.jpg',
    role: 'operario',
    departamento: '',
    supervisor_id: null,
    activo: true,
    idioma_preferido: 'es',
    permisos_especiales: []
  });

  useEffect(() => {
    if (user?.role === 'administrador') {
      loadUsers();
    }
  }, [user]);

  const handlePhotoUpload = (file, isEditing = false) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoUrl = e.target.result;
        if (isEditing) {
          setEditingUser({...editingUser, foto_file: file, foto_url: photoUrl});
        } else {
          setNewUser({...newUser, foto_file: file, foto_url: photoUrl});
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error al cargar usuarios: ' + (error.response?.data?.error || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/usuarios', newUser);
      setUsers([...users, response.data]);
      setNewUser({
        email: '',
        password: '',
        nombre: '',
        apellidos: '',
        codigo_empleado: '',
        telefono: '',
        direccion: '',
        fecha_nacimiento: '',
        foto_file: null,
        foto_url: '/avatars/default.jpg',
        role: 'operario',
        departamento: '',
        supervisor_id: null,
        activo: true,
        idioma_preferido: 'es',
        permisos_especiales: []
      });
      setShowCreateModal(false);
      alert('Usuario creado correctamente');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error al crear usuario: ' + (error.response?.data?.error || 'Error desconocido'));
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const response = await api.put(`/usuarios/${userId}`, updates);
      setUsers(users.map(u => u.id === userId ? response.data : u));
      setEditingUser(null);
      alert('Usuario actualizado correctamente');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error al actualizar usuario: ' + (error.response?.data?.error || 'Error desconocido'));
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        await api.delete(`/usuarios/${userId}`);
        setUsers(users.filter(u => u.id !== userId));
        alert('Usuario eliminado correctamente');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error al eliminar usuario: ' + (error.response?.data?.error || 'Error desconocido'));
      }
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await api.put(`/usuarios/${userId}`, { activo: !currentStatus });
      setUsers(users.map(u => u.id === userId ? response.data : u));
      alert(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Error al cambiar estado del usuario: ' + (error.response?.data?.error || 'Error desconocido'));
    }
  };

  const getRoleDisplayName = (role) => {
    const roles = {
      'administrador': 'Administrador',
      'supervisor': 'Supervisor',
      'operario': 'Operario',
      'contabilidad': 'Contabilidad'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      'administrador': '#dc3545',
      'supervisor': '#fd7e14',
      'operario': '#28a745',
      'contabilidad': '#0066CC'
    };
    return colors[role] || '#6c757d';
  };

  const getAvailableLanguages = () => {
    return [
      { value: 'es', label: 'Español' },
      { value: 'en', label: 'English' },
      { value: 'ca', label: 'Català' },
      { value: 'de', label: 'Deutsch' },
      { value: 'it', label: 'Italiano' },
      { value: 'pt', label: 'Português' }
    ];
  };

  const getAvailableRoles = () => {
    return [
      { value: 'administrador', label: 'Administrador' },
      { value: 'supervisor', label: 'Supervisor' },
      { value: 'operario', label: 'Operario' },
      { value: 'contabilidad', label: 'Contabilidad' }
    ];
  };

  const getSupervisors = () => {
    return users.filter(u => u.role === 'supervisor' || u.role === 'administrador');
  };

  const filteredUsers = users.filter(userData => {
    const matchesRole = roleFilter === 'todos' || userData.role === roleFilter;
    const matchesSearch = 
      userData.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (userData.codigo_empleado && userData.codigo_empleado.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (userData.departamento && userData.departamento.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  if (user?.role !== 'administrador') {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body">
            <h2>Acceso Denegado</h2>
            <p>Solo los administradores pueden acceder a la gestión de usuarios.</p>
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
              <p>Cargando usuarios...</p>
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
            <h2 className="card-title">
              👥 Gestión de Usuarios
            </h2>
          </div>
          <div className="dashboard-controls">
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Vista Cuadrícula"
              >
                🗓️
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Vista Lista"
              >
                📋
              </button>
            </div>
            <button 
              className="button button-primary"
              onClick={() => setShowCreateModal(true)}
            >
              + Nuevo Usuario
            </button>
          </div>
        </div>
        
        <div className="card-body">
          {/* Filtros y búsqueda */}
          <div className="users-filters">
            <div className="filter-group">
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-control"
                style={{ maxWidth: '200px' }}
              >
                <option value="todos">Todos los roles</option>
                <option value="administrador">Administradores</option>
                <option value="supervisor">Supervisores</option>
                <option value="operario">Operarios</option>
                <option value="contabilidad">Contabilidad</option>
              </select>
            </div>
            
            <div className="search-group">
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ maxWidth: '300px' }}
              />
            </div>
          </div>

          {/* Lista de usuarios */}
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <p>No hay usuarios que coincidan con los filtros aplicados.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'users-grid' : 'users-list'}>
              {viewMode === 'grid' ? (
                // Vista de cuadrícula (actual)
                filteredUsers.map(userData => (
                  <div key={userData.id} className="user-card">
                    <div className="user-header">
                      <div className="user-avatar">
                        <img 
                          src={userData.foto_url || '/avatars/default.jpg'} 
                          alt={`${userData.nombre} ${userData.apellidos}`}
                          className="avatar-image"
                        />
                        <div className={`user-status ${userData.activo ? 'active' : 'inactive'}`}>
                          {userData.activo ? '🟢' : '🔴'}
                        </div>
                      </div>
                      <div className="user-info">
                        <h4 className="user-name">{userData.nombre} {userData.apellidos}</h4>
                        <p className="user-email">{userData.email}</p>
                        <span 
                          className="role-badge"
                          style={{ backgroundColor: getRoleColor(userData.role) }}
                        >
                          {getRoleDisplayName(userData.role)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="user-details">
                      <div className="detail-item">
                        <strong>Código:</strong> {userData.codigo_empleado || 'N/A'}
                      </div>
                      <div className="detail-item">
                        <strong>Departamento:</strong> {userData.departamento || 'N/A'}
                      </div>
                      <div className="detail-item">
                        <strong>Supervisor:</strong> {userData.supervisor_nombre || 'N/A'}
                      </div>
                      <div className="detail-item">
                        <strong>Teléfono:</strong> {userData.telefono || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="user-actions">
                      <button
                        className="button button-secondary"
                        onClick={() => setEditingUser(userData)}
                      >
                        ✏️ Editar
                      </button>
                      
                      <button
                        className={`button ${userData.activo ? 'button-warning' : 'button-success'}`}
                        onClick={() => toggleUserStatus(userData.id, userData.activo)}
                      >
                        {userData.activo ? '⏸️ Desactivar' : '▶️ Activar'}
                      </button>
                      
                      <button
                        className="button button-danger"
                        onClick={() => deleteUser(userData.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                // Vista de lista
                <div className="users-table">
                  <div className="table-header">
                    <div className="table-row header-row">
                      <div className="table-cell avatar-cell">Foto</div>
                      <div className="table-cell name-cell">Nombre</div>
                      <div className="table-cell email-cell">Email</div>
                      <div className="table-cell role-cell">Rol</div>
                      <div className="table-cell department-cell">Departamento</div>
                      <div className="table-cell status-cell">Estado</div>
                      <div className="table-cell actions-cell">Acciones</div>
                    </div>
                  </div>
                  <div className="table-body">
                    {filteredUsers.map(userData => (
                      <div key={userData.id} className="table-row">
                        <div className="table-cell avatar-cell">
                          <div className="user-avatar-small">
                            <img 
                              src={userData.foto_url || '/avatars/default.jpg'} 
                              alt={`${userData.nombre} ${userData.apellidos}`}
                              className="avatar-image-small"
                            />
                            <div className={`user-status-small ${userData.activo ? 'active' : 'inactive'}`}>
                              {userData.activo ? '🟢' : '🔴'}
                            </div>
                          </div>
                        </div>
                        <div className="table-cell name-cell">
                          <strong>{userData.nombre} {userData.apellidos}</strong>
                          <small>{userData.codigo_empleado || 'Sin código'}</small>
                        </div>
                        <div className="table-cell email-cell">
                          {userData.email}
                        </div>
                        <div className="table-cell role-cell">
                          <span 
                            className="role-badge-small"
                            style={{ backgroundColor: getRoleColor(userData.role) }}
                          >
                            {getRoleDisplayName(userData.role)}
                          </span>
                        </div>
                        <div className="table-cell department-cell">
                          {userData.departamento || 'N/A'}
                        </div>
                        <div className="table-cell status-cell">
                          <span className={`status-badge ${userData.activo ? 'status-active' : 'status-inactive'}`}>
                            {userData.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <div className="table-cell actions-cell">
                          <div className="table-actions">
                            <button
                              className="table-btn edit-btn"
                              onClick={() => setEditingUser(userData)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            
                            <button
                              className={`table-btn ${userData.activo ? 'deactivate-btn' : 'activate-btn'}`}
                              onClick={() => toggleUserStatus(userData.id, userData.activo)}
                              title={userData.activo ? 'Desactivar' : 'Activar'}
                            >
                              {userData.activo ? '⏸️' : '▶️'}
                            </button>
                            
                            <button
                              className="table-btn delete-btn"
                              onClick={() => deleteUser(userData.id)}
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear usuario */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nuevo Usuario</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={createUser}>
              <div className="modal-body">
                {/* Información básica */}
                <div className="form-section">
                  <h4 className="section-title">Información Personal</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nombre:</label>
                      <input
                        type="text"
                        required
                        value={newUser.nombre}
                        onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                        className="form-control"
                        placeholder="Carlos"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Apellidos:</label>
                      <input
                        type="text"
                        required
                        value={newUser.apellidos}
                        onChange={(e) => setNewUser({...newUser, apellidos: e.target.value})}
                        className="form-control"
                        placeholder="García López"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Email:</label>
                      <input
                        type="email"
                        required
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="form-control"
                        placeholder="usuario@gruplomi.com"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Contraseña:</label>
                      <input
                        type="password"
                        required
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="form-control"
                        placeholder="Mínimo 6 caracteres"
                        minLength="6"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Código de Empleado:</label>
                      <input
                        type="text"
                        value={newUser.codigo_empleado}
                        onChange={(e) => setNewUser({...newUser, codigo_empleado: e.target.value})}
                        className="form-control"
                        placeholder="EMP001"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Teléfono:</label>
                      <input
                        type="tel"
                        value={newUser.telefono}
                        onChange={(e) => setNewUser({...newUser, telefono: e.target.value})}
                        className="form-control"
                        placeholder="+34 666 123 456"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Dirección:</label>
                    <input
                      type="text"
                      value={newUser.direccion}
                      onChange={(e) => setNewUser({...newUser, direccion: e.target.value})}
                      className="form-control"
                      placeholder="Calle Principal 123, Barcelona"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Fecha de Nacimiento:</label>
                      <input
                        type="date"
                        value={newUser.fecha_nacimiento}
                        onChange={(e) => setNewUser({...newUser, fecha_nacimiento: e.target.value})}
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Foto de Perfil:</label>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handlePhotoUpload(e.target.files[0])}
                        className="form-control"
                      />
                      {newUser.foto_url && newUser.foto_url !== '/avatars/default.jpg' && (
                        <div className="photo-preview">
                          <img 
                            src={newUser.foto_url} 
                            alt="Preview" 
                            className="preview-image"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Información laboral */}
                <div className="form-section">
                  <h4 className="section-title">Información Laboral</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Rol:</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="form-control"
                        required
                      >
                        {getAvailableRoles().map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Departamento:</label>
                      <input
                        type="text"
                        value={newUser.departamento}
                        onChange={(e) => setNewUser({...newUser, departamento: e.target.value})}
                        className="form-control"
                        placeholder="IT, Operaciones, Campo..."
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Supervisor:</label>
                      <select
                        value={newUser.supervisor_id || ''}
                        onChange={(e) => setNewUser({...newUser, supervisor_id: e.target.value ? parseInt(e.target.value) : null})}
                        className="form-control"
                      >
                        <option value="">Sin supervisor</option>
                        {getSupervisors().map(supervisor => (
                          <option key={supervisor.id} value={supervisor.id}>
                            {supervisor.nombre} {supervisor.apellidos} ({getRoleDisplayName(supervisor.role)})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Idioma Preferido:</label>
                      <select
                        value={newUser.idioma_preferido}
                        onChange={(e) => setNewUser({...newUser, idioma_preferido: e.target.value})}
                        className="form-control"
                      >
                        {getAvailableLanguages().map(lang => (
                          <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={newUser.activo}
                        onChange={(e) => setNewUser({...newUser, activo: e.target.checked})}
                      />
                      Usuario activo
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="button button-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="button button-primary">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar usuario */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Usuario: {editingUser.nombre} {editingUser.apellidos}</h3>
              <button 
                className="modal-close"
                onClick={() => setEditingUser(null)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const updates = {
                nombre: editingUser.nombre,
                apellidos: editingUser.apellidos,
                email: editingUser.email,
                codigo_empleado: editingUser.codigo_empleado,
                telefono: editingUser.telefono,
                direccion: editingUser.direccion,
                fecha_nacimiento: editingUser.fecha_nacimiento,
                foto_url: editingUser.foto_url,
                role: editingUser.role,
                departamento: editingUser.departamento,
                supervisor_id: editingUser.supervisor_id,
                activo: editingUser.activo,
                idioma_preferido: editingUser.idioma_preferido
              };
              
              if (editingUser.password && editingUser.password.trim() !== '') {
                updates.password = editingUser.password;
              }
              
              updateUser(editingUser.id, updates);
            }}>
              <div className="modal-body">
                {/* Información básica */}
                <div className="form-section">
                  <h4 className="section-title">Información Personal</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nombre:</label>
                      <input
                        type="text"
                        required
                        value={editingUser.nombre}
                        onChange={(e) => setEditingUser({...editingUser, nombre: e.target.value})}
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Apellidos:</label>
                      <input
                        type="text"
                        required
                        value={editingUser.apellidos}
                        onChange={(e) => setEditingUser({...editingUser, apellidos: e.target.value})}
                        className="form-control"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Email:</label>
                      <input
                        type="email"
                        required
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Nueva Contraseña:</label>
                      <input
                        type="password"
                        value={editingUser.password || ''}
                        onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                        className="form-control"
                        placeholder="Dejar en blanco para mantener actual"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Código de Empleado:</label>
                      <input
                        type="text"
                        value={editingUser.codigo_empleado || ''}
                        onChange={(e) => setEditingUser({...editingUser, codigo_empleado: e.target.value})}
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Teléfono:</label>
                      <input
                        type="tel"
                        value={editingUser.telefono || ''}
                        onChange={(e) => setEditingUser({...editingUser, telefono: e.target.value})}
                        className="form-control"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Dirección:</label>
                    <input
                      type="text"
                      value={editingUser.direccion || ''}
                      onChange={(e) => setEditingUser({...editingUser, direccion: e.target.value})}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Fecha de Nacimiento:</label>
                      <input
                        type="date"
                        value={editingUser.fecha_nacimiento || ''}
                        onChange={(e) => setEditingUser({...editingUser, fecha_nacimiento: e.target.value})}
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Foto de Perfil:</label>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handlePhotoUpload(e.target.files[0], true)}
                        className="form-control"
                      />
                      {editingUser.foto_url && editingUser.foto_url !== '/avatars/default.jpg' && (
                        <div className="photo-preview">
                          <img 
                            src={editingUser.foto_url} 
                            alt="Preview" 
                            className="preview-image"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Información laboral */}
                <div className="form-section">
                  <h4 className="section-title">Información Laboral</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Rol:</label>
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                        className="form-control"
                        required
                      >
                        {getAvailableRoles().map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Departamento:</label>
                      <input
                        type="text"
                        value={editingUser.departamento || ''}
                        onChange={(e) => setEditingUser({...editingUser, departamento: e.target.value})}
                        className="form-control"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Supervisor:</label>
                      <select
                        value={editingUser.supervisor_id || ''}
                        onChange={(e) => setEditingUser({...editingUser, supervisor_id: e.target.value ? parseInt(e.target.value) : null})}
                        className="form-control"
                      >
                        <option value="">Sin supervisor</option>
                        {getSupervisors().filter(s => s.id !== editingUser.id).map(supervisor => (
                          <option key={supervisor.id} value={supervisor.id}>
                            {supervisor.nombre} {supervisor.apellidos} ({getRoleDisplayName(supervisor.role)})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Idioma Preferido:</label>
                      <select
                        value={editingUser.idioma_preferido}
                        onChange={(e) => setEditingUser({...editingUser, idioma_preferido: e.target.value})}
                        className="form-control"
                      >
                        {getAvailableLanguages().map(lang => (
                          <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={editingUser.activo}
                        onChange={(e) => setEditingUser({...editingUser, activo: e.target.checked})}
                      />
                      Usuario activo
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="button button-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="button button-primary">
                  Actualizar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;