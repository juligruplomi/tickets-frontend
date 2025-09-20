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
            <div className="users-grid">
              {filteredUsers.map(userData => (
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
                    <div className="detail-item">
                      <strong>Contratación:</strong> {userData.fecha_contratacion ? new Date(userData.fecha_contratacion).toLocaleDateString() : 'N/A'}
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
              ))}
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
                      <label className="form-label">Fecha de Contratación:</label>
                      <input
                        type="date"
                        required
                        value={newUser.fecha_contratacion}
                        onChange={(e) => setNewUser({...newUser, fecha_contratacion: e.target.value})}
                        className="form-control"
                      />
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
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="ca">Català</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">URL de Foto:</label>
                    <input
                      type="url"
                      value={newUser.foto_url}
                      onChange={(e) => setNewUser({...newUser, foto_url: e.target.value})}
                      className="form-control"
                      placeholder="/avatars/usuario.jpg"
                    />
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
                fecha_contratacion: editingUser.fecha_contratacion,
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
                      <label className="form-label">Fecha de Contratación:</label>
                      <input
                        type="date"
                        required
                        value={editingUser.fecha_contratacion || ''}
                        onChange={(e) => setEditingUser({...editingUser, fecha_contratacion: e.target.value})}
                        className="form-control"
                      />
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
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="ca">Català</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">URL de Foto:</label>
                    <input
                      type="url"
                      value={editingUser.foto_url || ''}
                      onChange={(e) => setEditingUser({...editingUser, foto_url: e.target.value})}
                      className="form-control"
                    />
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