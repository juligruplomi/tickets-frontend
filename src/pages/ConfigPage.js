                      style={{ maxWidth: '200px' }}
                    >
                      <option value="EUR">€ Euro</option>
                      <option value="USD">$ Dólar</option>
                      <option value="GBP">£ Libra</option>
                      <option value="JPY">¥ Yen</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Límite máximo por gasto individual (€):</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.gastos.configuracion?.limite_maximo_gasto || 1000}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          gastos: {
                            ...prev.gastos,
                            configuracion: {
                              ...prev.gastos.configuracion,
                              limite_maximo_gasto: parseFloat(e.target.value)
                            }
                          }
                        }));
                      }}
                      className="form-control"
                      style={{ maxWidth: '200px' }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.gastos.configuracion?.requiere_justificante_siempre || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            gastos: {
                              ...prev.gastos,
                              configuracion: {
                                ...prev.gastos.configuracion,
                                requiere_justificante_siempre: e.target.checked
                              }
                            }
                          }));
                        }}
                      />
                      Requiere justificante para todos los gastos
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Importe mínimo que requiere justificante (€):</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.gastos.configuracion?.importe_minimo_justificante || 50}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          gastos: {
                            ...prev.gastos,
                            configuracion: {
                              ...prev.gastos.configuracion,
                              importe_minimo_justificante: parseFloat(e.target.value)
                            }
                          }
                        }));
                      }}
                      className="form-control"
                      style={{ maxWidth: '200px' }}
                      disabled={formData.gastos.configuracion?.requiere_justificante_siempre}
                    />
                    <small style={{ color: 'var(--text-color)', opacity: 0.7, display: 'block', marginTop: '5px' }}>
                      {formData.gastos.configuracion?.requiere_justificante_siempre ? 
                        'Deshabilitado: se requiere justificante para todos los gastos' : 
                        'Gastos por encima de este importe requerirán justificante'
                      }
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.gastos.configuracion?.auto_aprobar_gastos_pequenos || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            gastos: {
                              ...prev.gastos,
                              configuracion: {
                                ...prev.gastos.configuracion,
                                auto_aprobar_gastos_pequenos: e.target.checked
                              }
                            }
                          }));
                        }}
                      />
                      Auto-aprobar gastos pequeños
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Tamaño máximo de archivos adjuntos (MB):</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={formData.gastos.configuracion?.tamano_maximo_adjunto || 10}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          gastos: {
                            ...prev.gastos,
                            configuracion: {
                              ...prev.gastos.configuracion,
                              tamano_maximo_adjunto: parseInt(e.target.value)
                            }
                          }
                        }));
                      }}
                      className="form-control"
                      style={{ maxWidth: '200px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notificaciones' && formData.notificaciones && (
            <div>
              <h3 className="section-title">Configuración de Notificaciones</h3>
              
              {/* Configuración general de email */}
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Configuración de Email</h4>
                <div style={{ 
                  display: 'grid', 
                  gap: '1rem',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  background: 'var(--card-background)'
                }}>
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.notificaciones.email_habilitado || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            notificaciones: {
                              ...prev.notificaciones,
                              email_habilitado: e.target.checked
                            }
                          }));
                        }}
                      />
                      Notificaciones por email habilitadas
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Plantilla de asunto:</label>
                    <input
                      type="text"
                      value={formData.notificaciones.plantilla_asunto || ''}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          notificaciones: {
                            ...prev.notificaciones,
                            plantilla_asunto: e.target.value
                          }
                        }));
                      }}
                      className="form-control"
                      placeholder="[{{empresa}}] Gasto {{tipo}}: {{descripcion}}"
                    />
                    <small style={{ color: 'var(--text-color)', opacity: 0.7, marginTop: '8px', display: 'block' }}>
                      Variables disponibles: {'{{'}}empresa{'}}'}, {'{{'}}tipo{'}}'}, {'{{'}}descripcion{'}}'}, {'{{'}}usuario{'}}'}, {'{{'}}importe{'}}'}
                    </small>
                  </div>
                  
                  {/* Configuración SMTP simplificada */}
                  <div style={{ marginTop: '1rem' }}>
                    <h5 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Servidor SMTP</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Servidor:</label>
                        <input
                          type="text"
                          value={formData.notificaciones.configuracion_email?.servidor_smtp || ''}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              notificaciones: {
                                ...prev.notificaciones,
                                configuracion_email: {
                                  ...prev.notificaciones.configuracion_email,
                                  servidor_smtp: e.target.value
                                }
                              }
                            }));
                          }}
                          className="form-control"
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Puerto:</label>
                        <input
                          type="number"
                          value={formData.notificaciones.configuracion_email?.puerto || ''}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              notificaciones: {
                                ...prev.notificaciones,
                                configuracion_email: {
                                  ...prev.notificaciones.configuracion_email,
                                  puerto: parseInt(e.target.value)
                                }
                              }
                            }));
                          }}
                          className="form-control"
                          placeholder="587"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Usuario:</label>
                        <input
                          type="email"
                          value={formData.notificaciones.configuracion_email?.usuario || ''}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              notificaciones: {
                                ...prev.notificaciones,
                                configuracion_email: {
                                  ...prev.notificaciones.configuracion_email,
                                  usuario: e.target.value
                                }
                              }
                            }));
                          }}
                          className="form-control"
                          placeholder="admin@gruplomi.com"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label className="form-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.notificaciones.configuracion_email?.ssl_habilitado || false}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              notificaciones: {
                                ...prev.notificaciones,
                                configuracion_email: {
                                  ...prev.notificaciones.configuracion_email,
                                  ssl_habilitado: e.target.checked
                                }
                              }
                            }));
                          }}
                        />
                        SSL/TLS habilitado
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Eventos de notificación para gastos */}
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Eventos de Notificación</h4>
                <div style={{ 
                  display: 'grid', 
                  gap: '1rem',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  background: 'var(--card-background)'
                }}>
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.notificaciones.eventos?.nuevo_gasto || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            notificaciones: {
                              ...prev.notificaciones,
                              eventos: {
                                ...prev.notificaciones.eventos,
                                nuevo_gasto: e.target.checked
                              }
                            }
                          }));
                        }}
                      />
                      Notificar cuando se registra un nuevo gasto
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.notificaciones.eventos?.gasto_aprobado || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            notificaciones: {
                              ...prev.notificaciones,
                              eventos: {
                                ...prev.notificaciones.eventos,
                                gasto_aprobado: e.target.checked
                              }
                            }
                          }));
                        }}
                      />
                      Notificar cuando un gasto es aprobado
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.notificaciones.eventos?.gasto_rechazado || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            notificaciones: {
                              ...prev.notificaciones,
                              eventos: {
                                ...prev.notificaciones.eventos,
                                gasto_rechazado: e.target.checked
                              }
                            }
                          }));
                        }}
                      />
                      Notificar cuando un gasto es rechazado
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.notificaciones.eventos?.limite_categoria_alcanzado || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            notificaciones: {
                              ...prev.notificaciones,
                              eventos: {
                                ...prev.notificaciones.eventos,
                                limite_categoria_alcanzado: e.target.checked
                              }
                            }
                          }));
                        }}
                      />
                      Notificar cuando se alcanza el límite de una categoría
                    </label>
                  </div>
                </div>
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