                <button
                  onClick={() => addArrayItem('tickets', 'prioridades')}
                  className="button button-primary"
                  style={{ marginTop: '10px' }}
                >
                  Añadir prioridad
                </button>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Categorías</h4>
                {formData.tickets.categorias.map((categoria, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                    <input
                      type="text"
                      value={categoria}
                      onChange={(e) => handleArrayChange('tickets', 'categorias', index, e.target.value)}
                      className="form-control"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => removeArrayItem('tickets', 'categorias', index)}
                      className="button"
                      style={{ backgroundColor: '#dc3545', color: 'white', padding: '8px 16px' }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('tickets', 'categorias')}
                  className="button button-primary"
                  style={{ marginTop: '10px' }}
                >
                  Añadir categoría
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notificaciones' && (
            <div>
              <h3 className="section-title">Configuración de Notificaciones</h3>
              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    checked={formData.notificaciones.email_habilitado}
                    onChange={(e) => handleInputChange('notificaciones', 'email_habilitado', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Notificaciones por email habilitadas
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    checked={formData.notificaciones.notificar_asignacion}
                    onChange={(e) => handleInputChange('notificaciones', 'notificar_asignacion', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Notificar asignación de tickets
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    checked={formData.notificaciones.notificar_cambio_estado}
                    onChange={(e) => handleInputChange('notificaciones', 'notificar_cambio_estado', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Notificar cambios de estado
                </label>
              </div>
            </div>
          )}

          {/* Botón de guardar */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="button button-primary"
              style={{
                backgroundColor: saving ? '#6c757d' : 'var(--primary-color)',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                padding: '12px 24px'
              }}
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigPage;