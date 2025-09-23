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
        // Si falla cargar config, usar valores por defecto
        const defaultConfig = {
          empresa: { 
            nombre: '', 
            logo_url: '', 
            colores: { 
              primario: '#0066CC', 
              secundario: '#f8f9fa', 
              acento: '#28a745' 
            } 
          },
          idioma: { predeterminado: 'es' },
          apariencia: { modo_oscuro: false, tema: 'default' },
          gastos: {
            categorias: [
              { id: '1', nombre: 'Transporte', icono: '🚗', limite_mensual: 500 },
              { id: '2', nombre: 'Comidas', icono: '🍽️', limite_mensual: 300 },
              { id: '3', nombre: 'Material de oficina', icono: '💼', limite_mensual: 200 },
              { id: '4', nombre: 'Formación', icono: '📚', limite_mensual: 1000 }
            ],
            configuracion: {
              moneda_defecto: 'EUR',
              limite_maximo_gasto: 1000,
              requiere_justificante_siempre: false,
              importe_minimo_justificante: 50,
              auto_aprobar_gastos_pequenos: false,
              permitir_gastos_futuros: false,
              dias_max_retroactivos: 30,
              tamano_maximo_adjunto: 10,
              requiere_aprobacion_supervisor: true,
              notificar_aprobaciones: true,
              dias_limite_aprobacion: 7
            }
          },
          notificaciones: {
            email_habilitado: false,
            plantilla_asunto: '',
            email_admin: ''
          }
        };
        setFormData(defaultConfig);
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

  const handleNestedInputChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section]?.[subsection],
          [field]: value
        }
      }
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target.result;
        setFormData(prev => ({
          ...prev,
          empresa: {
            ...prev.empresa,
            logo_url: logoUrl,
            logo_file: file.name
          }
        }));
      };
      reader.readAsDataURL(file);
    }
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

  // Panel para usuarios no administradores
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

  // Panel para administradores
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
            {['empresa', 'idiomas', 'apariencia', 'gastos', 'notificaciones'].map(tab => (
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
              
              <div className="form-group">
                <label className="form-label">Logo de la empresa:</label>
                <div style={{ marginBottom: '15px' }}>
                  <label className="form-label">URL del logo:</label>
                  <input
                    type="text"
                    value={formData.empresa?.logo_url || ''}
                    onChange={(e) => handleInputChange('empresa', 'logo_url', e.target.value)}
                    className="form-control"
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>
                <div>
                  <label className="form-label">O subir archivo:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="form-control"
                    style={{ marginBottom: '15px' }}
                  />
                  {formData.empresa?.logo_url && (
                    <div style={{ marginTop: '15px' }}>
                      <p><strong>Vista previa:</strong></p>
                      <img 
                        src={formData.empresa.logo_url} 
                        alt="Logo preview" 
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '100px', 
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--border-radius-small)',
                          background: 'var(--card-background)'
                        }}
                        onError={(e) => {e.target.style.display = 'none'}}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <h4 className="section-title">Colores corporativos</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Color primario:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={formData.empresa?.colores?.primario || '#0066CC'}
                      onChange={(e) => handleNestedInputChange('empresa', 'colores', 'primario', e.target.value)}
                      style={{ width: '60px', height: '40px', borderRadius: 'var(--border-radius-small)', border: 'none' }}
                    />
                    <input
                      type="text"
                      value={formData.empresa?.colores?.primario || '#0066CC'}
                      onChange={(e) => handleNestedInputChange('empresa', 'colores', 'primario', e.target.value)}
                      className="form-control"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Color secundario:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={formData.empresa?.colores?.secundario || '#f8f9fa'}
                      onChange={(e) => handleNestedInputChange('empresa', 'colores', 'secundario', e.target.value)}
                      style={{ width: '60px', height: '40px', borderRadius: 'var(--border-radius-small)', border: 'none' }}
                    />
                    <input
                      type="text"
                      value={formData.empresa?.colores?.secundario || '#f8f9fa'}
                      onChange={(e) => handleNestedInputChange('empresa', 'colores', 'secundario', e.target.value)}
                      className="form-control"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Color de acento:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={formData.empresa?.colores?.acento || '#28a745'}
                      onChange={(e) => handleNestedInputChange('empresa', 'colores', 'acento', e.target.value)}
                      style={{ width: '60px', height: '40px', borderRadius: 'var(--border-radius-small)', border: 'none' }}
                    />
                    <input
                      type="text"
                      value={formData.empresa?.colores?.acento || '#28a745'}
                      onChange={(e) => handleNestedInputChange('empresa', 'colores', 'acento', e.target.value)}
                      className="form-control"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'idiomas' && (
            <div>
              <h3 className="section-title">Configuración de Idiomas</h3>
              <div className="form-group">
                <label className="form-label">Idioma predeterminado del sistema:</label>
                <select
                  value={formData.idioma?.predeterminado || 'es'}
                  onChange={async (e) => {
                    const newLanguage = e.target.value;
                    handleInputChange('idioma', 'predeterminado', newLanguage);
                    
                    try {
                      await changeLanguage(newLanguage);
                      setMessage('Idioma cambiado exitosamente.');
                      setTimeout(() => setMessage(''), 3000);
                    } catch (err) {
                      console.error('Error changing language:', err);
                      setMessage('Error al cambiar el idioma');
                      setTimeout(() => setMessage(''), 3000);
                    }
                  }}
                  className="form-control"
                  style={{ maxWidth: '250px' }}
                >
                  <option value="es">🇪🇸 Español</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="ca">🏴󠁥󠁳󠁣󠁴󠁿 Català</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="it">🇮🇹 Italiano</option>
                  <option value="pt">🇵🇹 Português</option>
                </select>
                <small style={{ color: 'var(--text-color)', opacity: 0.7, display: 'block', marginTop: '8px' }}>
                  Nota: Los usuarios pueden cambiar su idioma individualmente desde su configuración personal.
                </small>
              </div>
            </div>
          )}

          {activeTab === 'apariencia' && (
            <div>
              <h3 className="section-title">Configuración de Apariencia</h3>
              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    checked={formData.apariencia?.modo_oscuro || false}
                    onChange={(e) => handleInputChange('apariencia', 'modo_oscuro', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Modo oscuro por defecto
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Tema del sistema:</label>
                <select
                  value={formData.apariencia?.tema || 'default'}
                  onChange={(e) => handleInputChange('apariencia', 'tema', e.target.value)}
                  className="form-control"
                  style={{ maxWidth: '250px' }}
                >
                  <option value="default">Por defecto</option>
                  <option value="corporate">Corporativo</option>
                  <option value="modern">Moderno</option>
                  <option value="matrix">Matrix</option>
                </select>
                <small style={{ color: 'var(--text-color)', opacity: 0.7, marginTop: '8px', display: 'block' }}>
                  {(formData.apariencia?.tema || 'default') === 'default' && 'Tema estándar con colores personalizables'}
                  {(formData.apariencia?.tema || 'default') === 'corporate' && 'Tema profesional con tipografía serif'}
                  {(formData.apariencia?.tema || 'default') === 'modern' && 'Tema moderno con gradientes y bordes redondeados'}
                  {(formData.apariencia?.tema || 'default') === 'matrix' && 'Tema Matrix con efectos verdes y fondo negro'}
                </small>
              </div>
            </div>
          )}

          {activeTab === 'gastos' && (
            <div>
              <h3 className="section-title">Configuración de Gastos</h3>
              
              {/* Categorías de gastos */}
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Categorías de Gastos</h4>
                <div style={{ 
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  background: 'var(--card-background)',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {(formData.gastos?.categorias || []).map((categoria, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        padding: '1rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--border-radius-small)',
                        background: 'var(--secondary-color)'
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>{categoria.icono}</span>
                        <div style={{ flex: 1 }}>
                          <strong>{categoria.nombre}</strong>
                          <small style={{ display: 'block', opacity: 0.7 }}>
                            Límite mensual: {categoria.limite_mensual}€
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    className="button button-secondary"
                    style={{ marginTop: '1rem', fontSize: '0.875rem' }}
                    onClick={() => setMessage('Funcionalidad de edición de categorías disponible próximamente.')}
                  >
                    ⚙️ Gestionar Categorías
                  </button>
                </div>
              </div>

              {/* Configuración general */}
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Configuración General</h4>
                <div style={{ 
                  display: 'grid', 
                  gap: '1.5rem',
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
                    <small style={{ color: 'var(--text-color)', opacity: 0.7, display: 'block', marginTop: '5px' }}>
                      Gastos superiores a este importe requerirán aprobación adicional
                    </small>
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
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notificaciones' && (
            <div>
              <h3 className="section-title">Configuración de Notificaciones</h3>
              
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Configuración de Email</h4>
                <div style={{ 
                  display: 'grid', 
                  gap: '1.5rem',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  background: 'var(--card-background)'
                }}>
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.notificaciones?.email_habilitado || false}
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
                      value={formData.notificaciones?.plantilla_asunto || ''}
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