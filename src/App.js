import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConfigProvider } from './context/ConfigContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GastosPage from './pages/GastosPage';
import UsersPage from './pages/UsersPage';
import CreateTicket from './pages/CreateTicket';
import Users from './pages/Users';
import ConfigPage from './pages/ConfigPage';
import RolesPage from './pages/RolesPage';
import ReportesPage from './pages/ReportesPage';
import Navbar from './components/Navbar';
import './App.css';

// Componente para rutas protegidas
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Componente para rutas solo de admin
function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'administrador' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/gastos" 
            element={
              <ProtectedRoute>
                <GastosPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reportes" 
            element={
              <ProtectedRoute>
                <ReportesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tickets/new" 
            element={
              <ProtectedRoute>
                <CreateTicket />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            } 
          />
          <Route 
            path="/config" 
            element={
              <ProtectedRoute>
                <ConfigPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/roles" 
            element={
              <AdminRoute>
                <RolesPage />
              </AdminRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ConfigProvider>
          <AppContent />
        </ConfigProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;