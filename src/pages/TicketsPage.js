import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { api } from '../services/api';

function TicketsPage() {
  const { user } = useAuth();
  const { config, t } = useConfig();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTicket, setNewTicket] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    categoria: 'general'
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/tickets', newTicket);
      setTickets([response.data, ...tickets]);
      setNewTicket({ titulo: '', descripcion: '', prioridad: 'media', categoria: 'general' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error al crear el ticket');
    }
  };

  const updateTicket = async (ticketId, updates) => {
    try {
      const response = await api.put(`/tickets/${ticketId}`, updates);
      setTickets(tickets.map(t => t.id === ticketId ? response.data : t));
      setEditingTicket(null);
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Error al actualizar el ticket');
    }
  };

  const deleteTicket = async (ticketId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este ticket?')) {
      try {
        await api.delete(`/tickets/${ticketId}`);
        setTickets(tickets.filter(t => t.id !== ticketId));
      } catch (error) {
        console.error('Error deleting ticket:', error);
        alert('Error al eliminar el ticket');
      }
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'abierto': return '#dc3545';
      case 'en_progreso': return '#fd7e14';
      case 'pendiente': return '#ffc107';
      case 'resuelto': return '#28a745';
      case 'cerrado': return '#6c757d';
      default: return '#007bff';
    }
  };

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'urgente': return '#dc3545';
      case 'alta': return '#fd7e14';
      case 'media': return '#ffc107';
      case 'baja': return '#28a745';
      default: return '#6c757d';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === 'todos' || ticket.estado === filter;
    const matchesSearch = ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando tickets...</p>
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
            <h2 className="card-title">{t('tickets')} ({filteredTickets.length})</h2>
          </div>
          <div className="dashboard-controls">
            <button 
              className="button button-primary"
              onClick={() => setShowCreateModal(true)}
            >
              + Nuevo Ticket
            </button>
          </div>
        </div>
        
        <div className="card-body">
          {/* Filtros y búsqueda */}
          <div className="tickets-filters">
            <div className="filter-group">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="form-control"
                style={{ maxWidth: '200px' }}
              >
                <option value="todos">Todos los estados</option>
                {config.tickets.estados.map(estado => (
                  <option key={estado} value={estado}>
                    {estado.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="search-group">
              <input
                type="text"
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ maxWidth: '300px' }}
              />
            </div>
          </div>

          {/* Lista de tickets */}
          {filteredTickets.length === 0 ? (
            <div className="empty-state">
              <p>No hay tickets {filter !== 'todos' ? `en estado "${filter}"` : ''} {searchTerm ? `que coincidan con "${searchTerm}"` : ''}.</p>
              {filter === 'todos' && !searchTerm && (
                <button 
                  className="button button-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  Crear tu primer ticket
                </button>
              )}
            </div>
          ) : (
            <div className="tickets-grid">
              {filteredTickets.map(ticket => (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-header">
                    <div className="ticket-id">#{ticket.id}</div>
                    <div className="ticket-badges">
                      <span 
                        className="ticket-badge"
                        style={{ backgroundColor: getStatusColor(ticket.estado) }}
                      >
                        {ticket.estado.replace('_', ' ')}
                      </span>
                      <span 
                        className="ticket-badge"
                        style={{ backgroundColor: getPriorityColor(ticket.prioridad) }}
                      >
                        {ticket.prioridad}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ticket-content">
                    <h4 className="ticket-title">{ticket.titulo}</h4>
                    <p className="ticket-description">{ticket.descripcion}</p>
                    
                    <div className="ticket-meta">
                      <span className="ticket-category">📁 {ticket.categoria}</span>
                      <span className="ticket-date">
                        📅 {new Date(ticket.fecha_creacion).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ticket-actions">
                    {user?.role === 'admin' && (
                      <select
                        value={ticket.estado}
                        onChange={(e) => updateTicket(ticket.id, { estado: e.target.value })}
                        className="form-control ticket-status-select"
                      >
                        {config.tickets.estados.map(estado => (
                          <option key={estado} value={estado}>
                            {estado.replace('_', ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {(user?.role === 'admin' || ticket.creado_por === user?.id) && (
                      <div className="ticket-action-buttons">
                        <button
                          className="button button-secondary"
                          onClick={() => setEditingTicket(ticket)}
                        >
                          ✏️
                        </button>
                        {user?.role === 'admin' && (
                          <button
                            className="button button-danger"
                            onClick={() => deleteTicket(ticket.id)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear ticket */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nuevo Ticket</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={createTicket}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Título:</label>
                  <input
                    type="text"
                    required
                    value={newTicket.titulo}
                    onChange={(e) => setNewTicket({...newTicket, titulo: e.target.value})}
                    className="form-control"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Observaciones (opcional):</label>
                  <textarea
                    value={newGasto.observaciones}
                    onChange={(e) => setNewGasto({...newGasto, observaciones: e.target.value})}
                    className="form-control"
                    rows="2"
                    placeholder="Información adicional..."
                  />
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
                concepto: editingGasto.concepto,
                descripcion: editingGasto.descripcion,
                importe: parseFloat(editingGasto.importe),
                fecha_gasto: editingGasto.fecha_gasto,
                observaciones: editingGasto.observaciones
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
                  <label className="form-label">Concepto:</label>
                  <input
                    type="text"
                    required
                    value={editingGasto.concepto}
                    onChange={(e) => setEditingGasto({...editingGasto, concepto: e.target.value})}
                    className="form-control"
                  />
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
                  <label className="form-label">Importe (€):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingGasto.importe}
                    onChange={(e) => setEditingGasto({...editingGasto, importe: e.target.value})}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Observaciones:</label>
                  <textarea
                    value={editingGasto.observaciones}
                    onChange={(e) => setEditingGasto({...editingGasto, observaciones: e.target.value})}
                    className="form-control"
                    rows="2"
                  />
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

export default GastosPage;="Describe brevemente el problema"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Descripción:</label>
                  <textarea
                    required
                    value={newTicket.descripcion}
                    onChange={(e) => setNewTicket({...newTicket, descripcion: e.target.value})}
                    className="form-control"
                    rows="4"
                    placeholder="Describe el problema en detalle"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Prioridad:</label>
                    <select
                      value={newTicket.prioridad}
                      onChange={(e) => setNewTicket({...newTicket, prioridad: e.target.value})}
                      className="form-control"
                    >
                      {config.tickets.prioridades.map(prioridad => (
                        <option key={prioridad} value={prioridad}>
                          {prioridad.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Categoría:</label>
                    <select
                      value={newTicket.categoria}
                      onChange={(e) => setNewTicket({...newTicket, categoria: e.target.value})}
                      className="form-control"
                    >
                      {config.tickets.categorias.map(categoria => (
                        <option key={categoria} value={categoria}>
                          {categoria.toUpperCase()}
                        </option>
                      ))}
                    </select>
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
                  Crear Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar ticket */}
      {editingTicket && (
        <div className="modal-overlay" onClick={() => setEditingTicket(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Ticket #{editingTicket.id}</h3>
              <button 
                className="modal-close"
                onClick={() => setEditingTicket(null)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              updateTicket(editingTicket.id, {
                titulo: editingTicket.titulo,
                descripcion: editingTicket.descripcion,
                prioridad: editingTicket.prioridad,
                categoria: editingTicket.categoria
              });
            }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Título:</label>
                  <input
                    type="text"
                    required
                    value={editingTicket.titulo}
                    onChange={(e) => setEditingTicket({...editingTicket, titulo: e.target.value})}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Descripción:</label>
                  <textarea
                    required
                    value={editingTicket.descripcion}
                    onChange={(e) => setEditingTicket({...editingTicket, descripcion: e.target.value})}
                    className="form-control"
                    rows="4"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Prioridad:</label>
                    <select
                      value={editingTicket.prioridad}
                      onChange={(e) => setEditingTicket({...editingTicket, prioridad: e.target.value})}
                      className="form-control"
                    >
                      {config.tickets.prioridades.map(prioridad => (
                        <option key={prioridad} value={prioridad}>
                          {prioridad.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Categoría:</label>
                    <select
                      value={editingTicket.categoria}
                      onChange={(e) => setEditingTicket({...editingTicket, categoria: e.target.value})}
                      className="form-control"
                    >
                      {config.tickets.categorias.map(categoria => (
                        <option key={categoria} value={categoria}>
                          {categoria.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="button button-secondary"
                  onClick={() => setEditingTicket(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="button button-primary">
                  Actualizar Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketsPage;