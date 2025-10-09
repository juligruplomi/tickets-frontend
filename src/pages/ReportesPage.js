import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './ReportesPage.css';

function ReportesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    estado: '',
    tipo_gasto: '',
    usuario_id: ''
  });
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    loadUsuarios();
    loadReportData();
  }, []);

  const loadUsuarios = async () => {
    try {
      if (user?.role === 'administrador' || user?.role === 'admin') {
        const response = await api.get('/usuarios');
        setUsuarios(response.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde;
      if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta;
      if (filters.estado) params.estado = filters.estado;
      if (filters.tipo_gasto) params.tipo_gasto = filters.tipo_gasto;
      if (filters.usuario_id) params.usuario_id = filters.usuario_id;

      const response = await api.get('/reportes/gastos', { params });
      setReportData(response.data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateReport = () => {
    loadReportData();
  };

  const handleExport = async (format = 'csv') => {
    try {
      const params = { ...filters, formato: format };
      const response = await api.get('/reportes/export', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_gastos_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Error al exportar el reporte');
    }
  };

  const calcularTotales = () => {
    if (!reportData || !Array.isArray(reportData)) return {
      total: 0,
      pendientes: 0,
      aprobados: 0,
      rechazados: 0,
      pagados: 0
    };

    return {
      total: reportData.reduce((sum, g) => sum + parseFloat(g.importe || 0), 0),
      pendientes: reportData.filter(g => g.estado === 'pendiente').reduce((sum, g) => sum + parseFloat(g.importe || 0), 0),
      aprobados: reportData.filter(g => g.estado === 'aprobado').reduce((sum, g) => sum + parseFloat(g.importe || 0), 0),
      rechazados: reportData.filter(g => g.estado === 'rechazado').reduce((sum, g) => sum + parseFloat(g.importe || 0), 0),
      pagados: reportData.filter(g => g.estado === 'pagado').reduce((sum, g) => sum + parseFloat(g.importe || 0), 0)
    };
  };

  const totales = calcularTotales();

  if (user?.role !== 'administrador' && user?.role !== 'admin' && user?.role !== 'supervisor' && user?.role !== 'contabilidad') {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body">
            <p style={{ textAlign: 'center', padding: '20px' }}>
              ⛔ No tienes permisos para acceder a esta sección.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card reportes-card">
        <div className="card-header">
          <h2>📊 Reportes y Análisis</h2>
          <p className="subtitle">Genera reportes detallados de gastos con filtros avanzados</p>
        </div>

        <div className="card-body">
          {/* Filtros */}
          <div className="filters-section">
            <h3>🔍 Filtros de Búsqueda</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label>Desde:</label>
                <input
                  type="date"
                  value={filters.fecha_desde}
                  onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="filter-group">
                <label>Hasta:</label>
                <input
                  type="date"
                  value={filters.fecha_hasta}
                  onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="filter-group">
                <label>Estado:</label>
                <select
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  className="form-control"
                >
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="pagado">Pagado</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Tipo de Gasto:</label>
                <select
                  value={filters.tipo_gasto}
                  onChange={(e) => handleFilterChange('tipo_gasto', e.target.value)}
                  className="form-control"
                >
                  <option value="">Todos</option>
                  <option value="dieta">Dietas</option>
                  <option value="aparcamiento">Aparcamiento</option>
                  <option value="gasolina">Combustible</option>
                  <option value="otros">Otros</option>
                </select>
              </div>

              {(user?.role === 'administrador' || user?.role === 'admin') && (
                <div className="filter-group">
                  <label>Usuario:</label>
                  <select
                    value={filters.usuario_id}
                    onChange={(e) => handleFilterChange('usuario_id', e.target.value)}
                    className="form-control"
                  >
                    <option value="">Todos</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} {u.apellidos}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="filter-actions">
              <button
                className="button button-primary"
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? '⏳ Generando...' : '🔍 Generar Reporte'}
              </button>
              <button
                className="button button-secondary"
                onClick={() => setFilters({
                  fecha_desde: '',
                  fecha_hasta: '',
                  estado: '',
                  tipo_gasto: '',
                  usuario_id: ''
                })}
              >
                🔄 Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Resumen de Totales */}
          {reportData && (
            <>
              <div className="totales-section">
                <h3>💰 Resumen de Totales</h3>
                <div className="totales-grid">
                  <div className="total-card">
                    <div className="total-icon">💵</div>
                    <div className="total-content">
                      <div className="total-label">Total General</div>
                      <div className="total-amount">{totales.total.toFixed(2)}€</div>
                    </div>
                  </div>

                  <div className="total-card">
                    <div className="total-icon">⏳</div>
                    <div className="total-content">
                      <div className="total-label">Pendientes</div>
                      <div className="total-amount">{totales.pendientes.toFixed(2)}€</div>
                    </div>
                  </div>

                  <div className="total-card">
                    <div className="total-icon">✅</div>
                    <div className="total-content">
                      <div className="total-label">Aprobados</div>
                      <div className="total-amount">{totales.aprobados.toFixed(2)}€</div>
                    </div>
                  </div>

                  <div className="total-card">
                    <div className="total-icon">❌</div>
                    <div className="total-content">
                      <div className="total-label">Rechazados</div>
                      <div className="total-amount">{totales.rechazados.toFixed(2)}€</div>
                    </div>
                  </div>

                  <div className="total-card">
                    <div className="total-icon">💳</div>
                    <div className="total-content">
                      <div className="total-label">Pagados</div>
                      <div className="total-amount">{totales.pagados.toFixed(2)}€</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exportar */}
              <div className="export-section">
                <h3>📥 Exportar Datos</h3>
                <div className="export-buttons">
                  <button
                    className="button button-success"
                    onClick={() => handleExport('csv')}
                  >
                    📄 Exportar a CSV
                  </button>
                  <button
                    className="button button-success"
                    onClick={() => handleExport('xlsx')}
                  >
                    📊 Exportar a Excel
                  </button>
                </div>
              </div>

              {/* Tabla de resultados */}
              <div className="results-section">
                <h3>📋 Detalle de Gastos ({reportData.length} registros)</h3>
                <div className="table-responsive">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Usuario</th>
                        <th>Tipo</th>
                        <th>Descripción</th>
                        <th>Obra</th>
                        <th>Importe</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map(gasto => (
                        <tr key={gasto.id}>
                          <td>#{gasto.id}</td>
                          <td>{new Date(gasto.fecha_gasto).toLocaleDateString()}</td>
                          <td>{gasto.usuario_nombre} {gasto.usuario_apellidos}</td>
                          <td>
                            <span className="tipo-badge">
                              {gasto.tipo_gasto === 'dieta' ? '🍽️' :
                               gasto.tipo_gasto === 'aparcamiento' ? '🅿️' :
                               gasto.tipo_gasto === 'gasolina' ? '⛽' : '📎'}
                              {' '}{gasto.tipo_gasto}
                            </span>
                          </td>
                          <td>{gasto.descripcion}</td>
                          <td>{gasto.obra || '-'}</td>
                          <td className="amount">{parseFloat(gasto.importe).toFixed(2)}€</td>
                          <td>
                            <span className={`estado-badge estado-${gasto.estado}`}>
                              {gasto.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportesPage;
