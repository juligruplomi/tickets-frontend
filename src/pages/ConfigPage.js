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
      // Recargar la configuración global para aplicar los cambios
      reloadConfig();
      return { success: true };
    } catch (err) {
      console.error('Error updating config:', err);
      return { success: false, error: err.response?.data?.error || 'Error al actualizar configuración' };
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
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

  if (user?.role !== 'admin') {
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

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{t('configuracion')} del Sistema</h2>
          {message && (
            <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
              {message}
            </div>
          )}
        </div>
        
        <div className="card-body">
          {/* Pestañas */}
          <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
            {['empresa', 'idiomas', 'apariencia', 'tickets', 'notificaciones'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="button"
                style={{
                  backgroundColor: activeTab === tab ? 'var(--primary-color)' : 'transparent',
                  color: activeTab === tab ? 'white' : 'var(--primary-color)',
                  marginRight: '5px',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Contenido de pestañas */}
          {activeTab === 'empresa' && (
            <div>
              <h3>Información de la Empresa</h3>
              <div className="form-group">
                <label className="form-label">Nombre de la empresa:</label>
                <input
                  type="text"
                  value={formData.empresa.nombre}
                  onChange={(e) => handleInputChange('empresa', 'nombre', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">URL del logo:</label>
                <input
                  type="text"
                  value={formData.empresa.logo_url}
                  onChange={(e) => handleInputChange('empresa', 'logo_url', e.target.value)}
                  className="form-control"
                />
              </div>
              <h4>Colores corporativos</h4>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div className="form-group">
                  <label className="form-label">Color primario:</label>
                  <input
                    type="color"
                    value={formData.empresa.colores.primario}
                    onChange={(e) => handleNestedInputChange('empresa', 'colores', 'primario', e.target.value)}
                    style={{ width: '60px', height: '40px' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Color secundario:</label>
                  <input
                    type="color"
                    value={formData.empresa.colores.secundario}
                    onChange={(e) => handleNestedInputChange('empresa', 'colores', 'secundario', e.target.value)}
                    style={{ width: '60px', height: '40px' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Color de acento:</label>
                  <input
                    type="color"
                    value={formData.empresa.colores.acento}
                    onChange={(e) => handleNestedInputChange('empresa', 'colores', 'acento', e.target.value)}
                    style={{ width: '60px', height: '40px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'idiomas' && (
            <div>
              <h3>Configuración de Idiomas</h3>
              <div className="form-group">
                <label className="form-label">Idioma predeterminado:</label>
                <select
                  value={formData.idioma.predeterminado}
                  onChange={(e) => handleInputChange('idioma', 'predeterminado', e.target.value)}
                  className="form-control"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="ca">Català</option>
                </select>
              </div>
              
              <h4>Traducciones</h4>
              {Object.keys(formData.idioma.traducciones).map(lang => (
                <div key={lang} className="card" style={{ marginBottom: '15px' }}>
                  <div className="card-body">
                    <h5>{lang.toUpperCase()}</h5>
                    {Object.keys(formData.idioma.traducciones[lang]).map(key => (
                      <div key={key} className="form-group">
                        <label className="form-label" style={{ textTransform: 'capitalize' }}>{key}:</label>
                        <input
                          type="text"
                          value={formData.idioma.traducciones[lang][key]}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              idioma: {
                                ...prev.idioma,
                                traducciones: {
                                  ...prev.idioma.traducciones,
                                  [lang]: {
                                    ...prev.idioma.traducciones[lang],
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
              ))}
            </div>
          )}

          {activeTab === 'apariencia' && (
            <div>
              <h3>Configuración de Apariencia</h3>
              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    checked={formData.apariencia.modo_oscuro}
                    onChange={(e) => handleInputChange('apariencia', 'modo_oscuro', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Modo oscuro por defecto
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Tema:</label>
                <select
                  value={formData.apariencia.tema}
                  onChange={(e) => handleInputChange('apariencia', 'tema', e.target.value)}
                  className="form-control"
                >
                  <option value="default">Por defecto</option>
                  <option value="corporate">Corporativo</option>
                  <option value="modern">Moderno</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div>
              <h3>Configuración de Tickets</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <h4>Estados de tickets</h4>
                {formData.tickets.estados.map((estado, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <input
                      type="text"
                      value={estado}
                      onChange={(e) => handleArrayChange('tickets', 'estados', index, e.target.value)}
                      className="form-control"
                      style={{ marginRight: '10px' }}
                    />
                    <button
                      onClick={() => removeArrayItem('tickets', 'estados', index)}
                      className="button"
                      style={{ backgroundColor: '#dc3545', color: 'white' }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('tickets', 'estados')}
                  className="button button-primary"
                >
                  Añadir estado
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4>Prioridades</h4>
                {formData.tickets.prioridades.map((prioridad, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <input
                      type="text"
                      value={prioridad}
                      onChange={(e) => handleArrayChange('tickets', 'prioridades', index, e.target.value)}
                      className="form-control"
                      style={{ marginRight: '10px' }}
                    />
                    <button
                      onClick={() => removeArrayItem('tickets', 'prioridades', index)}
                      className="button"
                      style={{ backgroundColor: '#dc3545', color: 'white' }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('tickets', 'prioridades')}
                  className="button button-primary"
                >
                  Añadir prioridad
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4>Categorías</h4>
                {formData.tickets.categorias.map((categoria, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <input
                      type="text"
                      value={categoria}
                      onChange={(e) => handleArrayChange('tickets', 'categorias', index, e.target.value)}
                      className="form-control"
                      style={{ marginRight: '10px' }}
                    />
                    <button
                      onClick={() => removeArrayItem('tickets', 'categorias', index)}
                      className="button"
                      style={{ backgroundColor: '#dc3545', color: 'white' }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('tickets', 'categorias')}
                  className="button button-primary"
                >
                  Añadir categoría
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notificaciones' && (
            <div>
              <h3>Configuración de Notificaciones</h3>
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
          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="button button-primary"
              style={{
                backgroundColor: saving ? '#6c757d' : 'var(--primary-color)',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '16px'
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