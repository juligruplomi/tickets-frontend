import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const ConfigContext = createContext();

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig debe usarse dentro de ConfigProvider');
  }
  return context;
}

export function ConfigProvider({ children }) {
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

  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Función de traducción
  const t = (key) => {
    return config?.idioma?.traducciones?.[key] || key;
  };

  // Cargar configuración desde la API
  const loadConfig = async (lang = currentLanguage) => {
    try {
      setLoading(true);
      const response = await api.get(`/config?lang=${lang}`);
      setConfig(response.data);
      setCurrentLanguage(lang);
      
      // Aplicar modo oscuro si está configurado
      if (response.data.apariencia?.modo_oscuro !== darkMode) {
        setDarkMode(response.data.apariencia.modo_oscuro);
        applyDarkMode(response.data.apariencia.modo_oscuro);
      }
      
      // Aplicar colores corporativos
      applyCompanyColors(response.data.empresa?.colores);
      
    } catch (err) {
      console.error('Error loading config:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar idioma
  const changeLanguage = async (lang) => {
    setCurrentLanguage(lang);
    await loadConfig(lang);
  };

  // Aplicar modo oscuro
  const applyDarkMode = (isDark) => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark-mode');
      root.style.setProperty('--background-color', '#1a1a1a');
      root.style.setProperty('--card-background', '#2d2d2d');
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--border-color', '#404040');
    } else {
      root.classList.remove('dark-mode');
      root.style.setProperty('--background-color', '#f5f5f5');
      root.style.setProperty('--card-background', '#ffffff');
      root.style.setProperty('--text-color', '#333333');
      root.style.setProperty('--border-color', '#e0e0e0');
    }
  };

  // Aplicar colores corporativos
  const applyCompanyColors = (colores) => {
    if (!colores) return;
    
    const root = document.documentElement;
    root.style.setProperty('--primary-color', colores.primario);
    root.style.setProperty('--secondary-color', colores.secundario);
    root.style.setProperty('--accent-color', colores.acento);
  };

  // Toggle manual del modo oscuro
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    applyDarkMode(newDarkMode);
  };

  // Recargar configuración (útil después de cambios en el panel de admin)
  const reloadConfig = () => {
    loadConfig(currentLanguage);
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{
      config,
      currentLanguage,
      darkMode,
      loading,
      t,
      changeLanguage,
      toggleDarkMode,
      reloadConfig
    }}>
      {children}
    </ConfigContext.Provider>
  );
}