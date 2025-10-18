// INSTRUCCIÓN: Copia este contenido COMPLETO en C:\tickets-frontend\src\context\ConfigContext.js

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
    gastos: {
      tipos_gasto: [
        { id: "dieta", nombre: "Dietas", icon: "🍽️" },
        { id: "aparcamiento", nombre: "Aparcamiento", icon: "🅿️" },
        { id: "gasolina", nombre: "Combustible", icon: "⛽" },
        { id: "otros", nombre: "Otros gastos", icon: "📎" }
      ],
      estados: [
        { id: "pendiente", nombre: "Pendiente", color: "#ffc107" },
        { id: "aprobado", nombre: "Aprobado", color: "#28a745" },
        { id: "rechazado", nombre: "Rechazado", color: "#dc3545" },
        { id: "pagado", nombre: "Pagado", color: "#0066CC" }
      ]
    },
    idioma: {
      actual: "es",
      disponibles: ["es", "en", "ca", "de", "it", "pt"],
      traducciones: {
        gastos: "Gastos",
        nuevo_gasto: "Nuevo Gasto",
        mis_gastos: "Mis Gastos",
        dashboard: "Panel de Control",
        usuarios: "Usuarios",
        configuracion: "Configuración",
        cerrar_sesion: "Cerrar Sesión",
        hola: "Hola",
        bienvenida: "Bienvenido al sistema de gastos",
        footer: "© 2025 - Sistema de gestión de gastos"
      }
    },
    apariencia: {
      modo_oscuro: false,
      tema: "default"
    }
  });

  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [darkMode, setDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
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
      
      // El backend devuelve estructura plana, necesitamos adaptarla
      const backendData = response.data;
      
      // Transformar estructura plana del backend a estructura anidada del frontend
      const adaptedConfig = {
        empresa: {
          nombre: backendData.nombre_empresa || "GrupLomi",
          logo_url: backendData.logo_url || "/logo.png",
          colores: {
            primario: backendData.color_primario || "#0066CC",
            secundario: backendData.color_secundario || "#f8f9fa",
            acento: backendData.color_acento || "#28a745"
          }
        },
        gastos: {
          tipos_gasto: backendData.categorias_gasto || config.gastos.tipos_gasto,
          estados: config.gastos.estados
        },
        idioma: {
          actual: backendData.idioma_principal || lang,
          disponibles: Object.keys(backendData.idiomas || {}),
          traducciones: config.idioma.traducciones
        },
        apariencia: {
          modo_oscuro: backendData.modo_oscuro || false,
          tema: backendData.tema || 'default'
        }
      };
      
      // Actualizar configuración con los datos adaptados
      setConfig(adaptedConfig);
      setCurrentLanguage(adaptedConfig.idioma.actual);
      
      // Aplicar modo oscuro si está configurado
      if (adaptedConfig.apariencia.modo_oscuro !== darkMode) {
        setDarkMode(adaptedConfig.apariencia.modo_oscuro);
        applyDarkMode(adaptedConfig.apariencia.modo_oscuro);
      }
      
      // Aplicar tema
      const theme = adaptedConfig.apariencia.tema;
      setCurrentTheme(theme);
      applyTheme(theme);
      
      // Aplicar colores corporativos
      applyCompanyColors(adaptedConfig.empresa.colores);
      
    } catch (err) {
      console.error('Error loading config:', err);
      // Mantener configuración por defecto en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Cambiar idioma del usuario
  const changeLanguage = async (lang) => {
    try {
      // Usar el nuevo endpoint para cambiar idioma
      const response = await api.put('/config/language', { language: lang });
      setConfig(response.data);
      setCurrentLanguage(lang);
    } catch (err) {
      console.error('Error changing language:', err);
      // Fallback: cambiar solo localmente
      setCurrentLanguage(lang);
      await loadConfig(lang);
    }
  };

  // Aplicar tema
  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    // Limpiar clases de tema anteriores
    root.classList.remove('theme-default', 'theme-corporate', 'theme-modern', 'theme-matrix');
    
    switch (theme) {
      case 'corporate':
        root.classList.add('theme-corporate');
        break;
      case 'modern':
        root.classList.add('theme-modern');
        break;
      case 'matrix':
        root.classList.add('theme-matrix');
        applyMatrixEffect();
        break;
      default:
        root.classList.add('theme-default');
        break;
    }
  };

  // Efecto Matrix
  const applyMatrixEffect = () => {
    const matrixContainer = document.getElementById('matrix-bg');
    if (matrixContainer) {
      matrixContainer.remove();
    }
    
    const container = document.createElement('div');
    container.id = 'matrix-bg';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      overflow: hidden;
    `;
    
    for (let i = 0; i < 100; i++) {
      const column = document.createElement('div');
      column.style.cssText = `
        position: absolute;
        top: -100px;
        left: ${Math.random() * 100}%;
        color: #00ff00;
        font-family: Courier New, monospace;
        font-size: 14px;
        animation: matrix-fall ${3 + Math.random() * 5}s linear infinite;
        animation-delay: ${Math.random() * 5}s;
      `;
      column.textContent = String.fromCharCode(0x30A0 + Math.random() * 96);
      container.appendChild(column);
    }
    
    document.body.appendChild(container);
    
    if (!document.getElementById('matrix-styles')) {
      const style = document.createElement('style');
      style.id = 'matrix-styles';
      style.textContent = `
        @keyframes matrix-fall {
          to {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Aplicar modo oscuro
  const applyDarkMode = (isDark) => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
  };

  // Aplicar colores corporativos
  const applyCompanyColors = (colores) => {
    if (!colores || currentTheme === 'matrix') return;
    
    const root = document.documentElement;
    if (currentTheme === 'default') {
      root.style.setProperty('--primary-color', colores.primario);
      root.style.setProperty('--secondary-color', colores.secundario);
      root.style.setProperty('--accent-color', colores.acento);
    }
  };

  // Toggle manual del modo oscuro
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    applyDarkMode(newDarkMode);
  };

  // Recargar configuración
  const reloadConfig = () => {
    loadConfig(currentLanguage);
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Limpiar efectos al desmontar
  useEffect(() => {
    return () => {
      const matrixContainer = document.getElementById('matrix-bg');
      if (matrixContainer) {
        matrixContainer.remove();
      }
      const matrixStyles = document.getElementById('matrix-styles');
      if (matrixStyles) {
        matrixStyles.remove();
      }
    };
  }, []);

  return (
    <ConfigContext.Provider value={{
      config,
      currentLanguage,
      darkMode,
      currentTheme,
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