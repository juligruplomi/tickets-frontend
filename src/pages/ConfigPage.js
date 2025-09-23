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
            email_admin: '',
            eventos: {
              nuevo_gasto: false,
              gasto_aprobado: false,
              gasto_rechazado: false,
              limite_categoria_alcanzado: false,
              gastos_pendientes: false,
              informe_mensual: false
            },
            recordatorios: {
              habilitados: false,
              frecuencia_pendientes: 'diario',
              hora: '09:00',
              dias_aviso: 3
            },
            smtp: {
              servidor: '',
              puerto: 587,
              usuario: '',
              ssl_habilitado: false
            }
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

              {/* Métodos de pago */}
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Métodos de Pago</h4>
                <div style={{ 
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  background: 'var(--card-background)',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {[
                      { nombre: 'Tarjeta de crédito corporativa', icono: '💳', requiere_justificante: true },
                      { nombre: 'Efectivo', icono: '💰', requiere_justificante: true },
                      { nombre: 'Transferencia bancaria', icono: '🏦', requiere_justificante: false },
                      { nombre: 'PayPal', icono: '📱', requiere_justificante: false }
                    ].map((metodo, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        padding: '0.75rem',
                        background: 'var(--secondary-color)',
                        borderRadius: 'var(--border-radius-small)'
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>{metodo.icono}</span>
                        <span style={{ flex: 1 }}>{metodo.nombre}</span>
                        <span style={{ 
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          background: metodo.requiere_justificante ? '#ffc107' : '#28a745',
                          color: 'white'
                        }}>
                          {metodo.requiere_justificante ? 'Requiere justificante' : 'No requiere justificante'}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    className="button button-secondary"
                    style={{ marginTop: '1rem', fontSize: '0.875rem' }}
                    onClick={() => setMessage('Funcionalidad de edición de métodos de pago disponible próximamente.')}
                  >
                    ⚙️ Gestionar Métodos de Pago
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
                      Auto-aprobar gastos pequeños (menos de 25€)
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.gastos?.configuracion?.permitir_gastos_futuros || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            gastos: {
                              ...prev.gastos,
                              configuracion: {
                                ...prev.gastos?.configuracion,
                                permitir_gastos_futuros: e.target.checked
                              }
                            }
                          }));
                        }}
                      />
                      Permitir registrar gastos con fecha futura
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Días máximos para registrar gastos retroactivos:</label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={formData.gastos?.configuracion?.dias_max_retroactivos || 30}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          gastos: {
                            ...prev.gastos,
                            configuracion: {
                              ...prev.gastos?.configuracion,
                              dias_max_retroactivos: parseInt(e.target.value)
                            }
                          }
                        }));
                      }}
                      className="form-control"
                      style={{ maxWidth: '200px' }}
                    />
                    <small style={{ color: 'var(--text-color)', opacity: 0.7, display: 'block', marginTop: '5px' }}>
                      Los usuarios no podrán registrar gastos de hace más de este número de días
                    </small>
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

              {/* Flujo de aprobación */}
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Flujo de Aprobación</h4>
                <div style={{ 
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  background: 'var(--card-background)'
                }}>
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.gastos?.configuracion?.requiere_aprobacion_supervisor || true}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            gastos: {
                              ...prev.gastos,
                              configuracion: {
                                ...prev.gastos?.configuracion,
                                requiere_aprobacion_supervisor: e.target.checked
                              }
                            }
                          }));
                        }}
                      />
                      Los gastos requieren aprobación del supervisor
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.gastos?.configuracion?.notificar_aprobaciones || true}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            gastos: {
                              ...prev.gastos,
                              configuracion: {
                                ...prev.gastos?.configuracion,
                                notificar_aprobaciones: e.target.checked
                              }
                            }
                          }));
                        }}
                      />
                      Enviar notificaciones automáticas de aprobación/rechazo
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Tiempo límite para aprobar gastos (días):</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.gastos?.configuracion?.dias_limite_aprobacion || 7}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          gastos: {
                            ...prev.gastos,
                            configuracion: {
                              ...prev.gastos?.configuracion,
                              dias_limite_aprobacion: parseInt(e.target.value)
                            }
                          }
                        }));
                      }}
                      className="form-control"
                      style={{ maxWidth: '200px' }}
                    />
                    <small style={{ color: 'var(--text-color)', opacity: 0.7, display: 'block', marginTop: '5px' }}>
                      Después de este tiempo, los gastos se aprobarán automáticamente
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}

                    </div>
                    <small style={{ color: 'var(--text-color)', opacity: 0.6, marginLeft: '1.5rem' }}>
                      Confirma al empleado que su gasto ha sido aprobado
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <label className="form-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.notificaciones?.eventos?.gasto_rechazado || false}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              notificaciones: {
                                ...prev.notificaciones,
                                eventos: {
                                  ...prev.notificaciones?.eventos,
                                  gasto_rechazado: e.target.checked
                                }
                              }
                            }));
                          }}
                        />
                        ❌ Gasto rechazado
                      </label>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-color)', opacity: 0.7 }}>Al usuario</span>
                    </div>
                    <small style={{ color: 'var(--text-color)', opacity: 0.6, marginLeft: '1.5rem' }}>
                      Notifica al empleado el rechazo con motivos
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <label className="form-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.notificaciones?.eventos?.limite_categoria_alcanzado || false}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              notificaciones: {
                                ...prev.notificaciones,
                                eventos: {
                                  ...prev.notificaciones?.eventos,
                                  limite_categoria_alcanzado: e.target.checked
                                }
                              }
                            }));
                          }}
                        />
                        ⚠️ Límite de categoría alcanzado
                      </label>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-color)', opacity: 0.7 }}>Al supervisor</span>
                    </div>
                    <small style={{ color: 'var(--text-color)', opacity: 0.6, marginLeft: '1.5rem' }}>
                      Alerta cuando se supera el límite mensual de una categoría
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <label className="form-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.notificaciones?.eventos?.gastos_pendientes || false}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              notificaciones: {
                                ...prev.notificaciones,
                                eventos: {
                                  ...prev.notificaciones?.eventos,
                                  gastos_pendientes: e.target.checked
                                }
                              }
                            }));
                          }}
                        />
                        🔔 Recordatorio gastos pendientes
                      </label>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-color)', opacity: 0.7 }}>Al supervisor</span>
                    </div>
                    <small style={{ color: 'var(--text-color)', opacity: 0.6, marginLeft: '1.5rem' }}>
                      Recordatorio diario de gastos pendientes de aprobación
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <label className="form-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.notificaciones?.eventos?.informe_mensual || false}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              notificaciones: {
                                ...prev.notificaciones,
                                eventos: {
                                  ...prev.notificaciones?.eventos,
                                  informe_mensual: e.target.checked
                                }
                              }
                            }));
                          }}
                        />
                        📄 Informe mensual de gastos
                      </label>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-color)', opacity: 0.7 }}>Al administrador</span>
                    </div>
                    <small style={{ color: 'var(--text-color)', opacity: 0.6, marginLeft: '1.5rem' }}>
                      Resumen mensual de todos los gastos y estadísticas
                    </small>
                  </div>
                </div>
              </div>
              
              {/* Recordatorios automáticos */}
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Recordatorios Automáticos</h4>
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
                        checked={formData.notificaciones?.recordatorios?.habilitados || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            notificaciones: {
                              ...prev.notificaciones,
                              recordatorios: {
                                ...prev.notificaciones?.recordatorios,
                                habilitados: e.target.checked
                              }
                            }
                          }));
                        }}
                      />
                      Habilitar recordatorios automáticos
                    </label>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Recordar gastos pendientes de aprobación cada:</label>
                    <select
                      value={formData.notificaciones?.recordatorios?.frecuencia_pendientes || 'diario'}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          notificaciones: {
                            ...prev.notificaciones,
                            recordatorios: {
                              ...prev.notificaciones?.recordatorios,
                              frecuencia_pendientes: e.target.value
                            }
                          }
                        }));
                      }}
                      className="form-control"
                      style={{ maxWidth: '200px' }}
                      disabled={!formData.notificaciones?.recordatorios?.habilitados}
                    >
                      <option value="nunca">Nunca</option>
                      <option value="diario">Diariamente</option>
                      <option value="cada_2_dias">Cada 2 días</option>
                      <option value="semanal">Semanalmente</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Hora para enviar recordatorios:</label>
                    <input
                      type="time"
                      value={formData.notificaciones?.recordatorios?.hora || '09:00'}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          notificaciones: {
                            ...prev.notificaciones,
                            recordatorios: {
                              ...prev.notificaciones?.recordatorios,
                              hora: e.target.value
                            }
                          }
                        }));
                      }}
                      className="form-control"
                      style={{ maxWidth: '150px' }}
                      disabled={!formData.notificaciones?.recordatorios?.habilitados}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Días de aviso antes de vencimiento:</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.notificaciones?.recordatorios?.dias_aviso || 3}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          notificaciones: {
                            ...prev.notificaciones,
                            recordatorios: {
                              ...prev.notificaciones?.recordatorios,
                              dias_aviso: parseInt(e.target.value)
                            }
                          }
                        }));
                      }}
                      className="form-control"
                      style={{ maxWidth: '150px' }}
                      disabled={!formData.notificaciones?.recordatorios?.habilitados}
                    />
                    <small style={{ color: 'var(--text-color)', opacity: 0.7, display: 'block', marginTop: '5px' }}>
                      Aviso previo antes de que los gastos se aprueben automáticamente
                    </small>
                  </div>
                </div>
              </div>
              
              {/* Configuración SMTP */}
              <div style={{ marginBottom: '30px' }}>
                <h4 className="section-title">Configuración del Servidor SMTP</h4>
                <div style={{ 
                  display: 'grid', 
                  gap: '1.5rem',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  background: 'var(--card-background)'
                }}>
                  <div style={{ 
                    padding: '1rem',
                    background: 'rgba(255, 193, 7, 0.1)',
                    border: '1px solid rgba(255, 193, 7, 0.3)',
                    borderRadius: 'var(--border-radius-small)'
                  }}>
                    <h5 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>⚠️ Configuración Avanzada</h5>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#856404' }}>
                      La configuración del servidor SMTP requiere conocimientos técnicos. 
                      Contacta con tu administrador de sistemas para configurar estos parámetros.
                    </p>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Servidor SMTP:</label>
                      <input
                        type="text"
                        value={formData.notificaciones?.smtp?.servidor || ''}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            notificaciones: {
                              ...prev.notificaciones,
                              smtp: {
                                ...prev.notificaciones?.smtp,
                                servidor: e.target.value
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
                        value={formData.notificaciones?.smtp?.puerto || ''}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            notificaciones: {
                              ...prev.notificaciones,
                              smtp: {
                                ...prev.notificaciones?.smtp,
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
                        value={formData.notificaciones?.smtp?.usuario || ''}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            notificaciones: {
                              ...prev.notificaciones,
                              smtp: {
                                ...prev.notificaciones?.smtp,
                                usuario: e.target.value
                              }
                            }
                          }));
                        }}
                        className="form-control"
                        placeholder="notificaciones@gruplomi.com"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.notificaciones?.smtp?.ssl_habilitado || false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            notificaciones: {
                              ...prev.notificaciones,
                              smtp: {
                                ...prev.notificaciones?.smtp,
                                ssl_habilitado: e.target.checked
                              }
                            }
                          }));
                        }}
                      />
                      Usar conexión segura SSL/TLS
                    </label>
                  </div>
                  
                  <button
                    className="button button-secondary"
                    style={{ fontSize: '0.875rem' }}
                    onClick={() => setMessage('Funcionalidad de prueba de email disponible próximamente.')}
                  >
                    📧 Probar Configuración de Email
                  </button>
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