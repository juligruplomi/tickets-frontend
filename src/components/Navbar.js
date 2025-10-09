import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { config, darkMode, toggleDarkMode } = useConfig();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;



  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-brand">
          {config?.empresa?.logo_url ? (
            <img 
              src={config.empresa.logo_url} 
              alt={config.empresa.nombre}
              className="navbar-logo"
            />
          ) : (
            `💰 ${config?.empresa?.nombre || 'GrupLomi'}`
          )}
        </Link>
        
        <ul className="navbar-nav">
          <li>
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              title="Dashboard"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
            </Link>
          </li>
          <li>
            <Link 
              to="/gastos" 
              className={`nav-link ${isActive('/gastos') ? 'active' : ''}`}
              title="Gastos"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 21H5V3H13V9H19Z"/>
              </svg>
            </Link>
          </li>
          
          {/* Solo administradores ven usuarios y roles */}
          {(user?.role === 'administrador' || user?.role === 'admin') && (
            <>
              <li>
                <Link 
                  to="/users" 
                  className={`nav-link ${isActive('/users') ? 'active' : ''}`}
                  title="Usuarios"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </Link>
              </li>
              <li>
                <Link 
                  to="/roles" 
                  className={`nav-link ${isActive('/roles') ? 'active' : ''}`}
                  title="Roles y Permisos"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                </Link>
              </li>
            </>
          )}
          
          {/* Reportes para supervisores, contabilidad y administradores */}
          {(user?.role === 'supervisor' || user?.role === 'contabilidad' || user?.role === 'administrador' || user?.role === 'admin') && (
            <li>
              <Link 
                to="/reportes" 
                className={`nav-link ${isActive('/reportes') ? 'active' : ''}`}
                title="Reportes"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,3H5C3.9,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.9 20.1,3 19,3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z"/>
                </svg>
              </Link>
            </li>
          )}
          
          {/* Configuración: administradores ven configuración completa, otros usuarios ven configuración personal */}
          <li>
            <Link 
              to="/config" 
              className={`nav-link ${isActive('/config') ? 'active' : ''}`}
              title={(user?.role === 'administrador' || user?.role === 'admin') ? 'Configuración del Sistema' : 'Mi Configuración'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
              </svg>
            </Link>
          </li>
        </ul>
        
        <div className="navbar-user">
          <div className="user-controls">
            {/* Toggle theme en navbar */}
            <div className="navbar-theme-toggle">
              <input
                type="checkbox"
                id="navbarDarkModeToggle"
                checked={darkMode}
                onChange={toggleDarkMode}
                className="navbar-toggle-checkbox"
              />
              <label 
                htmlFor="navbarDarkModeToggle" 
                className="navbar-toggle-label"
                title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                <span className="navbar-toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <span className="user-name">
            Hola, {user?.nombre || user?.email}
            {user?.role && (
              <small style={{ display: 'block', opacity: 0.7, fontSize: '0.75rem' }}>
                {(user.role === 'administrador' || user.role === 'admin') ? 'Admin' :
                 user.role === 'supervisor' ? 'Supervisor' :
                 user.role === 'operario' ? 'Operario' :
                 user.role === 'contabilidad' ? 'Contabilidad' : user.role}
              </small>
            )}
          </span>
          <button 
            className="logout-button" 
            onClick={logout}
            title="Cerrar sesión"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;