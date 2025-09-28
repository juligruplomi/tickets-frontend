import React, { useState, useEffect } from 'react';
import './ReportesPage.css';

function ReportesPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    dashboard: {
      metricas_principales: {
        total_gastos: 1247,
        total_importe: 45670.85,
        gastos_mes_actual: 183,
        importe_mes_actual: 8542.30,
        pendientes_aprobacion: 24,
        aprobados_mes: 159,
        rechazados_mes: 8,
        promedio_gasto: 149.73
      },
      gastos_por_categoria: {
        dietas: { count: 342, total: 15420.50, porcentaje: 33.8 },
        combustible: { count: 298, total: 12850.25, porcentaje: 28.1 },
        alojamiento: { count: 156, total: 9875.40, porcentaje: 21.6 },
        transporte: { count: 201, total: 4320.80, porcentaje: 9.5 },
        material_oficina: { count: 89, total: 1890.45, porcentaje: 4.1 },
        formacion: { count: 45, total: 1313.45, porcentaje: 2.9 }
      },
      gastos_por_mes: [
        { mes: 'Ene', gastos: 98, importe: 4520.30 },
        { mes: 'Feb', gastos: 112, importe: 5890.75 },
        { mes: 'Mar', gastos: 134, importe: 6750.20 },
        { mes: 'Abr', gastos: 156, importe: 7320.15 },
        { mes: 'May', gastos: 143, importe: 6890.45 },
        { mes: 'Jun', gastos: 167, importe: 8542.30 }
      ],
      top_usuarios: [
        { nombre: 'Carlos Ruiz', gastos: 45, total: 2890.50, departamento: 'Ventas' },
        { nombre: 'Ana García', gastos: 38, total: 2650.75, departamento: 'Marketing' },
        { nombre: 'Luis Martín', gastos: 42, total: 2420.30, departamento: 'Operaciones' },
        { nombre: 'Elena Torres', gastos: 35, total: 2180.95, departamento: 'RRHH' },
        { nombre: 'Miguel Santos', gastos: 33, total: 1950.40, departamento: 'IT' }
      ],
      alertas: [
        { tipo: 'limite', mensaje: 'Categoría "Dietas" alcanzó el 85% del límite mensual', urgencia: 'media' },
        { tipo: 'pendiente', mensaje: '24 gastos pendientes de aprobación hace más de 5 días', urgencia: 'alta' },
        { tipo: 'presupuesto', mensaje: 'Departamento de Marketing superó el presupuesto en un 12%', urgencia: 'alta' }
      ]
    }
  });

  const [filtros, setFiltros] = useState({
    fecha_inicio: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0],
    categoria: 'todas',
    usuario: 'todos',
    departamento: 'todos',
    estado: 'todos'
  });

  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [exportandoExcel, setExportandoExcel] = useState(false);

  const exportarPDF = async () => {
    setExportandoPDF(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Exportando a PDF...');
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,Reporte%20de%20Gastos%20PDF%20-%20Generado%20el%20' + new Date().toLocaleDateString();
      link.download = `reporte_gastos_${Date.now()}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error exportando PDF:', error);
    } finally {
      setExportandoPDF(false);
    }
  };

  const exportarExcel = async () => {
    setExportandoExcel(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Exportando a Excel...');
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,Reporte%20de%20Gastos%20Excel%20-%20Generado%20el%20' + new Date().toLocaleDateString();
      link.download = `reporte_gastos_${Date.now()}.xlsx`;
      link.click();
    } catch (error) {
      console.error('Error exportando Excel:', error);
    } finally {
      setExportandoExcel(false);
    }
  };

  const aplicarFiltros = () => {
    setLoading(true);
    setTimeout(() => {
      console.log('Filtros aplicados:', filtros);
      setLoading(false);
    }, 1000);
  };

  const resetearFiltros = () => {
    setFiltros({
      fecha_inicio: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      fecha_fin: new Date().toISOString().split('T')[0],
      categoria: 'todas',
      usuario: 'todos',
      departamento: 'todos',
      estado: 'todos'
    });
  };

  return (
    <div className="reportes-page">
      <div className="reportes-header">
        <div className="header-content">
          <h1>📊 Reportes y Análisis</h1>
          <p>Sistema integral de reportes empresariales</p>
        </div>
        
        <div className="header-actions">
          <button 
            onClick={exportarPDF}
            disabled={exportandoPDF}
            className="btn btn-danger"
          >
            {exportandoPDF ? (
              <>🔄 Generando PDF...</>
            ) : (
              <>📄 Exportar PDF</>
            )}
          </button>
          
          <button 
            onClick={exportarExcel}
            disabled={exportandoExcel}
            className="btn btn-success"
          >
            {exportandoExcel ? (
              <>🔄 Generando Excel...</>
            ) : (
              <>📊 Exportar Excel</>
            )}
          </button>
        </div>
      </div>

      {/* Pestañas de reportes */}
      <div className="reportes-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('dashboard')}
        >
          📈 Dashboard
        </button>
        <button 
          className={activeTab === 'gastos' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('gastos')}
        >
          💰 Análisis de Gastos
        </button>
        <button 
          className={activeTab === 'usuarios' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('usuarios')}
        >
          👥 Por Usuario
        </button>
        <button 
          className={activeTab === 'departamentos' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('departamentos')}
        >
          🏢 Por Departamento
        </button>
        <button 
          className={activeTab === 'comparativas' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('comparativas')}
        >
          📊 Comparativas
        </button>
        <button 
          className={activeTab === 'programados' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('programados')}
        >
          ⏰ Reportes Programados
        </button>
      </div>

      {/* Filtros avanzados */}
      <div className="filtros-section">
        <h3>🔍 Filtros Avanzados</h3>
        <div className="filtros-grid">
          <div className="filtro-group">
            <label>Fecha Inicio:</label>
            <input
              type="date"
              value={filtros.fecha_inicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, fecha_inicio: e.target.value }))}
              className="form-control"
            />
          </div>
          
          <div className="filtro-group">
            <label>Fecha Fin:</label>
            <input
              type="date"
              value={filtros.fecha_fin}
              onChange={(e) => setFiltros(prev => ({ ...prev, fecha_fin: e.target.value }))}
              className="form-control"
            />
          </div>
          
          <div className="filtro-group">
            <label>Categoría:</label>
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
              className="form-control"
            >
              <option value="todas">Todas las categorías</option>
              <option value="dietas">🍽️ Dietas</option>
              <option value="combustible">⛽ Combustible</option>
              <option value="alojamiento">🏨 Alojamiento</option>
              <option value="transporte">🚗 Transporte</option>
              <option value="material_oficina">📝 Material de oficina</option>
              <option value="formacion">📚 Formación</option>
            </select>
          </div>
          
          <div className="filtro-group">
            <label>Estado:</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
              className="form-control"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">⏳ Pendiente</option>
              <option value="aprobado">✅ Aprobado</option>
              <option value="rechazado">❌ Rechazado</option>
              <option value="pagado">💳 Pagado</option>
            </select>
          </div>
          
          <div className="filtro-group">
            <label>Departamento:</label>
            <select
              value={filtros.departamento}
              onChange={(e) => setFiltros(prev => ({ ...prev, departamento: e.target.value }))}
              className="form-control"
            >
              <option value="todos">Todos los departamentos</option>
              <option value="ventas">Ventas</option>
              <option value="marketing">Marketing</option>
              <option value="operaciones">Operaciones</option>
              <option value="rrhh">RRHH</option>
              <option value="it">IT</option>
              <option value="finanzas">Finanzas</option>
            </select>
          </div>
        </div>
        
        <div className="filtros-actions">
          <button onClick={aplicarFiltros} className="btn btn-primary" disabled={loading}>
            {loading ? '🔄 Aplicando...' : '🔍 Aplicar Filtros'}
          </button>
          <button onClick={resetearFiltros} className="btn btn-secondary">
            🔄 Resetear
          </button>
        </div>
      </div>

      {/* Contenido de reportes */}
      <div className="reportes-content">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            
            {/* Alertas importantes */}
            <div className="alertas-section">
              <h3>🚨 Alertas Importantes</h3>
              <div className="alertas-grid">
                {reportData.dashboard.alertas.map((alerta, index) => (
                  <div key={index} className={`alerta-card ${alerta.urgencia}`}>
                    <div className="alerta-icon">
                      {alerta.tipo === 'limite' && '⚠️'}
                      {alerta.tipo === 'pendiente' && '⏰'}
                      {alerta.tipo === 'presupuesto' && '📊'}
                    </div>
                    <div className="alerta-content">
                      <div className="alerta-tipo">{alerta.tipo.toUpperCase()}</div>
                      <div className="alerta-mensaje">{alerta.mensaje}</div>
                    </div>
                    <div className={`alerta-urgencia ${alerta.urgencia}`}>
                      {alerta.urgencia === 'alta' && '🔴'}
                      {alerta.urgencia === 'media' && '🟡'}
                      {alerta.urgencia === 'baja' && '🟢'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Métricas principales */}
            <div className="metricas-section">
              <h3>📈 Métricas Principales</h3>
              <div className="metricas-grid">
                <div className="metrica-card total">
                  <div className="metrica-icon">💰</div>
                  <div className="metrica-content">
                    <div className="metrica-valor">{reportData.dashboard.metricas_principales.total_importe.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                    <div className="metrica-label">Importe Total</div>
                    <div className="metrica-sublabel">{reportData.dashboard.metricas_principales.total_gastos} gastos</div>
                  </div>
                </div>
                
                <div className="metrica-card mes-actual">
                  <div className="metrica-icon">📅</div>
                  <div className="metrica-content">
                    <div className="metrica-valor">{reportData.dashboard.metricas_principales.importe_mes_actual.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                    <div className="metrica-label">Este Mes</div>
                    <div className="metrica-sublabel">{reportData.dashboard.metricas_principales.gastos_mes_actual} gastos</div>
                  </div>
                </div>
                
                <div className="metrica-card pendientes">
                  <div className="metrica-icon">⏳</div>
                  <div className="metrica-content">
                    <div className="metrica-valor">{reportData.dashboard.metricas_principales.pendientes_aprobacion}</div>
                    <div className="metrica-label">Pendientes</div>
                    <div className="metrica-sublabel">de aprobación</div>
                  </div>
                </div>
                
                <div className="metrica-card aprobados">
                  <div className="metrica-icon">✅</div>
                  <div className="metrica-content">
                    <div className="metrica-valor">{reportData.dashboard.metricas_principales.aprobados_mes}</div>
                    <div className="metrica-label">Aprobados</div>
                    <div className="metrica-sublabel">este mes</div>
                  </div>
                </div>
                
                <div className="metrica-card promedio">
                  <div className="metrica-icon">📊</div>
                  <div className="metrica-content">
                    <div className="metrica-valor">{reportData.dashboard.metricas_principales.promedio_gasto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                    <div className="metrica-label">Promedio</div>
                    <div className="metrica-sublabel">por gasto</div>
                  </div>
                </div>
                
                <div className="metrica-card rechazados">
                  <div className="metrica-icon">❌</div>
                  <div className="metrica-content">
                    <div className="metrica-valor">{reportData.dashboard.metricas_principales.rechazados_mes}</div>
                    <div className="metrica-label">Rechazados</div>
                    <div className="metrica-sublabel">este mes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos y análisis */}
            <div className="graficos-section">
              <div className="graficos-grid">
                
                {/* Gastos por categoría */}
                <div className="grafico-card">
                  <h4>🍽️ Gastos por Categoría</h4>
                  <div className="categorias-chart">
                    {Object.entries(reportData.dashboard.gastos_por_categoria).map(([categoria, data]) => (
                      <div key={categoria} className="categoria-item">
                        <div className="categoria-header">
                          <span className="categoria-nombre">
                            {categoria === 'dietas' && '🍽️ Dietas'}
                            {categoria === 'combustible' && '⛽ Combustible'}
                            {categoria === 'alojamiento' && '🏨 Alojamiento'}
                            {categoria === 'transporte' && '🚗 Transporte'}
                            {categoria === 'material_oficina' && '📝 Material'}
                            {categoria === 'formacion' && '📚 Formación'}
                          </span>
                          <span className="categoria-porcentaje">{data.porcentaje}%</span>
                        </div>
                        <div className="categoria-barra">
                          <div 
                            className="categoria-progreso"
                            style={{ width: `${data.porcentaje}%` }}
                          ></div>
                        </div>
                        <div className="categoria-detalles">
                          <span>{data.count} gastos</span>
                          <span>{data.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evolución mensual */}
                <div className="grafico-card">
                  <h4>📈 Evolución Mensual</h4>
                  <div className="evolucion-chart">
                    <div className="chart-container">
                      {reportData.dashboard.gastos_por_mes.map((mes, index) => (
                        <div key={index} className="mes-barra">
                          <div 
                            className="barra"
                            style={{ 
                              height: `${(mes.importe / 10000) * 100}%`,
                              backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                            }}
                            title={`${mes.mes}: ${mes.importe.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`}
                          ></div>
                          <div className="mes-label">{mes.mes}</div>
                          <div className="mes-valor">{mes.importe.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top usuarios */}
            <div className="top-usuarios-section">
              <h3>🏆 Top Usuarios del Mes</h3>
              <div className="usuarios-ranking">
                {reportData.dashboard.top_usuarios.map((usuario, index) => (
                  <div key={index} className={`usuario-rank ${index < 3 ? 'top-three' : ''}`}>
                    <div className="rank-numero">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </div>
                    <div className="usuario-info">
                      <div className="usuario-nombre">{usuario.nombre}</div>
                      <div className="usuario-departamento">{usuario.departamento}</div>
                    </div>
                    <div className="usuario-stats">
                      <div className="usuario-gastos">{usuario.gastos} gastos</div>
                      <div className="usuario-total">{usuario.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Otras pestañas con contenido simplificado por espacio */}
        {activeTab !== 'dashboard' && (
          <div className="construccion">
            <h3>🚧 Pestaña en Construcción</h3>
            <p>Esta sección del sistema de reportes está siendo desarrollada.</p>
            <p><strong>Pestaña activa:</strong> {activeTab}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportesPage;