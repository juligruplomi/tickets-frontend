import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { api } from '../services/api';

function GastosPage() {
  const { user } = useAuth();
  const { config, t } = useConfig();
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGasto, setEditingGasto] = useState(null);
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [newGasto, setNewGasto] = useState({
    tipo_gasto: 'dieta',
    descripcion: '',
    obra: '',
    importe: '',
    fecha_gasto: new Date().toISOString().split('T')[0],
    archivos_adjuntos: [],
    // Campos específicos para combustible
    kilometros: '',
    precio_km: ''
  });

  useEffect(() => {
    loadGastos();
  }, []);

  const loadGastos = async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === 'operario' ? '/gastos/mis-gastos' : '/gastos';
      const response = await api.get(endpoint);
      setGastos(response.data);
    } catch (error) {
      console.error('Error loading gastos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (files) => {
    const fileNames = Array.from(files).map(file => file.name);
    setNewGasto({...newGasto, archivos_adjuntos: fileNames});
  };

  const handleEditFileUpload = (files) => {
    const fileNames = Array.from(files).map(file => file.name);
    setEditingGasto({...editingGasto, archivos_adjuntos: fileNames});
  };

  const createGasto = async (e) => {
    e.preventDefault();
    
    try {
      let gastoData = { ...newGasto };
      
      // Validaciones específicas por tipo
      if (newGasto.tipo_gasto === 'gasolina') {
        if (!newGasto.kilometros || !newGasto.precio_km) {
          alert('Para combustible es obligatorio especificar kilómetros y precio por km');
          return;
        }
        gastoData.kilometros = parseFloat(newGasto.kilometros);
        gastoData.precio_km = parseFloat(newGasto.precio_km);
        // El importe se calcula automáticamente en el backend
      } else {
        if (!newGasto.importe) {
          alert('El importe es obligatorio');
          return;
        }
        gastoData.importe = parseFloat(newGasto.importe);
      }

      // Validar archivos para dieta y aparcamiento
      if (['dieta', 'aparcamiento'].includes(newGasto.tipo_gasto)) {
        if (!newGasto.archivos_adjuntos || newGasto.archivos_adjuntos.length === 0) {
          alert(`Es obligatorio adjuntar una foto del ticket para ${newGasto.tipo_gasto}`);
          return;
        }
      }
      
      const response = await api.post('/gastos', gastoData);
      setGastos([response.data, ...gastos]);
      setNewGasto({
        tipo_gasto: 'dieta',
        descripcion: '',
        obra: '',
        importe: '',
        fecha_gasto: new Date().toISOString().split('T')[0],
        archivos_adjuntos: [],
        kilometros: '',
        precio_km: ''
      });
      setShowCreateModal(false);
      alert('Gasto creado correctamente');
    } catch (error) {
      console.error('Error creating gasto:', error);
      alert('Error al crear el gasto: ' + (error.response?.data?.error || 'Error desconocido'));
    }
  };

  const updateGasto = async (gastoId, updates) => {
    try {
      // Recalcular importe para combustible
      if (updates.tipo_gasto === 'gasolina' && updates.kilometros && updates.precio_km) {
        updates.kilometros = parseFloat(updates.kilometros);
        updates.precio_km = parseFloat(updates.precio_km);
      }
      
      const response = await api.put(`/gastos/${gastoId}`, updates);
      setGastos(gastos.map(g => g.id === gastoId ? response.data : g));
      setEditingGasto(null);
      alert('Gasto actualizado correctamente');
    } catch (error) {
      console.error('Error updating gasto:', error);
      alert('Error al actualizar el gasto: ' + (error.response?.data?.error || 'Error desconocido'));
    }
  };

  const aprobarGasto = async (gastoId, accion, observaciones = '') => {
    try {
      const response = await api.put(`/gastos/${gastoId}/aprobar`, {
        accion,
        observaciones
      });
      setGastos(gastos.map(g => g.id === gastoId ? response.data : g));
      alert(`Gasto ${accion === 'aprobar' ? 'aprobado' : 'rechazado'} correctamente`);
    } catch (error) {
      console.error('Error approving gasto:', error);
      alert('Error al procesar el gasto: ' + (error.response?.data?.error || 'Error desconocido'));
    }
  };

  const deleteGasto = async (gastoId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      try {
        await api.delete(`/gastos/${gastoId}`);
        setGastos(gastos.filter(g => g.id !== gastoId));
        alert('Gasto eliminado correctamente');
      } catch (error) {
        console.error('Error deleting gasto:', error);
        alert('Error al eliminar el gasto: ' + (error.response?.data?.error || 'Error desconocido'));
      }
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'pendiente': '#ffc107',
      'aprobado': '#28a745',
      'rechazado': '#dc3545',
      'pagado': '#0066CC'
    };
    return colores[estado] || '#6c757d';
  };

  const getTipoGastoInfo = (tipo) => {
    const tipos = {
      'dieta': { nombre: 'Dietas', icon: '🍽️' },
      'aparcamiento': { nombre: 'Aparcamiento', icon: '🅿️' },
      'gasolina': { nombre: 'Combustible', icon: '⛽' },
      'otros': { nombre: 'Otros', icon: '📎' }
    };
    return tipos[tipo] || { nombre: tipo, icon: '📄' };
  };

  const canApprove = (gasto) => {
    if (user?.role === 'administrador') return true;
    if (user?.role === 'supervisor' && gasto.supervisor_asignado === user.id) return true;
    if (user?.role === 'contabilidad') return true;
    return false;
  };

  const canEdit = (gasto) => {
    if (user?.role === 'administrador') return true;
    if (gasto.creado_por === user?.id && gasto.estado === 'pendiente') return true;
    return false;
  };

  const canDelete = (gasto) => {
    if (user?.role === 'administrador') return true;
    if (gasto.creado_por === user?.id && gasto.estado === 'pendiente') return true;
    return false;
  };

  const filteredGastos = gastos.filter(gasto => {
    const matchesFilter = filter === 'todos' || gasto.estado === filter;
    const matchesSearch = 
      gasto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gasto.obra && gasto.obra.toLowerCase().includes(searchTerm.toLowerCase())) ||
      getTipoGastoInfo(gasto.tipo_gasto).nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calcular importe automáticamente para combustible
  const calculateCombustibleImporte = (km, precio) => {
    if (km && precio) {
      return (parseFloat(km) * parseFloat(precio)).toFixed(2);
    }
    return '';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando gastos...</p>
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
              💰 Gestión de Gastos ({filteredGastos.length})
            </h2>
          </div>
          <div className="dashboard-controls">
            {(user?.role === 'operario' || user?.role === 'administrador') && (
              <button 
                className="button button-primary"
                onClick={() => setShowCreateModal(true)}
              >
                + Nuevo Gasto
              </button>
            )}
          </div>
        </div>
        
        <div className="card-body">
          {/* Filtros y búsqueda */}
          <div className="gastos-filters">
            <div className="filter-group">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="form-control"
                style={{ maxWidth: '200px' }}
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobado">Aprobados</option>
                <option value="rechazado">Rechazados</option>
                <option value="pagado">Pagados</option>
              </select>
            </div>
            
            <div className="search-group">
              <input
                type="text"
                placeholder="Buscar gastos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ maxWidth: '300px' }}
              />
            </div>
          </div>

          {/* Lista de gastos */}
          {filteredGastos.length === 0 ? (
            <div className="empty-state">
              <p>No hay gastos {filter !== 'todos' ? `en estado "${filter}"` : ''} {searchTerm ? `que coincidan con "${searchTerm}"` : ''}.</p>
              {filter === 'todos' && !searchTerm && user?.role === 'operario' && (
                <button 
                  className="button button-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  Crear tu primer gasto
                </button>
              )}
            </div>
          ) : (
            <div className="gastos-grid">
              {filteredGastos.map(gasto => {
                const tipoInfo = getTipoGastoInfo(gasto.tipo_gasto);
                return (
                  <div key={gasto.id} className="gasto-card">
                    <div className="gasto-header">
                      <div className="gasto-id">#{gasto.id}</div>
                      <div className="gasto-badges">
                        <span 
                          className="gasto-badge"
                          style={{ backgroundColor: getEstadoColor(gasto.estado) }}
                        >
                          {gasto.estado.toUpperCase()}
                        </span>
                        <span className="tipo-badge">
                          {tipoInfo.icon} {tipoInfo.nombre}
                        </span>
                      </div>
                    </div>
                    
                    <div className="gasto-content">
                      <h4 className="gasto-descripcion">{gasto.descripcion}</h4>
                      
                      {gasto.obra && (
                        <div className="gasto-obra">
                          <strong>Obra:</strong> {gasto.obra}
                        </div>
                      )}
                      
                      <div className="gasto-amount">
                        <span className="amount-label">Importe:</span>
                        <span className="amount-value">{gasto.importe.toFixed(2)}€</span>
                      </div>
                      
                      {/* Mostrar detalles de combustible */}
                      {gasto.tipo_gasto === 'gasolina' && gasto.kilometros && gasto.precio_km && (
                        <div className="combustible-details">
                          <div className="combustible-item">
                            <span>📏 Kilómetros: {gasto.kilometros} km</span>
                          </div>
                          <div className="combustible-item">
                            <span>💰 Precio/km: {gasto.precio_km.toFixed(3)}€</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="gasto-meta">
                        <span className="gasto-date">
                          📅 {new Date(gasto.fecha_gasto).toLocaleDateString()}
                        </span>
                        <span className="gasto-created">
                          🕒 {new Date(gasto.fecha_creacion).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Mostrar archivos adjuntos */}
                      {gasto.archivos_adjuntos && gasto.archivos_adjuntos.length > 0 && (
                        <div className="gasto-attachments">
                          <strong>📎 Adjuntos:</strong>
                          <ul>
                            {gasto.archivos_adjuntos.map((archivo, index) => (
                              <li key={index}>{archivo}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="gasto-actions">
                      {/* Acciones de aprobación */}
                      {gasto.estado === 'pendiente' && canApprove(gasto) && (
                        <div className="approval-actions">
                          <button
                            className="button button-success"
                            onClick={() => aprobarGasto(gasto.id, 'aprobar')}
                          >
                            ✅ Aprobar
                          </button>
                          <button
                            className="button button-danger"
                            onClick={() => {
                              const observaciones = prompt('Motivo del rechazo (opcional):');
                              if (observaciones !== null) {
                                aprobarGasto(gasto.id, 'rechazar', observaciones);
                              }
                            }}
                          >
                            ❌ Rechazar
                          </button>
                        </div>
                      )}
                      
                      {/* Acciones de edición */}
                      <div className="edit-actions">
                        {canEdit(gasto) && (
                          <button
                            className="button button-secondary"
                            onClick={() => setEditingGasto(gasto)}
                          >
                            ✏️ Editar
                          </button>
                        )}
                        
                        {canDelete(gasto) && (
                          <button
                            className="button button-danger"
                            onClick={() => deleteGasto(gasto.id)}
                          >
                            🗑️ Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear gasto */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nuevo Gasto</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={createGasto}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipo de gasto:</label>
                    <select
                      value={newGasto.tipo_gasto}
                      onChange={(e) => setNewGasto({...newGasto, tipo_gasto: e.target.value})}
                      className="form-control"
                      required
                    >
                      <option value="dieta">🍽️ Dietas</option>
                      <option value="aparcamiento">🅿️ Aparcamiento</option>
                      <option value="gasolina">⛽ Combustible</option>
                      <option value="otros">📎 Otros gastos</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Fecha del gasto:</label>
                    <input
                      type="date"
                      required
                      value={newGasto.fecha_gasto}
                      onChange={(e) => setNewGasto({...newGasto, fecha_gasto: e.target.value})}
                      className="form-control"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Descripción:</label>
                  <textarea
                    required
                    value={newGasto.descripcion}
                    onChange={(e) => setNewGasto({...newGasto, descripcion: e.target.value})}
                    className="form-control"
                    rows="3"
                    placeholder="Describe el gasto en detalle..."
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Obra:</label>
                  <input
                    type="text"
                    required
                    value={newGasto.obra}
                    onChange={(e) => setNewGasto({...newGasto, obra: e.target.value})}
                    className="form-control"
                    placeholder="Nombre de la obra o proyecto"
                  />
                </div>
                
                {/* Campos específicos para combustible */}
                {newGasto.tipo_gasto === 'gasolina' ? (
                  <div className="combustible-fields">
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Kilómetros:</label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          required
                          value={newGasto.kilometros}
                          onChange={(e) => setNewGasto({...newGasto, kilometros: e.target.value})}
                          className="form-control"
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Precio por km (€):</label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          required
                          value={newGasto.precio_km}
                          onChange={(e) => setNewGasto({...newGasto, precio_km: e.target.value})}
                          className="form-control"
                          placeholder="0.502"
                        />
                      </div>
                    </div>
                    
                    {newGasto.kilometros && newGasto.precio_km && (
                      <div className="calculated-amount">
                        <strong>Importe calculado: {calculateCombustibleImporte(newGasto.kilometros, newGasto.precio_km)}€</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Importe (€):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={newGasto.importe}
                      onChange={(e) => setNewGasto({...newGasto, importe: e.target.value})}
                      className="form-control"
                      placeholder="0.00"
                    />
                  </div>
                )}
                
                {/* Subida de archivos */}
                <div className="form-group">
                  <label className="form-label">
                    Adjuntar archivos:
                    {['dieta', 'aparcamiento'].includes(newGasto.tipo_gasto) && (
                      <span className="required-indicator"> (Obligatorio)</span>
                    )}
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="form-control"
                    required={['dieta', 'aparcamiento'].includes(newGasto.tipo_gasto)}
                  />
                  {['dieta', 'aparcamiento'].includes(newGasto.tipo_gasto) && (
                    <small className="form-help">
                      Es obligatorio adjuntar una foto del ticket para {newGasto.tipo_gasto}
                    </small>
                  )}
                  {newGasto.archivos_adjuntos && newGasto.archivos_adjuntos.length > 0 && (
                    <div className="uploaded-files">
                      <strong>Archivos seleccionados:</strong>
                      <ul>
                        {newGasto.archivos_adjuntos.map((file, index) => (
                          <li key={index}>{file}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
                  Crear Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar gasto */}
      {editingGasto && (
        <div className="modal-overlay" onClick={() => setEditingGasto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Gasto #{editingGasto.id}</h3>
              <button 
                className="modal-close"
                onClick={() => setEditingGasto(null)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              updateGasto(editingGasto.id, {
                tipo_gasto: editingGasto.tipo_gasto,
                descripcion: editingGasto.descripcion,
                obra: editingGasto.obra,
                importe: editingGasto.tipo_gasto === 'gasolina' ? null : parseFloat(editingGasto.importe),
                fecha_gasto: editingGasto.fecha_gasto,
                archivos_adjuntos: editingGasto.archivos_adjuntos,
                kilometros: editingGasto.tipo_gasto === 'gasolina' ? editingGasto.kilometros : null,
                precio_km: editingGasto.tipo_gasto === 'gasolina' ? editingGasto.precio_km : null
              });
            }}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipo de gasto:</label>
                    <select
                      value={editingGasto.tipo_gasto}
                      onChange={(e) => setEditingGasto({...editingGasto, tipo_gasto: e.target.value})}
                      className="form-control"
                      required
                    >
                      <option value="dieta">🍽️ Dietas</option>
                      <option value="aparcamiento">🅿️ Aparcamiento</option>
                      <option value="gasolina">⛽ Combustible</option>
                      <option value="otros">📎 Otros gastos</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Fecha del gasto:</label>
                    <input
                      type="date"
                      required
                      value={editingGasto.fecha_gasto}
                      onChange={(e) => setEditingGasto({...editingGasto, fecha_gasto: e.target.value})}
                      className="form-control"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Descripción:</label>
                  <textarea
                    required
                    value={editingGasto.descripcion}
                    onChange={(e) => setEditingGasto({...editingGasto, descripcion: e.target.value})}
                    className="form-control"
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Obra:</label>
                  <input
                    type="text"
                    required
                    value={editingGasto.obra || ''}
                    onChange={(e) => setEditingGasto({...editingGasto, obra: e.target.value})}
                    className="form-control"
                  />
                </div>
                
                {/* Campos específicos para combustible */}
                {editingGasto.tipo_gasto === 'gasolina' ? (
                  <div className="combustible-fields">
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Kilómetros:</label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          required
                          value={editingGasto.kilometros || ''}
                          onChange={(e) => setEditingGasto({...editingGasto, kilometros: e.target.value})}
                          className="form-control"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Precio por km (€):</label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          required
                          value={editingGasto.precio_km || ''}
                          onChange={(e) => setEditingGasto({...editingGasto, precio_km: e.target.value})}
                          className="form-control"
                        />
                      </div>
                    </div>
                    
                    {editingGasto.kilometros && editingGasto.precio_km && (
                      <div className="calculated-amount">
                        <strong>Importe calculado: {calculateCombustibleImporte(editingGasto.kilometros, editingGasto.precio_km)}€</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Importe (€):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={editingGasto.importe || ''}
                      onChange={(e) => setEditingGasto({...editingGasto, importe: e.target.value})}
                      className="form-control"
                    />
                  </div>
                )}
                
                {/* Subida de archivos */}
                <div className="form-group">
                  <label className="form-label">
                    Adjuntar archivos:
                    {['dieta', 'aparcamiento'].includes(editingGasto.tipo_gasto) && (
                      <span className="required-indicator"> (Obligatorio)</span>
                    )}
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) => handleEditFileUpload(e.target.files)}
                    className="form-control"
                  />
                  {editingGasto.archivos_adjuntos && editingGasto.archivos_adjuntos.length > 0 && (
                    <div className="uploaded-files">
                      <strong>Archivos actuales:</strong>
                      <ul>
                        {editingGasto.archivos_adjuntos.map((file, index) => (
                          <li key={index}>{file}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="button button-secondary"
                  onClick={() => setEditingGasto(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="button button-primary">
                  Actualizar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GastosPage;