import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { gastosService } from '../services/api';

function GastosPage() {
  const { user } = useAuth();
  const { config, t } = useConfig();
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGasto, setEditingGasto] = useState(null);
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    // Recuperar preferencia guardada o usar 'grid' por defecto
    return localStorage.getItem('gastosViewMode') || 'grid';
  });
  const [newGasto, setNewGasto] = useState({
    tipo_gasto: 'dieta',
    descripcion: '',
    obra: '',
    importe: '',
    fecha_gasto: new Date().toISOString().split('T')[0],
    archivos_adjuntos: [],
    foto_justificante: null,
    // Campos específicos para combustible
    kilometros: '',
    precio_km: ''
  });
  const [viewingImages, setViewingImages] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Función para cambiar el modo de vista
  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('gastosViewMode', mode);
  };

  // Funciones para el visor de imágenes
  const openImageViewer = (gasto) => {
    // Verificar si tiene foto_justificante
    if (gasto.foto_justificante) {
      // Crear un objeto temporal con la foto en formato array para compatibilidad
      setViewingImages({
        ...gasto,
        archivos_adjuntos: [gasto.foto_justificante]
      });
      setCurrentImageIndex(0);
    } else if (gasto.archivos_adjuntos && gasto.archivos_adjuntos.length > 0) {
      // Fallback para el formato antiguo
      setViewingImages(gasto);
      setCurrentImageIndex(0);
    }
  };

  const closeImageViewer = () => {
    setViewingImages(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (viewingImages && currentImageIndex < viewingImages.archivos_adjuntos.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (viewingImages && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleImageViewerKeyDown = (e) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeImageViewer();
  };

  useEffect(() => {
    if (viewingImages) {
      window.addEventListener('keydown', handleImageViewerKeyDown);
      return () => window.removeEventListener('keydown', handleImageViewerKeyDown);
    }
  }, [viewingImages, currentImageIndex]);

  useEffect(() => {
    loadGastos();
  }, []);

  const loadGastos = async () => {
    try {
      setLoading(true);
      const response = await gastosService.getAll();
      setGastos(response.data);
    } catch (error) {
      console.error('Error loading gastos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    if (files && files.length > 0) {
      const file = files[0]; // Solo tomamos el primer archivo
      
      // Convertir la imagen a base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        setNewGasto({
          ...newGasto, 
          archivos_adjuntos: [file.name],
          foto_justificante: base64Image // Guardar el base64
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditFileUpload = async (files) => {
    if (files && files.length > 0) {
      const file = files[0]; // Solo tomamos el primer archivo
      
      // Convertir la imagen a base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        setEditingGasto({
          ...editingGasto, 
          archivos_adjuntos: [file.name],
          foto_justificante: base64Image // Guardar el base64
        });
      };
      reader.readAsDataURL(file);
    }
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
      
      const response = await gastosService.create(gastoData);
      setGastos([response.data, ...gastos]);
      setNewGasto({
        tipo_gasto: 'dieta',
        descripcion: '',
        obra: '',
        importe: '',
        fecha_gasto: new Date().toISOString().split('T')[0],
        archivos_adjuntos: [],
        foto_justificante: null,
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
      
      const response = await gastosService.update(gastoId, updates);
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
      const response = accion === 'aprobar' 
        ? await gastosService.aprobar(gastoId)
        : await gastosService.rechazar(gastoId, observaciones);
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
        await gastosService.delete(gastoId);
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
    if (km && precio && km.toString().trim() !== '' && precio.toString().trim() !== '') {
      const kmNum = parseFloat(km);
      const precioNum = parseFloat(precio);
      if (!isNaN(kmNum) && !isNaN(precioNum)) {
        return (kmNum * precioNum).toFixed(2);
      }
    }
    return '0.00';
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
              💰 Gestión de Gastos
            </h2>
          </div>
          <div className="dashboard-controls">
            <button 
              className="button button-primary"
              onClick={() => setShowCreateModal(true)}
            >
              ➕ Nuevo Gasto
            </button>
          </div>
        </div>
        
        <div className="card-body">
          {/* Filtros, búsqueda y controles de vista */}
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
            
            {/* Controles de vista */}
            <div className="view-controls">
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => toggleViewMode('grid')}
                  title="Vista de cuadrícula"
                >
                  ⊞
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => toggleViewMode('list')}
                  title="Vista de lista"
                >
                  ☰
                </button>
              </div>
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
            <div className={`gastos-container ${viewMode === 'list' ? 'gastos-list' : 'gastos-grid'}`}>
              {filteredGastos.map(gasto => {
                const tipoInfo = getTipoGastoInfo(gasto.tipo_gasto);
                
                if (viewMode === 'list') {
                  // Vista de lista - más compacta, horizontal
                  return (
                    <div key={gasto.id} className="gasto-list-item">
                      <div className="gasto-list-left">
                        <div className="gasto-list-header">
                          <span className="gasto-id">#{gasto.id}</span>
                          <span className="tipo-badge-small">
                            {tipoInfo.icon} {tipoInfo.nombre}
                          </span>
                          <span 
                            className="estado-badge-small"
                            style={{ backgroundColor: getEstadoColor(gasto.estado) }}
                          >
                            {gasto.estado.toUpperCase()}
                          </span>
                        </div>
                        
                        <h4 className="gasto-list-descripcion">{gasto.descripcion}</h4>
                        
                        {gasto.obra && (
                          <div className="gasto-list-obra">
                            <strong>Obra:</strong> {gasto.obra}
                          </div>
                        )}
                        
                        <div className="gasto-list-meta">
                          <span className="gasto-date">
                            📅 {new Date(gasto.fecha_gasto).toLocaleDateString()}
                          </span>
                          {gasto.tipo_gasto === 'gasolina' && gasto.kilometros && (
                            <span className="combustible-info">
                              📏 {gasto.kilometros} km × {gasto.precio_km.toFixed(3)}€/km
                            </span>
                          )}
                          {(gasto.foto_justificante || (gasto.archivos_adjuntos && gasto.archivos_adjuntos.length > 0)) && (
                            <span className="attachments-indicator">
                              📎 1 adjunto
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="gasto-list-right">
                        <div className="gasto-list-amount">
                          <span className="amount-value">{gasto.importe.toFixed(2)}€</span>
                        </div>
                        
                        <div className="gasto-list-actions">
                          {/* Botón para ver fotos */}
                          {(gasto.foto_justificante || (gasto.archivos_adjuntos && gasto.archivos_adjuntos.length > 0)) && (
                            <button
                              className="btn-compact btn-info"
                              onClick={() => openImageViewer(gasto)}
                              title="Ver fotos del ticket"
                            >
                              👁️
                            </button>
                          )}
                          
                          {/* Acciones de aprobación */}
                          {gasto.estado === 'pendiente' && canApprove(gasto) && (
                            <div className="approval-actions-compact">
                              <button
                                className="btn-compact btn-success"
                                onClick={() => aprobarGasto(gasto.id, 'aprobar')}
                                title="Aprobar"
                              >
                                ✅
                              </button>
                              <button
                                className="btn-compact btn-danger"
                                onClick={() => {
                                  const observaciones = prompt('Motivo del rechazo (opcional):');
                                  if (observaciones !== null) {
                                    aprobarGasto(gasto.id, 'rechazar', observaciones);
                                  }
                                }}
                                title="Rechazar"
                              >
                                ❌
                              </button>
                            </div>
                          )}
                          
                          {/* Acciones de edición */}
                          <div className="edit-actions-compact">
                            {canEdit(gasto) && (
                              <button
                                className="btn-compact btn-secondary"
                                onClick={() => setEditingGasto(gasto)}
                                title="Editar"
                              >
                                ✏️
                              </button>
                            )}
                            
                            {canDelete(gasto) && (
                              <button
                                className="btn-compact btn-danger"
                                onClick={() => deleteGasto(gasto.id)}
                                title="Eliminar"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // Vista de cuadrícula - original
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
                      {(gasto.foto_justificante || (gasto.archivos_adjuntos && gasto.archivos_adjuntos.length > 0)) && (
                        <div className="gasto-attachments">
                          <div className="attachments-header">
                            <strong>📎 Adjuntos: 1</strong>
                            <button
                              className="button button-sm button-info"
                              onClick={() => openImageViewer(gasto)}
                              title="Ver fotos"
                            >
                              👁️ Ver foto
                            </button>
                          </div>
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
                    }
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
                    
                    {/* Campo calculado - aparece cuando hay ambos valores */}
                    {newGasto.kilometros && newGasto.precio_km && newGasto.kilometros.trim() !== '' && newGasto.precio_km.trim() !== '' && (
                      <div className="calculated-amount">
                        <label className="form-label">Importe calculado:</label>
                        <input
                          type="text"
                          value={`${calculateCombustibleImporte(newGasto.kilometros, newGasto.precio_km)}€`}
                          className="calculated-amount-field"
                          readOnly
                          disabled
                        />
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
                    
                    {/* Campo calculado - aparece cuando hay ambos valores */}
                    {editingGasto.kilometros && editingGasto.precio_km && editingGasto.kilometros.toString().trim() !== '' && editingGasto.precio_km.toString().trim() !== '' && (
                      <div className="calculated-amount">
                        <label className="form-label">Importe calculado:</label>
                        <input
                          type="text"
                          value={`${calculateCombustibleImporte(editingGasto.kilometros, editingGasto.precio_km)}€`}
                          className="calculated-amount-field"
                          readOnly
                          disabled
                        />
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

      {/* Modal visor de imágenes */}
      {viewingImages && (
        <div className="modal-overlay image-viewer-overlay" onClick={closeImageViewer}>
          <div className="image-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="image-viewer-header">
              <div className="image-viewer-title">
                <h3>👁️ Fotos del Ticket #{viewingImages.id}</h3>
                <p className="image-counter">
                  Imagen {currentImageIndex + 1} de {viewingImages.archivos_adjuntos.length}
                </p>
              </div>
              <button 
                className="image-viewer-close"
                onClick={closeImageViewer}
                title="Cerrar (ESC)"
              >
                ×
              </button>
            </div>
            
            <div className="image-viewer-body">
              {/* Controles de navegación */}
              {viewingImages.archivos_adjuntos.length > 1 && (
                <>
                  <button
                    className="image-nav-btn prev-btn"
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                    title="Imagen anterior (←)"
                  >
                    ←
                  </button>
                  <button
                    className="image-nav-btn next-btn"
                    onClick={nextImage}
                    disabled={currentImageIndex === viewingImages.archivos_adjuntos.length - 1}
                    title="Imagen siguiente (→)"
                  >
                    →
                  </button>
                </>
              )}
              
              {/* Imagen principal */}
              <div className="image-viewer-content">
                <img
                  src={viewingImages.archivos_adjuntos[currentImageIndex]}
                  alt={`Ticket ${viewingImages.id} - Imagen ${currentImageIndex + 1}`}
                  className="viewer-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="18" font-family="Arial"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              
              {/* Información del gasto */}
              <div className="image-viewer-info">
                <div className="info-row">
                  <strong>Tipo:</strong>
                  <span>{getTipoGastoInfo(viewingImages.tipo_gasto).icon} {getTipoGastoInfo(viewingImages.tipo_gasto).nombre}</span>
                </div>
                <div className="info-row">
                  <strong>Descripción:</strong>
                  <span>{viewingImages.descripcion}</span>
                </div>
                <div className="info-row">
                  <strong>Importe:</strong>
                  <span>{viewingImages.importe.toFixed(2)}€</span>
                </div>
                <div className="info-row">
                  <strong>Fecha:</strong>
                  <span>{new Date(viewingImages.fecha_gasto).toLocaleDateString()}</span>
                </div>
                {viewingImages.obra && (
                  <div className="info-row">
                    <strong>Obra:</strong>
                    <span>{viewingImages.obra}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Miniaturas */}
            {viewingImages.archivos_adjuntos.length > 1 && (
              <div className="image-thumbnails">
                {viewingImages.archivos_adjuntos.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img src={img} alt={`Miniatura ${index + 1}`} />
                    <span className="thumbnail-number">{index + 1}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="image-viewer-footer">
              <p className="viewer-hint">
                💡 Usa las flechas del teclado (← →) para navegar | ESC para cerrar
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GastosPage;