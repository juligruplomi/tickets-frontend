import React, { useState, useEffect } from 'react';
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
      flujo_aprobacion: [
        { paso: 1, rol: 'supervisor', descripcion: 'Aprobación del supervisor directo' },
        { paso: 2, rol: 'administrador', descripcion: 'Aprobación administrativa (>500€)' },
        { paso: 3, rol: 'contabilidad', descripcion: 'Revisión contable final' }
      ],
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
    usuarios: {
      roles: [
        { 
          nombre: 'operario', 
          permisos: ['crear_gastos', 'ver_propios_gastos'], 
          activo: true,
          descripcion: 'Usuario básico que puede crear y ver sus propios gastos'
        },
        { 
          nombre: 'supervisor', 
          permisos: ['crear_gastos', 'ver_propios_gastos', 'aprobar_gastos_equipo', 'ver_gastos_equipo'], 
          activo: true,
          descripcion: 'Puede aprobar gastos de su equipo hasta límite establecido'
        },
        { 
          nombre: 'administrador', 
          permisos: ['todas'], 
          activo: true,
          descripcion: 'Acceso completo al sistema'
        },
        { 
          nombre: 'contabilidad', 
          permisos: ['ver_todos_gastos', 'generar_informes', 'exportar_datos', 'revisar_contabilidad'], 
          activo: true,
          descripcion: 'Puede revisar y procesar todos los gastos para contabilidad'
        }
      ],
      configuracion: {
        registro_libre: false,
        requiere_aprobacion_admin: true,
        sesion_timeout: 120,
        intentos_login: 3
      }
    },
    idioma: {
      predeterminado: 'es',
      idiomas_disponibles: ['es', 'en', 'ca', 'de', 'it', 'pt'],
      traducciones: {
        es: {
          // Navegación y estructura
          gastos: 'Gastos',
          nuevo_gasto: 'Nuevo Gasto',
          mis_gastos: 'Mis Gastos',
          dashboard: 'Panel de Control',
          usuarios: 'Usuarios',
          configuracion: 'Configuración',
          reportes: 'Reportes',
          cerrar_sesion: 'Cerrar Sesión',
          
          // Estados y acciones
          pendientes_aprobacion: 'Pendientes de Aprobación',
          total_mensual: 'Total Mensual',
          por_aprobar: 'Por Aprobar',
          aprobados_mes: 'Aprobados este mes',
          pendiente: 'Pendiente',
          aprobado: 'Aprobado',
          rechazado: 'Rechazado',
          pagado: 'Pagado',
          
          // Categorías de gastos
          dietas: 'Dietas',
          aparcamiento: 'Aparcamiento',
          gasolina: 'Combustible',
          alojamiento: 'Alojamiento',
          transporte: 'Transporte',
          material_oficina: 'Material de oficina',
          formacion: 'Formación',
          otros: 'Otros gastos',
          
          // Formularios y campos
          fecha: 'Fecha',
          importe: 'Importe',
          descripcion: 'Descripción',
          categoria: 'Categoría',
          justificante: 'Justificante',
          guardar: 'Guardar',
          cancelar: 'Cancelar',
          editar: 'Editar',
          eliminar: 'Eliminar',
          
          // Mensajes del sistema
          guardado_exitoso: 'Configuración guardada correctamente',
          error_guardar: 'Error al guardar la configuración',
          campos_requeridos: 'Por favor complete todos los campos requeridos',
          
          // Configuración
          configuracion_empresa: 'Configuración de Empresa',
          configuracion_gastos: 'Configuración de Gastos',
          configuracion_notificaciones: 'Configuración de Notificaciones',
          configuracion_usuarios: 'Configuración de Usuarios',
          configuracion_idiomas: 'Configuración de Idiomas',
          
          // Empresa
          nombre_empresa: 'Nombre de la empresa',
          logo_empresa: 'Logo de la empresa',
          colores_tema: 'Colores del tema',
          
          // Roles y permisos
          roles_permisos: 'Roles y Permisos',
          crear_gastos: 'Crear gastos',
          ver_propios_gastos: 'Ver propios gastos',
          aprobar_gastos_equipo: 'Aprobar gastos del equipo',
          ver_gastos_equipo: 'Ver gastos del equipo',
          ver_todos_gastos: 'Ver todos los gastos',
          generar_informes: 'Generar informes',
          exportar_datos: 'Exportar datos',
          revisar_contabilidad: 'Revisar contabilidad',
          todas: 'Todos los permisos'
        },
        en: {
          // Navegación y estructura
          gastos: 'Expenses',
          nuevo_gasto: 'New Expense',
          mis_gastos: 'My Expenses',
          dashboard: 'Dashboard',
          usuarios: 'Users',
          configuracion: 'Settings',
          reportes: 'Reports',
          cerrar_sesion: 'Logout',
          
          // Estados y acciones
          pendientes_aprobacion: 'Pending Approval',
          total_mensual: 'Monthly Total',
          por_aprobar: 'To Approve',
          aprobados_mes: 'Approved this month',
          pendiente: 'Pending',
          aprobado: 'Approved',
          rechazado: 'Rejected',
          pagado: 'Paid',
          
          // Categorías de gastos
          dietas: 'Meals',
          aparcamiento: 'Parking',
          gasolina: 'Fuel',
          alojamiento: 'Accommodation',
          transporte: 'Transport',
          material_oficina: 'Office supplies',
          formacion: 'Training',
          otros: 'Other expenses',
          
          // Formularios y campos
          fecha: 'Date',
          importe: 'Amount',
          descripcion: 'Description',
          categoria: 'Category',
          justificante: 'Receipt',
          guardar: 'Save',
          cancelar: 'Cancel',
          editar: 'Edit',
          eliminar: 'Delete',
          
          // Mensajes del sistema
          guardado_exitoso: 'Configuration saved successfully',
          error_guardar: 'Error saving configuration',
          campos_requeridos: 'Please fill in all required fields',
          
          // Configuración
          configuracion_empresa: 'Company Settings',
          configuracion_gastos: 'Expense Settings',
          configuracion_notificaciones: 'Notification Settings',
          configuracion_usuarios: 'User Settings',
          configuracion_idiomas: 'Language Settings',
          
          // Empresa
          nombre_empresa: 'Company name',
          logo_empresa: 'Company logo',
          colores_tema: 'Theme colors',
          
          // Roles y permisos
          roles_permisos: 'Roles and Permissions',
          crear_gastos: 'Create expenses',
          ver_propios_gastos: 'View own expenses',
          aprobar_gastos_equipo: 'Approve team expenses',
          ver_gastos_equipo: 'View team expenses',
          ver_todos_gastos: 'View all expenses',
          generar_informes: 'Generate reports',
          exportar_datos: 'Export data',
          revisar_contabilidad: 'Review accounting',
          todas: 'All permissions'
        },
        ca: {
          // Navegación y estructura
          gastos: 'Despeses',
          nuevo_gasto: 'Nova Despesa',
          mis_gastos: 'Les meves Despeses',
          dashboard: 'Tauler de Control',
          usuarios: 'Usuaris',
          configuracion: 'Configuració',
          reportes: 'Informes',
          cerrar_sesion: 'Tancar Sessió',
          
          // Estados y acciones
          pendientes_aprobacion: 'Pendents d\'Aprovació',
          total_mensual: 'Total Mensual',
          por_aprobar: 'Per Aprovar',
          aprobados_mes: 'Aprovats aquest mes',
          pendiente: 'Pendent',
          aprobado: 'Aprovat',
          rechazado: 'Rebutjat',
          pagado: 'Pagat',
          
          // Categorías de gastos
          dietas: 'Dietes',
          aparcamiento: 'Aparcament',
          gasolina: 'Combustible',
          alojamiento: 'Allotjament',
          transporte: 'Transport',
          material_oficina: 'Material d\'oficina',
          formacion: 'Formació',
          otros: 'Altres despeses',
          
          // Formularios y campos
          fecha: 'Data',
          importe: 'Import',
          descripcion: 'Descripció',
          categoria: 'Categoria',
          justificante: 'Justificant',
          guardar: 'Desar',
          cancelar: 'Cancel·lar',
          editar: 'Editar',
          eliminar: 'Eliminar',
          
          // Mensajes del sistema
          guardado_exitoso: 'Configuració desada correctament',
          error_guardar: 'Error en desar la configuració',
          campos_requeridos: 'Si us plau, completeu tots els camps requerits',
          
          // Configuración
          configuracion_empresa: 'Configuració d\'Empresa',
          configuracion_gastos: 'Configuració de Despeses',
          configuracion_notificaciones: 'Configuració de Notificacions',
          configuracion_usuarios: 'Configuració d\'Usuaris',
          configuracion_idiomas: 'Configuració d\'Idiomes',
          
          // Empresa
          nombre_empresa: 'Nom de l\'empresa',
          logo_empresa: 'Logo de l\'empresa',
          colores_tema: 'Colors del tema',
          
          // Roles y permisos
          roles_permisos: 'Rols i Permisos',
          crear_gastos: 'Crear despeses',
          ver_propios_gastos: 'Veure pròpies despeses',
          aprobar_gastos_equipo: 'Aprovar despeses de l\'equip',
          ver_gastos_equipo: 'Veure despeses de l\'equip',
          ver_todos_gastos: 'Veure totes les despeses',
          generar_informes: 'Generar informes',
          exportar_datos: 'Exportar dades',
          revisar_contabilidad: 'Revisar comptabilitat',
          todas: 'Tots els permisos'
        },
        de: {
          // Navegación y estructura
          gastos: 'Ausgaben',
          nuevo_gasto: 'Neue Ausgabe',
          mis_gastos: 'Meine Ausgaben',
          dashboard: 'Dashboard',
          usuarios: 'Benutzer',
          configuracion: 'Einstellungen',
          reportes: 'Berichte',
          cerrar_sesion: 'Abmelden',
          
          // Estados y acciones
          pendientes_aprobacion: 'Genehmigung ausstehend',
          total_mensual: 'Monatssumme',
          por_aprobar: 'Zu genehmigen',
          aprobados_mes: 'Genehmigt diesen Monat',
          pendiente: 'Ausstehend',
          aprobado: 'Genehmigt',
          rechazado: 'Abgelehnt',
          pagado: 'Bezahlt',
          
          // Categorías de gastos
          dietas: 'Mahlzeiten',
          aparcamiento: 'Parken',
          gasolina: 'Kraftstoff',
          alojamiento: 'Unterkunft',
          transporte: 'Transport',
          material_oficina: 'Büromaterial',
          formacion: 'Ausbildung',
          otros: 'Andere Ausgaben',
          
          // Formularios y campos
          fecha: 'Datum',
          importe: 'Betrag',
          descripcion: 'Beschreibung',
          categoria: 'Kategorie',
          justificante: 'Beleg',
          guardar: 'Speichern',
          cancelar: 'Abbrechen',
          editar: 'Bearbeiten',
          eliminar: 'Löschen',
          
          // Mensajes del sistema
          guardado_exitoso: 'Konfiguration erfolgreich gespeichert',
          error_guardar: 'Fehler beim Speichern der Konfiguration',
          campos_requeridos: 'Bitte füllen Sie alle erforderlichen Felder aus',
          
          // Configuración
          configuracion_empresa: 'Unternehmenseinstellungen',
          configuracion_gastos: 'Ausgabeneinstellungen',
          configuracion_notificaciones: 'Benachrichtigungseinstellungen',
          configuracion_usuarios: 'Benutzereinstellungen',
          configuracion_idiomas: 'Spracheinstellungen',
          
          // Empresa
          nombre_empresa: 'Firmenname',
          logo_empresa: 'Firmenlogo',
          colores_tema: 'Themenfarben',
          
          // Roles y permisos
          roles_permisos: 'Rollen und Berechtigungen',
          crear_gastos: 'Ausgaben erstellen',
          ver_propios_gastos: 'Eigene Ausgaben anzeigen',
          aprobar_gastos_equipo: 'Team-Ausgaben genehmigen',
          ver_gastos_equipo: 'Team-Ausgaben anzeigen',
          ver_todos_gastos: 'Alle Ausgaben anzeigen',
          generar_informes: 'Berichte erstellen',
          exportar_datos: 'Daten exportieren',
          revisar_contabilidad: 'Buchhaltung prüfen',
          todas: 'Alle Berechtigungen'
        },
        it: {
          // Navegación y estructura
          gastos: 'Spese',
          nuevo_gasto: 'Nuova Spesa',
          mis_gastos: 'Le mie Spese',
          dashboard: 'Dashboard',
          usuarios: 'Utenti',
          configuracion: 'Impostazioni',
          reportes: 'Report',
          cerrar_sesion: 'Esci',
          
          // Estados y acciones
          pendientes_aprobacion: 'In attesa di approvazione',
          total_mensual: 'Totale mensile',
          por_aprobar: 'Da approvare',
          aprobados_mes: 'Approvati questo mese',
          pendiente: 'In attesa',
          aprobado: 'Approvato',
          rechazado: 'Rifiutato',
          pagado: 'Pagato',
          
          // Categorías de gastos
          dietas: 'Pasti',
          aparcamiento: 'Parcheggio',
          gasolina: 'Carburante',
          alojamiento: 'Alloggio',
          transporte: 'Trasporto',
          material_oficina: 'Materiale da ufficio',
          formacion: 'Formazione',
          otros: 'Altre spese',
          
          // Formularios y campos
          fecha: 'Data',
          importe: 'Importo',
          descripcion: 'Descrizione',
          categoria: 'Categoria',
          justificante: 'Ricevuta',
          guardar: 'Salva',
          cancelar: 'Annulla',
          editar: 'Modifica',
          eliminar: 'Elimina',
          
          // Mensajes del sistema
          guardado_exitoso: 'Configurazione salvata con successo',
          error_guardar: 'Errore nel salvare la configurazione',
          campos_requeridos: 'Si prega di compilare tutti i campi obbligatori',
          
          // Configuración
          configuracion_empresa: 'Impostazioni Aziendali',
          configuracion_gastos: 'Impostazioni Spese',
          configuracion_notificaciones: 'Impostazioni Notifiche',
          configuracion_usuarios: 'Impostazioni Utenti',
          configuracion_idiomas: 'Impostazioni Lingua',
          
          // Empresa
          nombre_empresa: 'Nome azienda',
          logo_empresa: 'Logo aziendale',
          colores_tema: 'Colori del tema',
          
          // Roles y permisos
          roles_permisos: 'Ruoli e Permessi',
          crear_gastos: 'Creare spese',
          ver_propios_gastos: 'Visualizzare proprie spese',
          aprobar_gastos_equipo: 'Approvare spese del team',
          ver_gastos_equipo: 'Visualizzare spese del team',
          ver_todos_gastos: 'Visualizzare tutte le spese',
          generar_informes: 'Generare report',
          exportar_datos: 'Esportare dati',
          revisar_contabilidad: 'Rivedere contabilità',
          todas: 'Tutti i permessi'
        },
        pt: {
          // Navegación y estructura
          gastos: 'Despesas',
          nuevo_gasto: 'Nova Despesa',
          mis_gastos: 'Minhas Despesas',
          dashboard: 'Painel',
          usuarios: 'Usuários',
          configuracion: 'Configurações',
          reportes: 'Relatórios',
          cerrar_sesion: 'Sair',
          
          // Estados y acciones
          pendientes_aprobacion: 'Aguardando aprovação',
          total_mensual: 'Total mensal',
          por_aprobar: 'Para aprovar',
          aprobados_mes: 'Aprovados este mês',
          pendiente: 'Pendente',
          aprobado: 'Aprovado',
          rechazado: 'Rejeitado',
          pagado: 'Pago',
          
          // Categorías de gastos
          dietas: 'Refeições',
          aparcamiento: 'Estacionamento',
          gasolina: 'Combustível',
          alojamiento: 'Hospedagem',
          transporte: 'Transporte',
          material_oficina: 'Material de escritório',
          formacion: 'Treinamento',
          otros: 'Outras despesas',
          
          // Formularios y campos
          fecha: 'Data',
          importe: 'Valor',
          descripcion: 'Descrição',
          categoria: 'Categoria',
          justificante: 'Comprovante',
          guardar: 'Salvar',
          cancelar: 'Cancelar',
          editar: 'Editar',
          eliminar: 'Excluir',
          
          // Mensajes del sistema
          guardado_exitoso: 'Configuração salva com sucesso',
          error_guardar: 'Erro ao salvar configuração',
          campos_requeridos: 'Por favor, preencha todos os campos obrigatórios',
          
          // Configuración
          configuracion_empresa: 'Configurações da Empresa',
          configuracion_gastos: 'Configurações de Despesas',
          configuracion_notificaciones: 'Configurações de Notificações',
          configuracion_usuarios: 'Configurações de Usuários',
          configuracion_idiomas: 'Configurações de Idioma',
          
          // Empresa
          nombre_empresa: 'Nome da empresa',
          logo_empresa: 'Logo da empresa',
          colores_tema: 'Cores do tema',
          
          // Roles y permisos
          roles_permisos: 'Funções e Permissões',
          crear_gastos: 'Criar despesas',
          ver_propios_gastos: 'Ver próprias despesas',
          aprobar_gastos_equipo: 'Aprovar despesas da equipe',
          ver_gastos_equipo: 'Ver despesas da equipe',
          ver_todos_gastos: 'Ver todas as despesas',
          generar_informes: 'Gerar relatórios',
          exportar_datos: 'Exportar dados',
          revisar_contabilidad: 'Revisar contabilidade',
          todas: 'Todas as permissões'
        }
      }
    },
    apariencia: {
      modo_oscuro: false,
      tema: 'default'
    }
  });

  // Cargar configuración del servidor (comentado ya que no hay backend API)
  useEffect(() => {
    // loadConfig(); // Comentado hasta que tengamos backend
  }, []);

  const loadConfig = async () => {
    // Función comentada hasta que tengamos un backend real
    /*
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const config = await response.json();
        setFormData(prevData => ({
          ...prevData,
          ...config
        }));
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
    */
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Comentado hasta que tengamos backend API
      /*
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('✅ Configuración guardada correctamente');
      } else {
        throw new Error('Error en el servidor');
      }
      */
      
      // Simulación de guardado exitoso (temporal)
      setMessage('✅ Configuración guardada localmente (sin backend)');
      
    } catch (error) {
      setMessage('❌ Error al guardar la configuración: ' + error.message);
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

  const testSMTPConfig = async () => {
    try {
      setMessage('🧪 Enviando email de prueba...');
      
      // Comentado hasta que tengamos backend API
      /*
      const response = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData.notificaciones.smtp),
      });

      if (response.ok) {
        setMessage('✅ Email de prueba enviado correctamente');
      } else {
        throw new Error('Error en la prueba SMTP');
      }
      */
      
      // Simulación de test exitoso (temporal)
      setMessage('✅ Configuración SMTP validada localmente (sin backend)');
      
    } catch (error) {
      setMessage('❌ Error en la prueba SMTP: ' + error.message);
    }
  };

  const addCategory = () => {
    const newCategory = {
      nombre: 'Nueva Categoría',
      color: '#6c757d',
      icono: '📋',
      limite_diario: 0,
      activa: true
    };
    
    setFormData(prev => ({
      ...prev,
      gastos: {
        ...prev.gastos,
        categorias: [...prev.gastos.categorias, newCategory]
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
          className={activeTab === 'usuarios' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('usuarios')}
        >
          👥 Usuarios
        </button>
        <button 
          className={activeTab === 'idiomas' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('idiomas')}
        >
          🌐 Idiomas
        </button>
      </div>

      <div className="config-content">
        {/* SECCIÓN EMPRESA */}
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
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      empresa: {
                        ...prev.empresa,
                        nombre: e.target.value
                      }
                    }));
                  }}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Logo de la empresa:</label>
                <div className="logo-upload-section">
                  {formData.empresa?.logo_url && (
                    <div className="current-logo">
                      <img 
                        src={formData.empresa.logo_url} 
                        alt="Logo actual" 
                        style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="form-control"
                    style={{ marginTop: '10px' }}
                  />
                  <small style={{ color: 'var(--text-color)', opacity: 0.7 }}>
                    Formatos soportados: PNG, JPG, GIF. Tamaño máximo: 2MB
                  </small>
                </div>
              </div>
            </div>

            <div className="config-section">
              <h4 className="section-subtitle">Colores Corporativos</h4>
              <div className="colors-grid">
                <div className="form-group">
                  <label className="form-label">Color primario:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={formData.empresa?.colores?.primario || '#0066CC'}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          empresa: {
                            ...prev.empresa,
                            colores: {
                              ...prev.empresa?.colores,
                              primario: e.target.value
                            }
                          }
                        }));
                      }}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={formData.empresa?.colores?.primario || '#0066CC'}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          empresa: {
                            ...prev.empresa,
                            colores: {
                              ...prev.empresa?.colores,
                              primario: e.target.value
                            }
                          }
                        }));
                      }}
                      className="form-control color-text"
                      style={{ width: '100px' }}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Color secundario:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={formData.empresa?.colores?.secundario || '#f8f9fa'}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          empresa: {
                            ...prev.empresa,
                            colores: {
                              ...prev.empresa?.colores,
                              secundario: e.target.value
                            }
                          }
                        }));
                      }}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={formData.empresa?.colores?.secundario || '#f8f9fa'}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          empresa: {
                            ...prev.empresa,
                            colores: {
                              ...prev.empresa?.colores,
                              secundario: e.target.value
                            }
                          }
                        }));
                      }}
                      className="form-control color-text"
                      style={{ width: '100px' }}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Color de acento:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={formData.empresa?.colores?.acento || '#28a745'}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          empresa: {
                            ...prev.empresa,
                            colores: {
                              ...prev.empresa?.colores,
                              acento: e.target.value
                            }
                          }
                        }));
                      }}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={formData.empresa?.colores?.acento || '#28a745'}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          empresa: {
                            ...prev.empresa,
                            colores: {
                              ...prev.empresa?.colores,
                              acento: e.target.value
                            }
                          }
                        }));
                      }}
                      className="form-control color-text"
                      style={{ width: '100px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN GASTOS COMPLETA */}
        {activeTab === 'gastos' && (
          <div>
            <h3 className="section-title">💰 Configuración de Gastos</h3>
            
            {/* Categorías de gastos */}
            <div className="config-section">
              <h4 className="section-subtitle">Categorías de Gastos</h4>
              <div className="categories-grid">
                {(formData.gastos?.categorias || []).map((categoria, index) => (
                  <div key={index} className="category-card">
                    <div className="category-header">
                      <span className="category-icon">{categoria.icono}</span>
                      <input
                        type="text"
                        value={categoria.nombre}
                        onChange={(e) => updateCategory(index, 'nombre', e.target.value)}
                        className="form-control category-name"
                      />
                      <button
                        onClick={() => removeCategory(index)}
                        className="btn-remove"
                        title="Eliminar categoría"
                      >
                        ❌
                      </button>
                    </div>
                    
                    <div className="category-fields">
                      <div className="form-group">
                        <label>Icono:</label>
                        <input
                          type="text"
                          value={categoria.icono}
                          onChange={(e) => updateCategory(index, 'icono', e.target.value)}
                          className="form-control"
                          style={{ width: '60px' }}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Color:</label>
                        <input
                          type="color"
                          value={categoria.color}
                          onChange={(e) => updateCategory(index, 'color', e.target.value)}
                          className="color-picker"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Límite diario (€):</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={categoria.limite_diario}
                          onChange={(e) => updateCategory(index, 'limite_diario', parseFloat(e.target.value) || 0)}
                          className="form-control"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-checkbox">
                          <input
                            type="checkbox"
                            checked={categoria.activa}
                            onChange={(e) => updateCategory(index, 'activa', e.target.checked)}
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

            {/* Configuración general de gastos */}
            <div className="config-section">
              <h4 className="section-subtitle">Configuración General</h4>
              <div className="form-grid">
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
                  />
                  <small>Gastos superiores a este importe requerirán aprobación adicional</small>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Días límite para presentación:</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.gastos?.configuracion?.dias_limite_presentacion || 30}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        gastos: {
                          ...prev.gastos,
                          configuracion: {
                            ...prev.gastos?.configuracion,
                            dias_limite_presentacion: parseInt(e.target.value)
                          }
                        }
                      }));
                    }}
                    className="form-control"
                  />
                  <small>Días máximos para presentar un gasto después de realizarlo</small>
                </div>
              </div>
              
              <div className="checkbox-group">
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
                  Requiere aprobación del supervisor
                </label>
                
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.gastos?.configuracion?.permite_gastos_futuros || false}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        gastos: {
                          ...prev.gastos,
                          configuracion: {
                            ...prev.gastos?.configuracion,
                            permite_gastos_futuros: e.target.checked
                          }
                        }
                      }));
                    }}
                  />
                  Permite gastos con fechas futuras
                </label>
                
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.gastos?.configuracion?.requiere_proyecto || false}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        gastos: {
                          ...prev.gastos,
                          configuracion: {
                            ...prev.gastos?.configuracion,
                            requiere_proyecto: e.target.checked
                          }
                        }
                      }));
                    }}
                  />
                  Requiere asociar gastos a un proyecto
                </label>
              </div>
            </div>

            {/* Métodos de pago */}
            <div className="config-section">
              <h4 className="section-subtitle">Métodos de Pago</h4>
              <div className="payment-methods">
                {(formData.gastos?.metodos_pago || []).map((metodo, index) => (
                  <label key={index} className="form-checkbox payment-method">
                    <input
                      type="checkbox"
                      checked={metodo.activo}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          gastos: {
                            ...prev.gastos,
                            metodos_pago: prev.gastos.metodos_pago.map((m, i) => 
                              i === index ? { ...m, activo: e.target.checked } : m
                            )
                          }
                        }));
                      }}
                    />
                    {metodo.nombre}
                  </label>
                ))}
              </div>
            </div>

            {/* Límites de aprobación */}
            <div className="config-section">
              <h4 className="section-subtitle">Límites de Aprobación por Rol</h4>
              <div className="approval-limits">
                {Object.entries(formData.gastos?.limites_aprobacion || {}).map(([rol, limite]) => (
                  <div key={rol} className="limit-row">
                    <label className="form-label">{rol.charAt(0).toUpperCase() + rol.slice(1)}:</label>
                    <div className="limit-input">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={limite === 9999999 ? '' : limite}
                        placeholder="Sin límite"
                        onChange={(e) => {
                          const value = e.target.value === '' ? 9999999 : parseFloat(e.target.value) || 0;
                          setFormData(prev => ({
                            ...prev,
                            gastos: {
                              ...prev.gastos,
                              limites_aprobacion: {
                                ...prev.gastos?.limites_aprobacion,
                                [rol]: value
                              }
                            }
                          }));
                        }}
                        className="form-control"
                      />
                      <span>€</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN NOTIFICACIONES COMPLETA */}
        {activeTab === 'notificaciones' && (
          <div>
            <h3 className="section-title">🔔 Configuración de Notificaciones</h3>
            
            {/* Configuración de Email */}
            <div className="config-section">
              <h4 className="section-subtitle">Configuración de Email</h4>
              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.notificaciones?.email?.habilitado || false}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        notificaciones: {
                          ...prev.notificaciones,
                          email: {
                            ...prev.notificaciones?.email,
                            habilitado: e.target.checked
                          }
                        }
                      }));
                    }}
                  />
                  Habilitar notificaciones por email
                </label>
              </div>
              
              <div className="form-group">
                <label className="form-label">Email del administrador del sistema:</label>
                <input
                  type="email"
                  value={formData.notificaciones?.email?.admin_email || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      notificaciones: {
                        ...prev.notificaciones,
                        email: {
                          ...prev.notificaciones?.email,
                          admin_email: e.target.value
                        }
                      }
                    }));
                  }}
                  className="form-control"
                  placeholder="admin@empresa.com"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Plantilla de asunto del email:</label>
                <input
                  type="text"
                  value={formData.notificaciones?.email?.plantilla_asunto || '[GrupLomi] {tipo_evento} - {referencia}'}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      notificaciones: {
                        ...prev.notificaciones,
                        email: {
                          ...prev.notificaciones?.email,
                          plantilla_asunto: e.target.value
                        }
                      }
                    }));
                  }}
                  className="form-control"
                />
                <small>Variables disponibles: {'{tipo_evento}'}, {'{referencia}'}, {'{usuario}'}, {'{fecha}'}</small>
              </div>
            </div>

            {/* Eventos de notificación */}
            <div className="config-section">
              <h4 className="section-subtitle">Eventos de Notificación</h4>
              <div className="events-grid">
                {Object.entries(formData.notificaciones?.eventos || {}).map(([evento, config]) => (
                  <div key={evento} className="event-card">
                    <div className="event-header">
                      <label className="form-checkbox">
                        <input
                          type="checkbox"
                          checked={config.habilitado}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              notificaciones: {
                                ...prev.notificaciones,
                                eventos: {
                                  ...prev.notificaciones?.eventos,
                                  [evento]: {
                                    ...config,
                                    habilitado: e.target.checked
                                  }
                                }
                              }
                            }));
                          }}
                        />
                        {config.descripcion}
                      </label>
                    </div>
                    <small className="event-description">
                      {evento === 'nuevo_gasto' && '💰 Se notifica cuando se registra un nuevo gasto'}
                      {evento === 'gasto_aprobado' && '✅ Se notifica cuando se aprueba un gasto'}
                      {evento === 'gasto_rechazado' && '❌ Se notifica cuando se rechaza un gasto'}
                      {evento === 'limite_alcanzado' && '⚠️ Se notifica cuando se alcanza el límite de una categoría'}
                      {evento === 'recordatorio_pendientes' && '🔔 Se notifica para recordar gastos pendientes'}
                      {evento === 'informe_mensual' && '📄 Se envía un informe mensual de gastos'}
                    </small>
                  </div>
                ))}
              </div>
            </div>

            {/* Recordatorios automáticos */}
            <div className="config-section">
              <h4 className="section-subtitle">Recordatorios Automáticos</h4>
              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.notificaciones?.recordatorios?.habilitado || false}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        notificaciones: {
                          ...prev.notificaciones,
                          recordatorios: {
                            ...prev.notificaciones?.recordatorios,
                            habilitado: e.target.checked
                          }
                        }
                      }));
                    }}
                  />
                  Habilitar recordatorios automáticos
                </label>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Frecuencia de recordatorios:</label>
                  <select
                    value={formData.notificaciones?.recordatorios?.frecuencia || 'semanal'}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        notificaciones: {
                          ...prev.notificaciones,
                          recordatorios: {
                            ...prev.notificaciones?.recordatorios,
                            frecuencia: e.target.value
                          }
                        }
                      }));
                    }}
                    className="form-control"
                  >
                    <option value="nunca">Nunca</option>
                    <option value="diario">Diario</option>
                    <option value="cada_2_dias">Cada 2 días</option>
                    <option value="semanal">Semanal</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Hora de envío:</label>
                  <input
                    type="time"
                    value={formData.notificaciones?.recordatorios?.hora_envio || '09:00'}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        notificaciones: {
                          ...prev.notificaciones,
                          recordatorios: {
                            ...prev.notificaciones?.recordatorios,
                            hora_envio: e.target.value
                          }
                        }
                      }));
                    }}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Días de aviso antes del vencimiento:</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.notificaciones?.recordatorios?.dias_aviso || 5}
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
                  />
                </div>
              </div>
            </div>

            {/* Configuración SMTP */}
            <div className="config-section">
              <h4 className="section-subtitle">⚙️ Configuración SMTP Avanzada</h4>
              <div className="alert alert-warning">
                <strong>⚠️ Advertencia:</strong> Esta configuración es avanzada. Asegúrese de tener los datos correctos del servidor SMTP.
              </div>
              
              <div className="smtp-actions" style={{ marginBottom: '20px' }}>
                <button onClick={configurarGmailDefecto} className="btn btn-secondary">
                  📧 Configuración Gmail por defecto
                </button>
                <button onClick={testSMTPConfig} className="btn btn-primary">
                  🧪 Probar configuración
                </button>
              </div>
              
              <div className="form-grid">
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
                    value={formData.notificaciones?.smtp?.puerto || 587}
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
                    placeholder="usuario@gmail.com"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Contraseña:</label>
                  <input
                    type="password"
                    value={formData.notificaciones?.smtp?.contraseña || ''}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        notificaciones: {
                          ...prev.notificaciones,
                          smtp: {
                            ...prev.notificaciones?.smtp,
                            contraseña: e.target.value
                          }
                        }
                      }));
                    }}
                    className="form-control"
                    placeholder="Contraseña o app password"
                  />
                </div>
              </div>
              
              <div className="checkbox-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.notificaciones?.smtp?.ssl || false}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        notificaciones: {
                          ...prev.notificaciones,
                          smtp: {
                            ...prev.notificaciones?.smtp,
                            ssl: e.target.checked
                          }
                        }
                      }));
                    }}
                  />
                  Usar SSL
                </label>
                
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.notificaciones?.smtp?.tls || true}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        notificaciones: {
                          ...prev.notificaciones,
                          smtp: {
                            ...prev.notificaciones?.smtp,
                            tls: e.target.checked
                          }
                        }
                      }));
                    }}
                  />
                  Usar TLS
                </label>
              </div>
              
              <div className="smtp-help">
                <h5>📖 Guía de configuraciones comunes:</h5>
                <div className="smtp-guides">
                  <div className="smtp-guide">
                    <strong>Gmail:</strong> smtp.gmail.com, puerto 587, TLS habilitado
                  </div>
                  <div className="smtp-guide">
                    <strong>Outlook:</strong> smtp-mail.outlook.com, puerto 587, TLS habilitado
                  </div>
                  <div className="smtp-guide">
                    <strong>Yahoo:</strong> smtp.mail.yahoo.com, puerto 587, TLS habilitado
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN USUARIOS COMPLETA */}
        {activeTab === 'usuarios' && (
          <div>
            <h3 className="section-title">👥 Configuración de Usuarios</h3>
            
            {/* Gestión de roles */}
            <div className="config-section">
              <h4 className="section-subtitle">Roles y Permisos</h4>
              <div className="roles-grid">
                {(formData.usuarios?.roles || []).map((rol, index) => (
                  <div key={index} className="role-card">
                    <div className="role-header">
                      <h5>{rol.nombre.charAt(0).toUpperCase() + rol.nombre.slice(1)}</h5>
                      <label className="form-checkbox">
                        <input
                          type="checkbox"
                          checked={rol.activo}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              usuarios: {
                                ...prev.usuarios,
                                roles: prev.usuarios.roles.map((r, i) => 
                                  i === index ? { ...r, activo: e.target.checked } : r
                                )
                              }
                            }));
                          }}
                        />
                        Activo
                      </label>
                    </div>
                    
                    <p className="role-description">{rol.descripcion}</p>
                    
                    <div className="role-permissions">
                      <strong>Permisos:</strong>
                      <div className="permissions-list">
                        {rol.permisos.includes('todas') ? (
                          <span className="permission-tag all-permissions">Todos los permisos</span>
                        ) : (
                          rol.permisos.map((permiso, pIndex) => (
                            <span key={pIndex} className="permission-tag">
                              {permiso.replace('_', ' ')}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuración de usuario */}
            <div className="config-section">
              <h4 className="section-subtitle">Configuración de Acceso</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.usuarios?.configuracion?.registro_libre || false}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          usuarios: {
                            ...prev.usuarios,
                            configuracion: {
                              ...prev.usuarios?.configuracion,
                              registro_libre: e.target.checked
                            }
                          }
                        }));
                      }}
                    />
                    Permitir registro libre de usuarios
                  </label>
                </div>
                
                <div className="form-group">
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.usuarios?.configuracion?.requiere_aprobacion_admin || true}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          usuarios: {
                            ...prev.usuarios,
                            configuracion: {
                              ...prev.usuarios?.configuracion,
                              requiere_aprobacion_admin: e.target.checked
                            }
                          }
                        }));
                      }}
                    />
                    Requiere aprobación del administrador para nuevos usuarios
                  </label>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Timeout de sesión (minutos):</label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={formData.usuarios?.configuracion?.sesion_timeout || 120}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        usuarios: {
                          ...prev.usuarios,
                          configuracion: {
                            ...prev.usuarios?.configuracion,
                            sesion_timeout: parseInt(e.target.value)
                          }
                        }
                      }));
                    }}
                    className="form-control"
                  />
                  <small>Tiempo de inactividad antes de cerrar la sesión automáticamente</small>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Intentos de login permitidos:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.usuarios?.configuracion?.intentos_login || 3}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        usuarios: {
                          ...prev.usuarios,
                          configuracion: {
                            ...prev.usuarios?.configuracion,
                            intentos_login: parseInt(e.target.value)
                          }
                        }
                      }));
                    }}
                    className="form-control"
                  />
                  <small>Número de intentos fallidos antes de bloquear la cuenta</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN IDIOMAS COMPLETA CON PESTAÑAS */}
        {activeTab === 'idiomas' && (
          <div>
            <h3 className="section-title">🌐 Configuración de Idiomas</h3>
            
            <div className="config-section">
              <h4 className="section-subtitle">Configuración General</h4>
              <div className="form-group">
                <label className="form-label">Idioma por defecto del sistema:</label>
                <select
                  value={formData.idioma?.predeterminado || 'es'}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      idioma: {
                        ...prev.idioma,
                        predeterminado: e.target.value
                      }
                    }));
                  }}
                  className="form-control"
                >
                  <option value="es">🇪🇸 Español</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="ca">🏴󠁥󠁳󠁣󠁴󠁿 Català</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="it">🇮🇹 Italiano</option>
                  <option value="pt">🇵🇹 Português</option>
                </select>
              </div>
            </div>

            <div className="config-section">
              <h4 className="section-subtitle">Traducciones</h4>
              
              {/* Pestañas de idiomas */}
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
                    {lang === 'de' && '🇩🇪 Deutsch'}
                    {lang === 'it' && '🇮🇹 Italiano'}
                    {lang === 'pt' && '🇵🇹 Português'}
                  </button>
                ))}
              </div>

              {/* Contenido de traducciones para el idioma activo */}
              <div className="translations-content">
                <div className="translations-grid">
                  {formData.idioma?.traducciones?.[activeLanguageTab] && 
                    Object.entries(formData.idioma.traducciones[activeLanguageTab]).map(([key, value]) => (
                    <div key={key} className="translation-item">
                      <label className="form-label">{key.replace('_', ' ')}:</label>
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

        {/* Mensajes y botones de acción */}
        {message && (
          <div className={message.includes('Error') || message.includes('❌') ? 'alert alert-error' : 'alert alert-success'}>
            {message}
          </div>
        )}

        <div className="config-actions">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary save-btn"
          >
            {loading ? 'Guardando...' : '💾 Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfigPage;