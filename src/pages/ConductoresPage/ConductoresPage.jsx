/**
 * ConductoresPage.jsx
 * 
 * Página de Gestión de Conductores — SafeRide Admin Panel
 * 
 * Arquitectura alineada con Dashboard.jsx:
 * - Sidebar con Link (react-router-dom) para navegación real
 * - lucide-react para iconografía (igual que el dashboard)
 * - useAuth para datos del usuario autenticado
 * - Patrón service async listo para conectar backend
 * 
 * @author SafeRide Dev Team
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, Car, Calendar, CreditCard,
  Bell, AlertCircle, ShieldCheck, Settings, Search, Menu,
  ChevronDown, Plus, Truck, Star, Zap, MapPin, Clock,
  Award, ArrowUpRight, ArrowDownRight, MoreVertical
} from 'lucide-react';
import '../DashboardAdmin/Dashboard.css';
import './ConductoresPage.css';

// ─────────────────────────────────────────────────────────────
// COMPONENTE: Tarjeta de Estadística
// Reutilizable, aislado de responsabilidades de datos
// ─────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, trend, trendUp }) => (
  <div className="conductores-stat-card">
    <div className="conductores-stat-header">
      <div className="conductores-stat-icon">{icon}</div>
      <div className="conductores-stat-value">{value}</div>
    </div>
    <div className="conductores-stat-label">{label}</div>
    {trend && (
      <div className={`conductores-stat-trend ${trendUp ? 'up' : 'neutral'}`}>
        {trendUp ? <ArrowUpRight size={13} /> : null}
        <span>{trend}</span>
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
// COMPONENTE: Tarjeta de Conductor
// Recibe el objeto driver del backend normalizado
// ─────────────────────────────────────────────────────────────
const DriverCard = ({ driver }) => {
  // Mapeo de status a clase CSS para el badge
  const statusClass = {
    'online':   'badge-online',
    'on-trip':  'badge-on-trip',
    'offline':  'badge-offline',
  }[driver.status?.toLowerCase().replace(' ', '-')] || 'badge-offline';

  return (
    <div className="conductor-card">
      {/* Header: avatar + nombre + badge */}
      <div className="conductor-card-header">
        <div className="conductor-avatar-group">
          <img
            src={driver.profileImage || `https://i.pravatar.cc/150?u=${driver._id}`}
            alt={driver.name}
            className="conductor-avatar"
          />
          <div className="conductor-name-group">
            <h3 className="conductor-name">{driver.name}</h3>
            <div className="conductor-rating">
              {[1,2,3,4,5].map(i => (
                <Star
                  key={i}
                  size={12}
                  className={i <= Math.round(driver.rating || 0) ? 'star-filled' : 'star-empty'}
                />
              ))}
              <span>({(driver.rating || 0).toFixed(1)})</span>
            </div>
          </div>
        </div>
        <span className={`conductor-badge ${statusClass}`}>
          {driver.status || 'Offline'}
        </span>
      </div>

      {/* Detalles del vehículo y turno */}
      <div className="conductor-details">
        {driver.vehicle && (
          <div className="conductor-detail-row">
            <Truck size={15} />
            <span>{driver.vehicle.brand} {driver.vehicle.model} · {driver.vehicle.plate}</span>
          </div>
        )}
        {driver.work_schedule && (
          <div className="conductor-detail-row">
            <Clock size={15} />
            <span>Horario: {driver.work_schedule}</span>
          </div>
        )}
        {driver.currentLocation && (
          <div className="conductor-detail-row">
            <MapPin size={15} />
            <span>En ruta activa</span>
          </div>
        )}
        {driver.company && (
          <div className="conductor-detail-row">
            <Award size={15} />
            <span>{driver.company}</span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="conductor-actions">
        <button className="conductor-btn-secondary">Ver Perfil</button>
        <button className="conductor-btn-primary">Editar</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE: Empty State
// ─────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }) => (
  <div className="conductores-empty">
    <div className="conductores-empty-icon">
      <Truck size={40} />
    </div>
    <h3>No hay conductores registrados</h3>
    <p>Conecta el backend o registra el primer conductor para comenzar.</p>
    <button className="conductores-empty-btn" onClick={onAdd}>
      <Plus size={16} /> Registrar Conductor
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────
// COMPONENTE: Add Driver Card (dashed border)
// ─────────────────────────────────────────────────────────────
const AddDriverCard = ({ onClick }) => (
  <div className="conductor-add-card" onClick={onClick} role="button" tabIndex={0}>
    <div className="conductor-add-icon">
      <UserCheck size={32} />
    </div>
    <h3>Registrar Conductor</h3>
    <p>Incorporar un nuevo conductor a la flota</p>
  </div>
);

// ─────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL: ConductoresPage
// ─────────────────────────────────────────────────────────────
const ConductoresPage = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // ── Estado principal ──────────────────────────────────────
  const [drivers, setDrivers]     = useState([]);    // Lista de conductores
  const [loading, setLoading]     = useState(true);  // Estado de carga
  const [searchTerm, setSearch]   = useState('');    // Término de búsqueda

  // Estadísticas derivadas del backend
  const [stats, setStats] = useState({
    total:     0,
    activeNow: 0,
    avgRating: 0,
    onTrip:    0,
  });

  // ── Carga inicial ─────────────────────────────────────────
  useEffect(() => {
    loadDrivers();
  }, []);

  /**
   * loadDrivers
   * Lógica de fetching preparada para conectar con driverService.
   * 
   * Reemplazar el bloque de comentario con:
   *   const response = await driverService.getAllDrivers({ type: 'conductor' });
   *   if (response.success) {
   *     setDrivers(response.data);
   *     computeStats(response.data);
   *   }
   */
  const loadDrivers = async () => {
    setLoading(true);
    try {
      // ── CONECTAR BACKEND AQUÍ ──────────────────────────────
      // const response = await driverService.getAllDrivers({ type: 'conductor' });
      // if (response?.success && Array.isArray(response.data)) {
      //   setDrivers(response.data);
      //   computeStats(response.data);
      // }

      // Mientras tanto: estados vacíos reales
      setDrivers([]);
      setStats({ total: 0, activeNow: 0, avgRating: 0, onTrip: 0 });
    } catch (err) {
      console.error('[ConductoresPage] Error al cargar conductores:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * computeStats
   * Calcula las métricas del panel a partir de los datos del API.
   * Se llama automáticamente luego de cargar drivers.
   */
  const computeStats = (data) => {
    const active    = data.filter(d => d.status === 'online' || d.status === 'on-trip');
    const onTrip    = data.filter(d => d.status === 'on-trip');
    const avgRating = data.length > 0
      ? (data.reduce((s, d) => s + (d.rating || 0), 0) / data.length).toFixed(1)
      : 0;

    setStats({
      total:     data.length,
      activeNow: active.length,
      avgRating,
      onTrip:    onTrip.length,
    });
  };

  /**
   * handleSearch
   * Dispara búsqueda al presionar Enter.
   * Preparado para conectar con searchDrivers(term).
   */
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      // driverService.searchDrivers(searchTerm).then(...)
      loadDrivers();
    }
  };

  // ── Helper: clase activa del sidebar ─────────────────────
  const navActive = (path) =>
    location.pathname.toLowerCase() === path.toLowerCase() ? 'active' : '';

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div id="disenoConductores" className="dashboard-layout">

      {/* ════════════════════════════════════════
          SIDEBAR — Idéntico al Dashboard.jsx
          ════════════════════════════════════════ */}
      <aside id="barraLateralConductores" className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <span>RideAdmin</span>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav">
          <Link to="/Inicio"         className={`nav-item ${navActive('/Inicio')}`}>
            <LayoutDashboard size={20} /><span>Dashboard</span>
          </Link>
          <Link to="/Usuarios"       className={`nav-item ${navActive('/Usuarios')}`}>
            <Users size={20} /><span>Usuarios</span><ChevronDown size={16} className="ml-auto" />
          </Link>
          <Link to="/Conductores"    className={`nav-item ${navActive('/Conductores')}`}>
            <UserCheck size={20} /><span>Conductores</span>
          </Link>
          <Link to="/Vehiculos"      className={`nav-item ${navActive('/Vehiculos')}`}>
            <Car size={20} /><span>Vehículos</span>
          </Link>
          <Link to="/Reservas"       className={`nav-item ${navActive('/Reservas')}`}>
            <Calendar size={20} /><span>Reservas</span><ChevronDown size={16} className="ml-auto" />
          </Link>
          <Link to="/Pagos"          className={`nav-item ${navActive('/Pagos')}`}>
            <CreditCard size={20} /><span>Pagos</span>
          </Link>
          <Link to="/Notificaciones" className={`nav-item ${navActive('/Notificaciones')}`}>
            <Bell size={20} /><span>Notificaciones</span>
          </Link>
          <Link to="/Quejas"         className={`nav-item ${navActive('/Quejas')}`}>
            <AlertCircle size={20} /><span>Quejas</span>
          </Link>
          <Link to="/Auditoria"      className={`nav-item ${navActive('/Auditoria')}`}>
            <ShieldCheck size={20} /><span>Auditoría</span>
          </Link>
          <Link to="/Configuracion"  className={`nav-item ${navActive('/Configuracion')}`}>
            <Settings size={20} /><span>Configuración</span>
          </Link>
        </nav>

        {/* Perfil Admin */}
        <div className="sidebar-profile">
          <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="profile-img" />
          <div className="profile-info">
            <span className="profile-name">{user?.name || 'Admin'}</span>
            <span className="profile-role">Super Administrador</span>
          </div>
          <ChevronDown size={16} className="profile-chevron" onClick={logout} title="Cerrar sesión" />
        </div>
      </aside>

      {/* ════════════════════════════════════════
          MAIN CONTENT
          ════════════════════════════════════════ */}
      <main id="contenidoConductores" className="main-content">

        {/* ── TOPBAR ── */}
        <header id="topbarConductores" className="top-header">
          <div className="header-left">
            <Menu size={24} className="menu-trigger" />
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar conductores por nombre, placa..."
                value={searchTerm}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
              />
              <span className="search-kbd">⏎</span>
            </div>
          </div>
          <div className="header-right">
            <div className="notification-wrapper">
              <Bell size={20} />
              <span className="notification-badge">5</span>
            </div>
            <div className="user-dropdown">
              <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
              <span>{user?.name || 'Admin'}</span>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        {/* ── BODY ── */}
        <div id="cuerpoDesplazableConductores" className="dashboard-scrollable">

          {/* Page Header */}
          <div id="encabezadoConductores" className="page-header">
            <div>
              <h1>Conductores</h1>
              <p>Gestiona y monitorea el rendimiento y disponibilidad de la flota</p>
            </div>
            <button className="conductores-btn-registrar">
              <Plus size={18} /> Registrar Conductor
            </button>
          </div>

          {/* ── STATS GRID ── */}
          <div id="estadisticasConductores" className="conductores-stats-grid">
            <StatCard
              icon={<Users size={20} className="color-purple" />}
              label="Total Conductores"
              value={loading ? '—' : stats.total.toLocaleString()}
              trend="12.5% vs mes anterior"
              trendUp
            />
            <StatCard
              icon={<Zap size={20} className="color-green" />}
              label="Activos Ahora"
              value={loading ? '—' : stats.activeNow.toLocaleString()}
              trend="Monitoreo en vivo"
            />
            <StatCard
              icon={<Star size={20} className="color-yellow" />}
              label="Rating Promedio"
              value={loading ? '—' : stats.avgRating}
              trend="Todas las valoraciones"
            />
            <StatCard
              icon={<Truck size={20} className="color-blue" />}
              label="En Viaje"
              value={loading ? '—' : stats.onTrip.toLocaleString()}
              trend="Ocupación de flota"
            />
          </div>

          {/* ── DRIVERS GRID ── */}
          <div id="gridConductores">
            {loading ? (
              <div className="conductores-loading">
                <div className="conductores-spinner" />
                <p>Cargando conductores...</p>
              </div>
            ) : drivers.length > 0 ? (
              <div className="conductores-grid">
                {drivers.map(driver => (
                  <DriverCard key={driver._id} driver={driver} />
                ))}
                {/* Card para agregar nuevo conductor */}
                <AddDriverCard />
              </div>
            ) : (
              /* ── EMPTY STATE ── */
              <div className="conductores-grid">
                <EmptyState onAdd={() => {}} />
                <AddDriverCard />
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default ConductoresPage;
