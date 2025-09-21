import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { api } from '../services/api';

function ConfigPage() {
  const { user } = useAuth();
  const { config, t, reloadConfig } = useConfig();
  const [adminConfig, setAdminConfig] = useState(null);
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('empresa');
  const [activeLanguageTab, setActiveLanguageTab] = useState('es');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadAdminConfig = async () => {
    try {
      const response = await api.get('/config/admin');
      console.log('Admin config loaded:', response.data);
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
        setFormData(JSON.parse(JSON.stringify(config))); // Deep copy
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
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
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleArrayChange = (section, field, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[section][field]];
      newArray[index] = value;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
  };

  const addArrayItem = (section, field) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...prev[section][field], '']
      }
    }));
  };

  const removeArrayItem = (section, field, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index)
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
      setMessage('Configuración guardada exitosamente. Los cambios se aplicarán inmediatamente.');
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
        <div className="card">
          <div className="card-body">
            <h2>Acceso Denegado</h2>
            <p>Solo los administradores pueden acceder a la configuración del sistema.</p>
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

  // Nombres simples de idiomas sin códigos de país
  const languageNames = {
    es: 'Español',
    en: 'English',
    ca: 'Català',
    de: 'Deutsch',
    it: 'Italiano',
    pt: 'Português'
  };

  return (
    <div className="container">
      <div className="card dashboard-card">
        <div className="card-header">
          <h2 className="card-title">{t('configuracion')} del Sistema</h2>
          {message && (
            <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
              {message}
            </div>
          )}
        </div>
        
        <div className="card-body">
          {/* Pestañas principales */}
          <div className="config-tabs">
            {['empresa', 'idiomas', 'apariencia', 'tickets', 'notificaciones'].map(tab => (
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
              
              {/* Verificar si existe la configuración de idiomas */}
              {formData.idioma && formData.idioma.idiomas_disponibles ? (
                <div className="form-group">
                  <label className="form-label">Idioma predeterminado del sistema:</label>
                  <select
                    value={formData.idioma.predeterminado || 'es'}
                    onChange={(e) => handleInputChange('idioma', 'predeterminado', e.target.value)}
                    className="form-control"
                  >
                    {formData.idioma.idiomas_disponibles.map(lang => (
                      <option key={lang} value={lang}>{languageNames[lang] || lang}</option>
                    ))}
                  </select>
                  <small style={{ color: 'var(--text-color)', opacity: 0.7, display: 'block', marginTop: '8px' }}>
                    Nota: Los usuarios pueden cambiar su idioma individualmente desde el dashboard.
                  </small>
                </div>
              ) : (
                <div style={{ padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '5px', marginBottom: '20px' }}>
                  <p><strong>⚠️ Configuración de idiomas no encontrada</strong></p>
                  <p>La configuración de idiomas no está disponible. Por favor, contacta al administrador del sistema.</p>
                </div>
              )}
              
              <h4 className="section-title">Traducciones por idioma</h4>
              
              {/* Verificar si existen traducciones */}
              {formData.idioma && formData.idioma.traducciones && Object.keys(formData.idioma.traducciones).length > 0 ? (
                <>
                  {/* Pestañas de idiomas */}
                  <div className="language-tabs">
                    {Object.keys(formData.idioma.traducciones).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setActiveLanguageTab(lang)}
                        className={`language-tab ${activeLanguageTab === lang ? 'active' : ''}`}
                      >
                        {languageNames[lang] || lang}
                      </button>
                    ))}
                  </div>

                  {/* Contenido de traducciones para el idioma seleccionado */}
                  {formData.idioma.traducciones[activeLanguageTab] ? (
                    <div className="card" style={{ marginTop: '15px' }}>
                      <div className="card-body">
                        <h5 className="section-title">{languageNames[activeLanguageTab] || activeLanguageTab} - Traducciones</h5>
                        {Object.keys(formData.idioma.traducciones[activeLanguageTab]).map(key => (
                          <div key={key} className="form-group">
                            <label className="form-label" style={{ textTransform: 'capitalize' }}>
                              {key.replace('_', ' ')}:
                            </label>
                            <input
                              type="text"
                              value={formData.idioma.traducciones[activeLanguageTab][key] || ''}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  idioma: {
                                    ...prev.idioma,
                                    traducciones: {
                                      ...prev.idioma.traducciones,
                                      [activeLanguageTab]: {
                                        ...prev.idioma.traducciones[activeLanguageTab],
                                        [key]: e.target.value
                                      }
                                    }
                                  }
                                }));
                              }}
                              className="form-control"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '5px', marginTop: '15px' }}>
                      <p>No hay traducciones disponibles para el idioma seleccionado: <strong>{activeLanguageTab}</strong></p>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px', border: '1px solid #ddd' }}>
                  <p><strong>📝 Sin traducciones configuradas</strong></p>
                  <p>No se han encontrado traducciones configuradas. El sistema funcionará con los textos por defecto.</p>
                </div>
              )}
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

          {activeTab === 'tickets' && formData.tickets && (
            <div>
              <h3 className="section-title">Configuración de Tickets</h3>
              
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Estados de tickets</h4>
                {formData.tickets.estados && formData.tickets.estados.map((estado, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                    <input
                      type="text"
                      value={estado}
                      onChange={(e) => handleArrayChange('tickets', 'estados', index, e.target.value)}
                      className="form-control"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => removeArrayItem('tickets', 'estados', index)}
                      className="button"
                      style={{ backgroundColor: '#dc3545', color: 'white', padding: '8px 16px' }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('tickets', 'estados')}
                  className="button button-primary"
                  style={{ marginTop: '10px' }}
                >
                  Añadir estado
                </button>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Prioridades</h4>
                {formData.tickets.prioridades && formData.tickets.prioridades.map((prioridad, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                    <input
                      type="text"
                      value={prioridad}
                      onChange={(e) => handleArrayChange('tickets', 'prioridades', index, e.target.value)}
                      className="form-control"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => removeArrayItem('tickets', 'prioridades', index)}
                      className="button"
                      style={{ backgroundColor: '#dc3545', color: 'white', padding: '8px 16px' }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
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
                {formData.tickets.categorias && formData.tickets.categorias.map((categoria, index) => (
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

          {activeTab === 'notificaciones' && formData.notificaciones && (
            <div>
              <h3 className="section-title">Configuración de Notificaciones</h3>
              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    checked={formData.notificaciones.email_habilitado || false}
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
                    checked={formData.notificaciones.notificar_asignacion || false}
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
                    checked={formData.notificaciones.notificar_cambio_estado || false}
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