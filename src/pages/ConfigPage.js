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
                    onChange={async (e) => {
                      const newLanguage = e.target.value;
                      handleInputChange('idioma', 'predeterminado', newLanguage);
                      
                      // Cambiar directamente el idioma del usuario
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
              
              {/* Estados de tickets */}
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Estados de tickets</h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {formData.tickets.estados && formData.tickets.estados.map((estado, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem',
                      padding: '1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius-small)',
                      background: 'var(--card-background)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="color"
                          value={estado.color || '#6c757d'}
                          onChange={(e) => {
                            const newEstados = [...formData.tickets.estados];
                            newEstados[index] = { ...estado, color: e.target.value };
                            setFormData(prev => ({
                              ...prev,
                              tickets: {
                                ...prev.tickets,
                                estados: newEstados
                              }
                            }));
                          }}
                          style={{ width: '40px', height: '40px', borderRadius: '4px', border: 'none' }}
                        />
                        <span 
                          style={{ 
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            color: 'white',
                            backgroundColor: estado.color || '#6c757d',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}
                        >
                          {estado.nombre}
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Nombre del estado"
                        value={estado.nombre || ''}
                        onChange={(e) => {
                          const newEstados = [...formData.tickets.estados];
                          newEstados[index] = { ...estado, nombre: e.target.value };
                          setFormData(prev => ({
                            ...prev,
                            tickets: {
                              ...prev.tickets,
                              estados: newEstados
                            }
                          }));
                        }}
                        className="form-control"
                        style={{ flex: 1 }}
                      />
                      <button
                        onClick={() => {
                          const newEstados = formData.tickets.estados.filter((_, i) => i !== index);
                          setFormData(prev => ({
                            ...prev,
                            tickets: {
                              ...prev.tickets,
                              estados: newEstados
                            }
                          }));
                        }}
                        className="button"
                        style={{ backgroundColor: '#dc3545', color: 'white', padding: '8px 16px' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const newEstado = { id: `estado_${Date.now()}`, nombre: '', color: '#6c757d' };
                    setFormData(prev => ({
                      ...prev,
                      tickets: {
                        ...prev.tickets,
                        estados: [...(prev.tickets.estados || []), newEstado]
                      }
                    }));
                  }}
                  className="button button-primary"
                  style={{ marginTop: '1rem' }}
                >
                  + Añadir estado
                </button>
              </div>

              {/* Categorías */}
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Categorías</h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {formData.tickets.categorias && formData.tickets.categorias.map((categoria, index) => (
                    <div key={index} style={{ 
                      padding: '1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius-small)',
                      background: 'var(--card-background)'
                    }}>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="Nombre de la categoría"
                          value={categoria.nombre || ''}
                          onChange={(e) => {
                            const newCategorias = [...formData.tickets.categorias];
                            newCategorias[index] = { ...categoria, nombre: e.target.value };
                            setFormData(prev => ({
                              ...prev,
                              tickets: {
                                ...prev.tickets,
                                categorias: newCategorias
                              }
                            }));
                          }}
                          className="form-control"
                          style={{ flex: 1 }}
                        />
                        <button
                          onClick={() => {
                            const newCategorias = formData.tickets.categorias.filter((_, i) => i !== index);
                            setFormData(prev => ({
                              ...prev,
                              tickets: {
                                ...prev.tickets,
                                categorias: newCategorias
                              }
                            }));
                          }}
                          className="button"
                          style={{ backgroundColor: '#dc3545', color: 'white', padding: '8px 16px' }}
                        >
                          Eliminar
                        </button>
                      </div>
                      <textarea
                        placeholder="Descripción de la categoría"
                        value={categoria.descripcion || ''}
                        onChange={(e) => {
                          const newCategorias = [...formData.tickets.categorias];
                          newCategorias[index] = { ...categoria, descripcion: e.target.value };
                          setFormData(prev => ({
                            ...prev,
                            tickets: {
                              ...prev.tickets,
                              categorias: newCategorias
                            }
                          }));
                        }}
                        className="form-control"
                        rows="2"
                        style={{ fontSize: '0.875rem' }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const newCategoria = { id: `categoria_${Date.now()}`, nombre: '', descripcion: '' };
                    setFormData(prev => ({
                      ...prev,
                      tickets: {
                        ...prev.tickets,
                        categorias: [...(prev.tickets.categorias || []), newCategoria]
                      }
                    }));
                  }}
                  className="button button-primary"
                  style={{ marginTop: '1rem' }}
                >
                  + Añadir categoría
                </button>
              </div>

              {/* Configuración general */}
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Configuración general</h4>
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
                        checked={formData.tickets.configuracion?.auto_asignar_supervisor || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            tickets: {
                              ...prev.tickets,
                              configuracion: {
                                ...prev.tickets.configuracion,
                                auto_asignar_supervisor: e.target.checked
                              }
                            }
                          }));
                        }}
                      />
                      Auto-asignar al supervisor
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Tiempo límite de resolución (horas):</label>
                    <input
                      type="number"
                      min="1"
                      max="720"
                      value={formData.tickets.configuracion?.tiempo_limite_resolucion || 72}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          tickets: {
                            ...prev.tickets,
                            configuracion: {
                              ...prev.tickets.configuracion,
                              tiempo_limite_resolucion: parseInt(e.target.value)
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
                        checked={formData.tickets.configuracion?.permitir_reabrir || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            tickets: {
                              ...prev.tickets,
                              configuracion: {
                                ...prev.tickets.configuracion,
                                permitir_reabrir: e.target.checked
                              }
                            }
                          }));
                        }}
                      />
                      Permitir reabrir tickets cerrados
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.tickets.configuracion?.requiere_aprobacion_cierre || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            tickets: {
                              ...prev.tickets,
                              configuracion: {
                                ...prev.tickets.configuracion,
                                requiere_aprobacion_cierre: e.target.checked
                              }
                            }
                          }));
                        }}
                      />
                      Requiere aprobación para cerrar tickets
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Tamaño máximo de adjuntos (MB):</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.tickets.configuracion?.tamano_maximo_adjunto || 10}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          tickets: {
                            ...prev.tickets,
                            configuracion: {
                              ...prev.tickets.configuracion,
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
                      placeholder="[{{empresa}}] {{tipo}}: {{titulo}}"
                    />
                    <small style={{ color: 'var(--text-color)', opacity: 0.7, marginTop: '8px', display: 'block' }}>
                      Variables disponibles: {{empresa}}, {{tipo}}, {{titulo}}, {{usuario}}
                    </small>
                  </div>
                  
                  {/* Configuración SMTP */}
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
                    
                    <div className="form-group">
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
              
              {/* Eventos de notificación */}
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Eventos de Notificación</h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {formData.notificaciones.eventos && Object.entries(formData.notificaciones.eventos).map(([eventKey, evento]) => (
                    <div key={eventKey} style={{ 
                      padding: '1.5rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius)',
                      background: 'var(--card-background)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h5 style={{ margin: 0, textTransform: 'capitalize', color: 'var(--text-color)' }}>
                          {eventKey.replace(/_/g, ' ')}
                        </h5>
                        <label className="form-checkbox">
                          <input
                            type="checkbox"
                            checked={evento.habilitado || false}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                notificaciones: {
                                  ...prev.notificaciones,
                                  eventos: {
                                    ...prev.notificaciones.eventos,
                                    [eventKey]: {
                                      ...evento,
                                      habilitado: e.target.checked
                                    }
                                  }
                                }
                              }));
                            }}
                          />
                          Habilitado
                        </label>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Plantilla del mensaje:</label>
                        <textarea
                          value={evento.plantilla || ''}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              notificaciones: {
                                ...prev.notificaciones,
                                eventos: {
                                  ...prev.notificaciones.eventos,
                                  [eventKey]: {
                                    ...evento,
                                    plantilla: e.target.value
                                  }
                                }
                              }
                            }));
                          }}
                          className="form-control"
                          rows="2"
                          placeholder="Mensaje de la notificación..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recordatorios */}
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Recordatorios Automáticos</h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {formData.notificaciones.recordatorios && Object.entries(formData.notificaciones.recordatorios).map(([recordKey, recordatorio]) => (
                    <div key={recordKey} style={{ 
                      padding: '1.5rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius)',
                      background: 'var(--card-background)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h5 style={{ margin: 0, textTransform: 'capitalize', color: 'var(--text-color)' }}>
                          {recordKey.replace(/_/g, ' ')}
                        </h5>
                        <label className="form-checkbox">
                          <input
                            type="checkbox"
                            checked={recordatorio.habilitado || false}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                notificaciones: {
                                  ...prev.notificaciones,
                                  recordatorios: {
                                    ...prev.notificaciones.recordatorios,
                                    [recordKey]: {
                                      ...recordatorio,
                                      habilitado: e.target.checked
                                    }
                                  }
                                }
                              }));
                            }}
                          />
                          Habilitado
                        </label>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Frecuencia:</label>
                          <select
                            value={recordatorio.frecuencia || 'diaria'}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                notificaciones: {
                                  ...prev.notificaciones,
                                  recordatorios: {
                                    ...prev.notificaciones.recordatorios,
                                    [recordKey]: {
                                      ...recordatorio,
                                      frecuencia: e.target.value
                                    }
                                  }
                                }
                              }));
                            }}
                            className="form-control"
                          >
                            <option value="diaria">Diaria</option>
                            <option value="cada_hora">Cada hora</option>
                            <option value="semanal">Semanal</option>
                            <option value="mensual">Mensual</option>
                          </select>
                        </div>
                        
                        {recordatorio.hora && (
                          <div className="form-group">
                            <label className="form-label">Hora:</label>
                            <input
                              type="time"
                              value={recordatorio.hora || ''}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  notificaciones: {
                                    ...prev.notificaciones,
                                    recordatorios: {
                                      ...prev.notificaciones.recordatorios,
                                      [recordKey]: {
                                        ...recordatorio,
                                        hora: e.target.value
                                      }
                                    }
                                  }
                                }));
                              }}
                              className="form-control"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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