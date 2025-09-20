import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { config, t } = useConfig();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="navbar-brand">
          {t('tickets')} {config.empresa.nombre}
        </Link>
        
        <ul className="navbar-nav">
          <li>
            <Link 
              to="/dashboard" 
              className={isActive('/dashboard') ? 'active' : ''}
            >
              {t('dashboard')}
            </Link>
          </li>
          <li>
            <Link 
              to="/tickets" 
              className={isActive('/tickets') ? 'active' : ''}
            >
              {t('tickets')}
            </Link>
          </li>
          {user?.role === 'admin' && (
            <li>
              <Link 
                to="/users" 
                className={isActive('/users') ? 'active' : ''}
              >
                {t('usuarios')}
              </Link>
            </li>
          )}
          {user?.role === 'admin' && (
            <li>
              <Link 
                to="/config" 
                className={isActive('/config') ? 'active' : ''}
              >
                {t('configuracion')}
              </Link>
            </li>
          )}
        </ul>
        
        <div className="navbar-user">
          <span>Hola, {user?.nombre || user?.email}</span>
          <button className="button button-secondary" onClick={logout}>
            {t('cerrar_sesion')}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;