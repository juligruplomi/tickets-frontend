import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useSystemConfig() {
  const [config, setConfig] = useState({
    empresa: {
      nombre: "GrupLomi",
      logo_url: "/logo.png",
      colores: {
        primario: "#0066CC",
        secundario: "#f8f9fa",
        acento: "#28a745"
      }
    },
    idioma: {
      actual: "es",
      disponibles: ["es", "en", "ca"],
      traducciones: {
        bienvenida: "Bienvenido al sistema de tickets",
        footer: "© 2025 - Sistema de gestión de tickets",
        dashboard: "Panel de Control",
        tickets: "Tickets",
        usuarios: "Usuarios",
        configuracion: "Configuración",
        cerrar_sesion: "Cerrar Sesión"
      }
    },
    apariencia: {
      modo_oscuro: false,
      tema: "default"
    },
    tickets: {
      estados: ["abierto", "en_progreso", "pendiente", "resuelto", "cerrado"],
      prioridades: ["baja", "media", "alta", "urgente"],
      categorias: ["hardware", "software", "red", "acceso", "otro"]
    }
  });
  
  const [adminConfig, setAdminConfig] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConfig = async (lang = 'es') => {
    try {
      setLoading(true);
      const response = await api.get(`/config?lang=${lang}`);
      setConfig(response.data);
      setCurrentLanguage(lang);
      setError(null);
    } catch (err) {
      console.error('Error loading config:', err);
      setError('Error al cargar la configuración');
      // Mantener configuración por defecto si falla
    } finally {
      setLoading(false);
    }
  };

  const loadAdminConfig = async () => {
    try {
      const response = await api.get('/config/admin');
      setAdminConfig(response.data);
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
      // Recargar la configuración pública también
      loadConfig(currentLanguage);
      return { success: true };
    } catch (err) {
      console.error('Error updating config:', err);
      return { success: false, error: err.response?.data?.error || 'Error al actualizar configuración' };
    }
  };

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
    loadConfig(lang);
  };

  const t = (key) => {
    if (!config?.idioma?.traducciones) return key;
    return config.idioma.traducciones[key] || key;
  };

  useEffect(() => {
    loadConfig(currentLanguage);
  }, []);

  return {
    config,
    adminConfig,
    currentLanguage,
    loading,
    error,
    updateConfig,
    loadAdminConfig,
    changeLanguage,
    reload: loadConfig,
    t // función de traducción
  };
}