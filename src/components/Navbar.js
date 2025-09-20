import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { config, t, darkMode, currentLanguage, changeLanguage, toggleDarkMode } = useConfig();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-brand">
          {config.empresa.logo_url ? (
            <img 
              src={config.empresa.logo_url} 
              alt={config.empresa.nombre}
              className="navbar-logo"
            />
          ) : (
            `${t('tickets')} ${config.empresa.nombre}`
          )}
        </Link>
        
        <ul className="navbar-nav">
          <li>
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              title={t('dashboard')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
            </Link>
          </li>
          <li>
            <Link 
              to="/tickets" 
              className={`nav-link ${isActive('/tickets') ? 'active' : ''}`}
              title={t('tickets')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22,10 C22.5522847,10 23,10.4477153 23,11 L23,13 C23,13.5522847 22.5522847,14 22,14 L2,14 C1.44771525,14 1,13.5522847 1,13 L1,11 C1,10.4477153 1.44771525,10 2,10 L22,10 Z M21,12 L3,12 L3,12 L21,12 Z M22,4 C22.5522847,4 23,4.44771525 23,5 L23,7 C23,7.55228475 22.5522847,8 22,8 L2,8 C1.44771525,8 1,7.55228475 1,7 L1,5 C1,4.44771525 1.44771525,4 2,4 L22,4 Z M21,6 L3,6 L3,6 L21,6 Z M22,16 C22.5522847,16 23,16.4477153 23,17 L23,19 C23,19.5522847 22.5522847,20 22,20 L2,20 C1.44771525,20 1,19.5522847 1,19 L1,17 C1,16.4477153 1.44771525,16 2,16 L22,16 Z M21,18 L3,18 L3,18 L21,18 Z"/>
              </svg>
            </Link>
          </li>
          {user?.role === 'admin' && (
            <li>
              <Link 
                to="/users" 
                className={`nav-link ${isActive('/users') ? 'active' : ''}`}
                title={t('usuarios')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </Link>
            </li>
          )}
          {user?.role === 'admin' && (
            <li>
              <Link 
                to="/config" 
                className={`nav-link ${isActive('/config') ? 'active' : ''}`}
                title={t('configuracion')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
                </svg>
              </Link>
            </li>
          )}
        </ul>
        
        <div className="navbar-user">
          <div className="user-controls">
            {/* Selector de idioma en navbar */}
            <div className="navbar-language-selector">
              <select 
                value={currentLanguage} 
                onChange={(e) => changeLanguage(e.target.value)}
                className="navbar-select"
              >
                <option value="es">🇪🇸</option>
                <option value="en">🇬🇧</option>
                <option value="ca">🏴󠁥󠁳󠁣󠁴󠁿</option>
                <option value="de">🇩🇪</option>
                <option value="it">🇮🇹</option>
                <option value="pt">🇵🇹</option>
              </select>
            </div>
            
            {/* Toggle theme en navbar */}
            <div className="navbar-theme-toggle">
              <input
                type="checkbox"
                id="navbarDarkModeToggle"
                checked={darkMode}
                onChange={toggleDarkMode}
                className="navbar-toggle-checkbox"
              />
              <label htmlFor="navbarDarkModeToggle" className="navbar-toggle-label">
                <span className="navbar-toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <span className="user-name">Hola, {user?.nombre || user?.email}</span>
          <button className="logout-button" onClick={logout}>
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