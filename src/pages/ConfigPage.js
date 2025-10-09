import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './ConfigPage.css';

function ConfigPage() {
  const [activeTab, setActiveTab] = useState('empresa');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeLanguageTab, setActiveLanguageTab] = useState('es');
  
  const [formData, setFormData] = useState({
    empresa: {
      nombre: 'GrupLomi',
      logo_url: '/logo.png',
      logo_file: null,
      colores: {
        primario: '#0066CC',
        secundario: '#f8f9fa',
        acento: '#28a745'
      }
    },
    gastos: {
      categorias: [
        { nombre: 'Dietas', color: '#28a745', icono: '🍽️', limite_diario: 50, activa: true },
        { nombre: 'Combustible', color: '#dc3545', icono: '⛽', limite_diario: 100, activa: true },
        { nombre: 'Aparcamiento', color: '#ffc107', icono: '🅿️', limite_diario: 20, activa: true },
        { nombre: 'Alojamiento', color: '#6f42c1', icono: '🏨', limite_diario: 150, activa: true },
        { nombre: 'Transporte', color: '#17a2b8', icono: '🚗', limite_diario: 80, activa: true },
        { nombre: 'Material de oficina', color: '#fd7e14', icono: '📝', limite_diario: 25, activa: true },
        { nombre: 'Formación', color: '#20c997', icono: '📚', limite_diario: 200, activa: true },
        { nombre: 'Otros', color: '#6c757d', icono: '📋', limite_diario: 30, activa: true }
      ],
      metodos_pago: [
        { nombre: 'Efectivo', activo: true },
        { nombre: 'Tarjeta de crédito', activo: true },
        { nombre: 'Transferencia', activo: true },
        { nombre: 'Cheque', activo: false }
      ],
      configuracion: {
        moneda_defecto: 'EUR',
        limite_maximo_gasto: 1000,
        requiere_justificante_siempre: true,
        requiere_aprobacion_supervisor: true,
        dias_limite_presentacion: 30,
        permite_gastos_futuros: false,
        requiere_proyecto: false
      },
      limites_aprobacion: {
        operario: 0,
        supervisor: 500.00,
        administrador: 9999999,
        contabilidad: 9999999
      }
    },
    notificaciones: {
      email: {
        habilitado: true,
        admin_email: 'admin@gruplomi.com',
        plantilla_asunto: '[GrupLomi] {tipo_evento} - {referencia}'
      },
      eventos: {
        nuevo_gasto: { habilitado: true, descripcion: 'Nuevo gasto registrado' },
        gasto_aprobado: { habilitado: true, descripcion: 'Gasto aprobado' },
        gasto_rechazado: { habilitado: true, descripcion: 'Gasto rechazado' },
        limite_alcanzado: { habilitado: true, descripcion: 'Límite de categoría alcanzado' },
        recordatorio_pendientes: { habilitado: true, descripcion: 'Recordatorio de gastos pendientes' },
        informe_mensual: { habilitado: false, descripcion: 'Informe mensual de gastos' }
      },
      recordatorios: {
        habilitado: true,
        frecuencia: 'semanal',
        hora_envio: '09:00',
        dias_aviso: 5
      },
      smtp: {
        servidor: 'smtp.gmail.com',
        puerto: 587,
        usuario: '',
        contraseña: '',
        ssl: false,
        tls: true
      }
    },
    idioma: {
      predeterminado: 'es',
      idiomas_disponibles: ['es', 'en', 'ca'],
      traducciones: {
        es: {
          gastos: 'Gastos',
          nuevo_gasto: 'Nuevo Gasto',
          dashboard: 'Panel de Control',
          usuarios: 'Usuarios',
          configuracion: 'Configuración',
          reportes: 'Reportes',
          guardar: 'Guardar',
          cancelar: 'Cancelar'
        },
        en: {
          gastos: 'Expenses',
          nuevo_gasto: 'New Expense',
          dashboard: 'Dashboard',
          usuarios: 'Users',
          configuracion: 'Settings',
          reportes: 'Reports',
          guardar: 'Save',
          cancelar: 'Cancel'
        },
        ca: {
          gastos: 'Despeses',
          nuevo_gasto: 'Nova Despesa',
          dashboard: 'Tauler',
          usuarios: 'Usuaris',
          configuracion: 'Configuració',
          reportes: 'Informes',
          guardar: 'Desar',
          cancelar: 'Cancel·lar'
        }
      }
    }
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/config/sistema');
      
      if (response.data) {
        setFormData(prev => ({
          ...prev,
          empresa: {
            ...prev.empresa,
            nombre: response.data.empresa_nombre || prev.empresa.nombre
          },
          gastos: {
            ...prev.gastos,
            categorias: response.data.categorias_gastos?.map((cat, index) => ({
              nombre: cat,
              color: prev.gastos.categorias[index]?.color || '#6c757d',
              icono: prev.gastos.categorias[index]?.icono || '📋',
              limite_diario: prev.gastos.categorias[index]?.limite_diario || 50,
              activa: true
            })) || prev.gastos.categorias,
            configuracion: {
              ...prev.gastos.configuracion,
              limite_maximo_gasto: response.data.limite_aprobacion_supervisor || 1000,
              requiere_justificante_siempre: response.data.requiere_justificante || true
            }
          },
          notificaciones: {
            ...prev.notificaciones,
            email: {
              ...prev.notificaciones.email,
              habilitado: response.data.notificaciones?.email_enabled || false
            }
          }
        }));
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await api.put('/config/gastos', {
        categorias: formData.gastos.categorias.map(c => c.nombre),
        limite_aprobacion_supervisor: formData.gastos.configuracion.limite_maximo_gasto,
        requiere_justificante: formData.gastos.configuracion.requiere_justificante_siempre,
        campos_obligatorios: ['tipo_gasto', 'descripcion', 'importe', 'fecha_gasto']
      });

      await api.put('/config/notificaciones', {
        email_enabled: formData.notificaciones.email.habilitado,
        notificar_nuevo_gasto: formData.notificaciones.eventos.nuevo_gasto.habilitado,
        notificar_aprobacion: formData.notificaciones.eventos.gasto_aprobado.habilitado,
        notificar_rechazo: formData.notificaciones.eventos.gasto_rechazado.habilitado
      });

      if (formData.notificaciones.smtp.usuario) {
        await api.put('/config/smtp', {
          smtp_host: formData.notificaciones.smtp.servidor,
          smtp_port: formData.notificaciones.smtp.puerto,
          smtp_user: formData.notificaciones.smtp.usuario,
          smtp_password: formData.notificaciones.smtp.contraseña,
          smtp_from: formData.notificaciones.email.admin_email
        });
      }

      setMessage('✅ Configuración guardada correctamente');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage('❌ Error al guardar: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          empresa: {
            ...prev.empresa,
            logo_url: e.target.result,
            logo_file: file
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      gastos: {
        ...prev.gastos,
        categorias: [...prev.gastos.categorias, {
          nombre: 'Nueva Categoría',
          color: '#6c757d',
          icono: '📋',
          limite_diario: 0,
          activa: true
        }]
      }
    }));
  };

  const updateCategory = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      gastos: {
        ...prev.gastos,
        categorias: prev.gastos.categorias.map((cat, i) => 
          i === index ? { ...cat, [field]: value } : cat
        )
      }
    }));
  };

  const removeCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      gastos: {
        ...prev.gastos,
        categorias: prev.gastos.categorias.filter((_, i) => i !== index)
      }
    }));
  };

  const updateTranslation = (language, key, value) => {
    setFormData(prev => ({
      ...prev,
      idioma: {
        ...prev.idioma,
        traducciones: {
          ...prev.idioma.traducciones,
          [language]: {
            ...prev.idioma.traducciones[language],
            [key]: value
          }
        }
      }
    }));
  };

  const configurarGmailDefecto = () => {
    setFormData(prev => ({
      ...prev,
      notificaciones: {
        ...prev.notificaciones,
        smtp: {
          ...prev.notificaciones.smtp,
          servidor: 'smtp.gmail.com',
          puerto: 587,
          ssl: false,
          tls: true
        }
      }
    }));
    setMessage('📧 Configuración de Gmail aplicada');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="config-page">
      <div className="config-header">
        <h1>⚙️ Configuración del Sistema</h1>
        <p>Personaliza todos los aspectos de tu sistema de gastos</p>
      </div>

      <div className="config-tabs">
        <button 
          className={activeTab === 'empresa' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('empresa')}
        >
          🏢 Empresa
        </button>
        <button 
          className={activeTab === 'gastos' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('gastos')}
        >
          💰 Gastos
        </button>
        <button 
          className={activeTab === 'notificaciones' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('notificaciones')}
        >
          🔔 Notificaciones
        </button>
        <button 
          className={activeTab === 'idiomas' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('idiomas')}
        >
          🌐 Idiomas
        </button>
      </div>

      <div className="config-content">
        {activeTab === 'empresa' && (
          <div>
            <h3 className="section-title">🏢 Configuración de Empresa</h3>
            <div className="config-section">
              <h4 className="section-subtitle">Información Básica</h4>
              <div className="form-group">
                <label className="form-label">Nombre de la empresa:</label>
                <input
                  type="text"
                  value={formData.empresa?.nombre || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    empresa: { ...prev.empresa, nombre: e.target.value }
                  }))}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Logo de la empresa:</label>
                <div className="logo-upload-section">
                  {formData.empresa?.logo_url && (
                    <img src={formData.empresa.logo_url} alt="Logo" style={{ maxWidth: '200px', maxHeight: '100px' }} />
                  )}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="form-control" />
                </div>
              </div>
            </div>
            <div className="config-section">
              <h4 className="section-subtitle">Colores Corporativos</h4>
              <div className="colors-grid">
                {['primario', 'secundario', 'acento'].map(colorType => (
                  <div key={colorType} className="form-group">
                    <label className="form-label">Color {colorType}:</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="color"
                        value={formData.empresa?.colores?.[colorType] || '#0066CC'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          empresa: {
                            ...prev.empresa,
                            colores: { ...prev.empresa?.colores, [colorType]: e.target.value }
                          }
                        }))}
                        className="color-picker"
                      />
                      <input
                        type="text"
                        value={formData.empresa?.colores?.[colorType] || '#0066CC'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          empresa: {
                            ...prev.empresa,
                            colores: { ...prev.empresa?.colores, [colorType]: e.target.value }
                          }
                        }))}
                        className="form-control"
                        style={{ width: '100px' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gastos' && (
          <div>
            <h3 className="section-title">💰 Configuración de Gastos</h3>
            <div className="config-section">
              <h4 className="section-subtitle">Categorías de Gastos</h4>
              <div className="categories-grid">
                {formData.gastos?.categorias?.map((cat, idx) => (
                  <div key={idx} className="category-card">
                    <div className="category-header">
                      <span className="category-icon">{cat.icono}</span>
                      <input
                        type="text"
                        value={cat.nombre}
                        onChange={(e) => updateCategory(idx, 'nombre', e.target.value)}
                        className="form-control category-name"
                      />
                      <button onClick={() => removeCategory(idx)} className="btn-remove">❌</button>
                    </div>
                    <div className="category-fields">
                      <div className="form-group">
                        <label>Icono:</label>
                        <input
                          type="text"
                          value={cat.icono}
                          onChange={(e) => updateCategory(idx, 'icono', e.target.value)}
                          className="form-control"
                          style={{ width: '60px' }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Color:</label>
                        <input
                          type="color"
                          value={cat.color}
                          onChange={(e) => updateCategory(idx, 'color', e.target.value)}
                          className="color-picker"
                        />
                      </div>
                      <div className="form-group">
                        <label>Límite diario (€):</label>
                        <input
                          type="number"
                          value={cat.limite_diario}
                          onChange={(e) => updateCategory(idx, 'limite_diario', parseFloat(e.target.value))}
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-checkbox">
                          <input
                            type="checkbox"
                            checked={cat.activa}
                            onChange={(e) => updateCategory(idx, 'activa', e.target.checked)}
                          />
                          Activa
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="add-category-card" onClick={addCategory}>
                  <div className="add-category-content">
                    <span style={{ fontSize: '2rem' }}>➕</span>
                    <p>Añadir Categoría</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="config-section">
              <h4 className="section-subtitle">Configuración General</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Moneda:</label>
                  <select
                    value={formData.gastos?.configuracion?.moneda_defecto}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      gastos: {
                        ...prev.gastos,
                        configuracion: { ...prev.gastos?.configuracion, moneda_defecto: e.target.value }
                      }
                    }))}
                    className="form-control"
                  >
                    <option value="EUR">€ Euro</option>
                    <option value="USD">$ Dólar</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Límite máximo (€):</label>
                  <input
                    type="number"
                    value={formData.gastos?.configuracion?.limite_maximo_gasto}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      gastos: {
                        ...prev.gastos,
                        configuracion: { ...prev.gastos?.configuracion, limite_maximo_gasto: parseFloat(e.target.value) }
                      }
                    }))}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="checkbox-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.gastos?.configuracion?.requiere_justificante_siempre}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      gastos: {
                        ...prev.gastos,
                        configuracion: { ...prev.gastos?.configuracion, requiere_justificante_siempre: e.target.checked }
                      }
                    }))}
                  />
                  Requiere justificante siempre
                </label>
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.gastos?.configuracion?.requiere_aprobacion_supervisor}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      gastos: {
                        ...prev.gastos,
                        configuracion: { ...prev.gastos?.configuracion, requiere_aprobacion_supervisor: e.target.checked }
                      }
                    }))}
                  />
                  Requiere aprobación del supervisor
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notificaciones' && (
          <div>
            <h3 className="section-title">🔔 Configuración de Notificaciones</h3>
            <div className="config-section">
              <h4 className="section-subtitle">Email</h4>
              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.notificaciones?.email?.habilitado}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notificaciones: {
                        ...prev.notificaciones,
                        email: { ...prev.notificaciones?.email, habilitado: e.target.checked }
                      }
                    }))}
                  />
                  Habilitar notificaciones por email
                </label>
              </div>
              <div className="form-group">
                <label>Email del administrador:</label>
                <input
                  type="email"
                  value={formData.notificaciones?.email?.admin_email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notificaciones: {
                      ...prev.notificaciones,
                      email: { ...prev.notificaciones?.email, admin_email: e.target.value }
                    }
                  }))}
                  className="form-control"
                />
              </div>
            </div>
            <div className="config-section">
              <h4 className="section-subtitle">Eventos</h4>
              <div className="events-grid">
                {Object.entries(formData.notificaciones?.eventos || {}).map(([key, evento]) => (
                  <div key={key} className="event-card">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={evento.habilitado}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          notificaciones: {
                            ...prev.notificaciones,
                            eventos: {
                              ...prev.notificaciones?.eventos,
                              [key]: { ...evento, habilitado: e.target.checked }
                            }
                          }
                        }))}
                      />
                      {evento.descripcion}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="config-section">
              <h4 className="section-subtitle">⚙️ SMTP</h4>
              <button onClick={configurarGmailDefecto} className="btn btn-secondary">
                📧 Gmail por defecto
              </button>
              <div className="form-grid" style={{ marginTop: '20px' }}>
                <div className="form-group">
                  <label>Servidor:</label>
                  <input
                    type="text"
                    value={formData.notificaciones?.smtp?.servidor}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notificaciones: {
                        ...prev.notificaciones,
                        smtp: { ...prev.notificaciones?.smtp, servidor: e.target.value }
                      }
                    }))}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Puerto:</label>
                  <input
                    type="number"
                    value={formData.notificaciones?.smtp?.puerto}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notificaciones: {
                        ...prev.notificaciones,
                        smtp: { ...prev.notificaciones?.smtp, puerto: parseInt(e.target.value) }
                      }
                    }))}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Usuario:</label>
                  <input
                    type="email"
                    value={formData.notificaciones?.smtp?.usuario}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notificaciones: {
                        ...prev.notificaciones,
                        smtp: { ...prev.notificaciones?.smtp, usuario: e.target.value }
                      }
                    }))}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Contraseña:</label>
                  <input
                    type="password"
                    value={formData.notificaciones?.smtp?.contraseña}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notificaciones: {
                        ...prev.notificaciones,
                        smtp: { ...prev.notificaciones?.smtp, contraseña: e.target.value }
                      }
                    }))}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'idiomas' && (
          <div>
            <h3 className="section-title">🌐 Configuración de Idiomas</h3>
            <div className="config-section">
              <h4 className="section-subtitle">General</h4>
              <div className="form-group">
                <label>Idioma por defecto:</label>
                <select
                  value={formData.idioma?.predeterminado}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    idioma: { ...prev.idioma, predeterminado: e.target.value }
                  }))}
                  className="form-control"
                >
                  <option value="es">🇪🇸 Español</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="ca">🏴󠁥󠁳󠁣󠁴󠁿 Català</option>
                </select>
              </div>
            </div>
            <div className="config-section">
              <h4 className="section-subtitle">Traducciones</h4>
              <div className="language-tabs">
                {formData.idioma?.idiomas_disponibles?.map(lang => (
                  <button
                    key={lang}
                    className={activeLanguageTab === lang ? 'language-tab active' : 'language-tab'}
                    onClick={() => setActiveLanguageTab(lang)}
                  >
                    {lang === 'es' && '🇪🇸 Español'}
                    {lang === 'en' && '🇬🇧 English'}
                    {lang === 'ca' && '🏴󠁥󠁳󠁣󠁴󠁿 Català'}
                  </button>
                ))}
              </div>
              <div className="translations-content">
                <div className="translations-grid">
                  {formData.idioma?.traducciones?.[activeLanguageTab] && 
                    Object.entries(formData.idioma.traducciones[activeLanguageTab]).map(([key, value]) => (
                    <div key={key} className="translation-item">
                      <label>{key}:</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateTranslation(activeLanguageTab, key, e.target.value)}
                        className="form-control"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <div className="config-actions">
          <button onClick={handleSave} disabled={loading} className="btn btn-primary save-btn">
            {loading ? '⏳ Guardando...' : '💾 Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfigPage;
