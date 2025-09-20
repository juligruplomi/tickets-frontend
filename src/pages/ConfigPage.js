import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystemConfig } from '../hooks/useSystemConfig';

function ConfigPage() {
  const { user } = useAuth();
  const { adminConfig, loadAdminConfig, updateConfig, currentLanguage, changeLanguage, t } = useSystemConfig();
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('empresa');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminConfig().then(config => {
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
      setMessage('Configuración guardada exitosamente');
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
            <p>Cargando configuración...</p>
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
          <h2 className="card-title">Configuración del Sistema</h2>
          {message && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda',
              color: message.includes('Error') ? '#721c24' : '#155724',
              borderRadius: '4px'
            }}>
              {message}
            </div>
          )}
        </div>
        
        <div className="card-body">
          {/* Selector de idioma */}
          <div style={{ marginBottom: '20px' }}>
            <label>Idioma de la interfaz:</label>
            <select 
              value={currentLanguage} 
              onChange={(e) => changeLanguage(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="ca">Català</option>
            </select>
          </div>

          {/* Pestañas */}
          <div style={{ borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
            {['empresa', 'idiomas', 'apariencia', 'tickets', 'notificaciones'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: activeTab === tab ? '#007bff' : 'transparent',
                  color: activeTab === tab ? 'white' : '#007bff',
                  cursor: 'pointer',
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
              <div style={{ marginBottom: '15px' }}>
                <label>Nombre de la empresa:</label>
                <input
                  type="text"
                  value={formData.empresa.nombre}
                  onChange={(e) => handleInputChange('empresa', 'nombre', e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>URL del logo:</label>
                <input
                  type="text"
                  value={formData.empresa.logo_url}
                  onChange={(e) => handleInputChange('empresa', 'logo_url', e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <h4>Colores corporativos</h4>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div>
                  <label>Color primario:</label>
                  <input
                    type="color"
                    value={formData.empresa.colores.primario}
                    onChange={(e) => handleNestedInputChange('empresa', 'colores', 'primario', e.target.value)}
                    style={{ display: 'block', marginTop: '5px', width: '50px', height: '30px' }}
                  />
                </div>
                <div>
                  <label>Color secundario:</label>
                  <input
                    type="color"
                    value={formData.empresa.colores.secundario}
                    onChange={(e) => handleNestedInputChange('empresa', 'colores', 'secundario', e.target.value)}
                    style={{ display: 'block', marginTop: '5px', width: '50px', height: '30px' }}
                  />
                </div>
                <div>
                  <label>Color de acento:</label>
                  <input
                    type="color"
                    value={formData.empresa.colores.acento}
                    onChange={(e) => handleNestedInputChange('empresa', 'colores', 'acento', e.target.value)}
                    style={{ display: 'block', marginTop: '5px', width: '50px', height: '30px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'idiomas' && (
            <div>
              <h3>Configuración de Idiomas</h3>
              <div style={{ marginBottom: '15px' }}>
                <label>Idioma predeterminado:</label>
                <select
                  value={formData.idioma.predeterminado}
                  onChange={(e) => handleInputChange('idioma', 'predeterminado', e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="ca">Català</option>
                </select>
              </div>
              
              <h4>Traducciones</h4>
              {Object.keys(formData.idioma.traducciones).map(lang => (
                <div key={lang} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                  <h5>{lang.toUpperCase()}</h5>
                  {Object.keys(formData.idioma.traducciones[lang]).map(key => (
                    <div key={key} style={{ marginBottom: '10px' }}>
                      <label style={{ textTransform: 'capitalize' }}>{key}:</label>
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
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'apariencia' && (
            <div>
              <h3>Configuración de Apariencia</h3>
              <div style={{ marginBottom: '15px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.apariencia.modo_oscuro}
                    onChange={(e) => handleInputChange('apariencia', 'modo_oscuro', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Modo oscuro por defecto
                </label>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Tema:</label>
                <select
                  value={formData.apariencia.tema}
                  onChange={(e) => handleInputChange('apariencia', 'tema', e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
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
                      style={{ flex: 1, padding: '5px', marginRight: '10px' }}
                    />
                    <button
                      onClick={() => removeArrayItem('tickets', 'estados', index)}
                      style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('tickets', 'estados')}
                  style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px' }}
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
                      style={{ flex: 1, padding: '5px', marginRight: '10px' }}
                    />
                    <button
                      onClick={() => removeArrayItem('tickets', 'prioridades', index)}
                      style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('tickets', 'prioridades')}
                  style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px' }}
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
                      style={{ flex: 1, padding: '5px', marginRight: '10px' }}
                    />
                    <button
                      onClick={() => removeArrayItem('tickets', 'categorias', index)}
                      style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('tickets', 'categorias')}
                  style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px' }}
                >
                  Añadir categoría
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notificaciones' && (
            <div>
              <h3>Configuración de Notificaciones</h3>
              <div style={{ marginBottom: '15px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.notificaciones.email_habilitado}
                    onChange={(e) => handleInputChange('notificaciones', 'email_habilitado', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Notificaciones por email habilitadas
                </label>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.notificaciones.notificar_asignacion}
                    onChange={(e) => handleInputChange('notificaciones', 'notificar_asignacion', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Notificar asignación de tickets
                </label>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>
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
          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 30px',
                backgroundColor: saving ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
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