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
                    value={editingGasto.obra}
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
                      value={editingGasto.importe}
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