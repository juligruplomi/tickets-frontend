import { useState, useEffect } from 'react';
import { configAPI } from '../services/api';

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
    mensajes: {
      bienvenida: "Bienvenido al sistema de tickets",
      footer: "© 2025 - Sistema de gestión de tickets"
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
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await configAPI.get();
      setConfig(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading config:', err);
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      const response = await configAPI.update(newConfig);
      setConfig(response.data.config);
      return { success: true };
    } catch (err) {
      console.error('Error updating config:', err);
      return { success: false, error: err.response?.data?.error || 'Error al actualizar configuración' };
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    loading,
    error,
    updateConfig,
    reload: loadConfig
  };
}