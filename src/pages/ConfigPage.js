import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { api } from '../services/api';

function ConfigPage() {
  const { user } = useAuth();
  const { config, t, reloadConfig, changeLanguage } = useConfig();
  const [adminConfig, setAdminConfig] = useState(null);
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('empresa');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadAdminConfig = async () => {
    try {
      const response = await api.get('/config/admin');
      return response.data;
    } catch (err) {
      console.error('Error loading admin config:', err);
      throw err;
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      const response = await api.put('/config/admin', newConfig);
      setAdminConfig(response.data.config);
      reloadConfig();
      return { success: true };
    } catch (err) {
      console.error('Error updating config:', err);
      return { success: false, error: err.response?.data?.error || 'Error al actualizar configuración' };
    }
  };

  useEffect(() => {
    if (user?.role === 'administrador') {
      loadAdminConfig().then(config => {
        setAdminConfig(config);
        setFormData(JSON.parse(JSON.stringify(config)));
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateConfig(formData);
    if (result.success) {
      setMessage('Configuración guardada exitosamente.');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Error: ' + result.error);
      setTimeout(() => setMessage(''), 5000);
    }
    setSaving(false);
  };

  if (user?.role !== 'administrador') {
    return (
      <div className="container">
        <div className="card dashboard-card">
          <div className="card-header">
            <h2 className="card-title">⚙️ Mi Configuración</h2>
            {message && (
              <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
                {message}
              </div>
            )}
          </div>
          
          <div className="card-body">
            <div style={{ maxWidth: '600px' }}>
              <h3 className="section-title">Preferencias de Idioma</h3>
              
              <div style={{
                background: 'var(--secondary-color)',
                padding: '1.5rem',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)',
                marginBottom: '2rem'
              }}>
                <div className="form-group">
                  <label className="form-label">Idioma de la interfaz:</label>
                  <select
                    value={user?.idioma_preferido || 'es'}
                    onChange={async (e) => {
                      const newLanguage = e.target.value;
                      setSaving(true);
                      
                      try {
                        await changeLanguage(newLanguage);
                        setMessage('Idioma cambiado exitosamente.');
                        setTimeout(() => setMessage(''), 3000);
                      } catch (err) {
                        console.error('Error changing language:', err);
                        setMessage('Error al cambiar el idioma. Inténtalo de nuevo.');
                        setTimeout(() => setMessage(''), 5000);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className="form-control"
                    disabled={saving}
                    style={{ maxWidth: '300px' }}
                  >
                    <option value="es">🇪🇸 Español</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="ca">🏴󠁥󠁳󠁣󠁴󠁿 Català</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="it">🇮🇹 Italiano</option>
                    <option value="pt">🇵🇹 Português</option>
                  </select>
                  <small style={{ color: 'var(--text-color)', opacity: 0.7, display: 'block', marginTop: '8px' }}>
                    Los cambios se aplicarán inmediatamente en toda la interfaz.
                  </small>
                </div>
                
                {saving && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    marginTop: '1rem',
                    color: 'var(--primary-color)'
                  }}>
                    <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                    <span>Cambiando idioma...</span>
                  </div>
                )}
              </div>
              
              <div style={{
                background: 'rgba(0, 102, 204, 0.1)',
                border: '1px solid rgba(0, 102, 204, 0.2)',
                borderRadius: 'var(--border-radius)',
                padding: '1rem',
                fontSize: '0.875rem'
              }}>
                <h4 style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: 'var(--primary-color)',
                  fontSize: '1rem'
                }}>
                  📝 Nota:
                </h4>
                <p style={{ margin: 0, lineHeight: '1.4' }}>
                  Solo puedes cambiar tu idioma personal. Para modificar otras configuraciones del sistema, 
                  contacta con el administrador.
                </p>
              </div>
            </div>
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
              <p>Cargando configuración...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body">
            <p>Error al cargar la configuración</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Configuración del Sistema</h2>
          {message && (
            <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
              {message}
            </div>
          )}
        </div>
        
        <div className="card-body">
          {/* Pestañas principales */}
          <div className="config-tabs">
            {['empresa', 'gastos'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`config-tab ${activeTab === tab ? 'active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Contenido de pestañas */}
          {activeTab === 'empresa' && (
            <div>
              <h3 className="section-title">Información de la Empresa</h3>
              <div className="form-group">
                <label className="form-label">Nombre de la empresa:</label>
                <input
                  type="text"
                  value={formData.empresa?.nombre || ''}
                  onChange={(e) => handleInputChange('empresa', 'nombre', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          )}

          {activeTab === 'gastos' && (
            <div>
              <h3 className="section-title">Configuración de Gastos</h3>
              
              {/* Configuración general de gastos */}
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Configuración General</h4>
                <div style={{ 
                  display: 'grid', 
                  gap: '1rem',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  background: 'var(--card-background)'
                }}>
                  <div className="form-group">
                    <label className="form-label">Moneda por defecto:</label>
                    <select
                      value={formData.gastos?.configuracion?.moneda_defecto || 'EUR'}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          gastos: {
                            ...prev.gastos,
                            configuracion: {
                              ...prev.gastos?.configuracion,
                              moneda_defecto: e.target.value
                            }
                          }
                        }));
                      }}
                      className="form-control"
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
                      value={formData.gastos?.configuracion?.limite_maximo_gasto || 1000}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          gastos: {
                            ...prev.gastos,
                            configuracion: {
                              ...prev.gastos?.configuracion,
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
                        checked={formData.gastos?.configuracion?.requiere_justificante_siempre || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            gastos: {
                              ...prev.gastos,
                              configuracion: {
                                ...prev.gastos?.configuracion,
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
                      value={formData.gastos?.configuracion?.importe_minimo_justificante || 50}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          gastos: {
                            ...prev.gastos,
                            configuracion: {
                              ...prev.gastos?.configuracion,
                              importe_minimo_justificante: parseFloat(e.target.value)
                            }
                          }
                        }));
                      }}
                      className="form-control"
                      style={{ maxWidth: '200px' }}
                      disabled={formData.gastos?.configuracion?.requiere_justificante_siempre}
                    />
                    <small style={{ color: 'var(--text-color)', opacity: 0.7, display: 'block', marginTop: '5px' }}>
                      {formData.gastos?.configuracion?.requiere_justificante_siempre ? 
                        'Deshabilitado: se requiere justificante para todos los gastos' : 
                        'Gastos por encima de este importe requerirán justificante'
                      }
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.gastos?.configuracion?.auto_aprobar_gastos_pequenos || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            gastos: {
                              ...prev.gastos,
                              configuracion: {
                                ...prev.gastos?.configuracion,
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
                      value={formData.gastos?.configuracion?.tamano_maximo_adjunto || 10}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          gastos: {
                            ...prev.gastos,
                            configuracion: {
                              ...prev.gastos?.configuracion,
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