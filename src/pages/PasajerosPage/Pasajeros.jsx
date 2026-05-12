/**
 * Pasajeros.jsx
 *
 * Página de Gestión de Pasajeros — SafeRide Admin Panel
 * Sigue la misma arquitectura que Dashboard.jsx y ConductoresPage.jsx.
 *
 * @author SafeRide Dev Team
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, Car, Calendar, CreditCard,
  Bell, AlertCircle, ShieldCheck, Settings, Search, Menu,
  ChevronDown, Plus, Mail, Phone, Briefcase, Clock,
  TrendingUp, Activity, Star, Eye, Edit, Trash2
} from 'lucide-react';
import passengerService from '../../services/passengerService';
import '../DashboardAdmin/Dashboard.css';
import './Pasajeros.css';

// ─────────────────────────────────────────────────────────────
// Imagen por defecto usando DiceBear (no depende de avatar externo)
// ─────────────────────────────────────────────────────────────
const getDefaultImage = (url, name) =>
  url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'U')}`;

// ─────────────────────────────────────────────────────────────
// COMPONENTE: Tarjeta de Pasajero
// ─────────────────────────────────────────────────────────────
const PassengerCard = ({ passenger }) => (
  <div className="passenger-card-v2">
    <div className="p-card-header">
      <div className="p-user-info">
        <img
          src={getDefaultImage(passenger.profileImage, passenger.name)}
          alt={passenger.name}
          className="p-avatar"
        />
        <div className="p-name-info">
          <h3>{passenger.name}</h3>
          <span className="p-company">
            <Briefcase size={13} /> {passenger.company || 'Particular'}
          </span>
        </div>
      </div>
      <span className={`p-badge ${passenger.isActive ? 'bg-green' : 'bg-red'}`}>
        {passenger.isActive ? 'Activo' : 'Inactivo'}
      </span>
    </div>

    <div className="p-card-body">
      <div className="p-detail"><Mail size={15} /><span>{passenger.email}</span></div>
      <div className="p-detail"><Phone size={15} /><span>{passenger.phone || 'Sin teléfono'}</span></div>
      <div className="p-detail"><Clock size={15} /><span>{passenger.work_schedule || 'Sin horario'}</span></div>
    </div>

    <div className="p-card-footer">
      <div className="p-rating">
        <Star size={14} className="star-filled" />
        <span>{(passenger.rating || 5).toFixed(1)}</span>
      </div>
      <div className="p-actions">
        <button title="Ver detalles"><Eye size={17} /></button>
        <button title="Editar"><Edit size={17} /></button>
        <button title="Eliminar" className="btn-delete"><Trash2 size={17} /></button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL: PasajerosPage
// ─────────────────────────────────────────────────────────────
const PasajerosPage = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearch]     = useState('');
  const [stats, setStats]           = useState({
    total: 0, active: 0, avgRating: 0, totalRides: 0
  });

  useEffect(() => { loadPassengers(); }, []);

  /**
   * Carga los pasajeros desde el backend.
   * Conectar con: passengerService.getAllPassengers({ search: searchTerm })
   */
  const loadPassengers = async () => {
    setLoading(true);
    try {
      const response = await passengerService.getAllPassengers({ search: searchTerm });
      if (response?.success && Array.isArray(response.data)) {
        setPassengers(response.data);
        const active     = response.data.filter(p => p.isActive).length;
        const totalRating = response.data.reduce((a, p) => a + (p.rating || 0), 0);
        setStats({
          total:      response.pagination?.total || response.data.length,
          active,
          avgRating:  response.data.length > 0
            ? (totalRating / response.data.length).toFixed(1)
            : '5.0',
          totalRides: response.data.length * 15,
        });
      } else {
        setPassengers([]);
      }
    } catch (err) {
      console.error('[PasajerosPage] Error al cargar pasajeros:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') loadPassengers();
  };

  const navActive = (path) =>
    location.pathname.toLowerCase() === path.toLowerCase() ? 'active' : '';

  return (
    <div id="disenoPasajeros" className="dashboard-layout">

      {/* ═══ SIDEBAR ═══ */}
      <aside id="barraLateralPasajeros" className="sidebar">
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

        <div className="sidebar-profile">
          <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="profile-img" />
          <div className="profile-info">
            <span className="profile-name">{user?.name || 'Admin'}</span>
            <span className="profile-role">Super Administrador</span>
          </div>
          <ChevronDown size={16} className="profile-chevron" onClick={logout} title="Cerrar sesión" />
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <main id="contenidoPasajeros" className="main-content">

        {/* Topbar */}
        <header id="topbarPasajeros" className="top-header">
          <div className="header-left">
            <Menu size={24} className="menu-trigger" />
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar pasajeros..."
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
              <span className="notification-badge">3</span>
            </div>
            <div className="user-dropdown">
              <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
              <span>{user?.name || 'Admin'}</span>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        {/* Body */}
        <div id="cuerpoDesplazablePasajeros" className="dashboard-scrollable">

          {/* Page Header */}
          <div id="encabezadoPasajeros" className="page-header">
            <div>
              <h1>Pasajeros</h1>
              <p>Supervisa y administra los usuarios registrados en la plataforma</p>
            </div>
            <button className="btn-add-passenger">
              <Plus size={18} /> Nuevo Pasajero
            </button>
          </div>

          {/* Stats */}
          <div id="estadisticasPasajeros" className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper color-blue"><Users size={20} /></div>
                <div className="stat-value">{loading ? '—' : stats.total}</div>
              </div>
              <div className="stat-title">Total Pasajeros</div>
              <div className="stat-footer">
                <span className="stat-change positive"><TrendingUp size={13} /> 12%</span>
                <span className="stat-subtitle">vs mes anterior</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper color-green"><Activity size={20} /></div>
                <div className="stat-value">{loading ? '—' : stats.active}</div>
              </div>
              <div className="stat-title">Activos ahora</div>
              <div className="stat-footer">
                <span className="stat-subtitle">En línea actualmente</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper color-yellow"><Star size={20} /></div>
                <div className="stat-value">{loading ? '—' : stats.avgRating}</div>
              </div>
              <div className="stat-title">Rating Promedio</div>
              <div className="stat-footer">
                <span className="stat-subtitle">Basado en reseñas</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper color-purple"><Calendar size={20} /></div>
                <div className="stat-value">{loading ? '—' : stats.totalRides}</div>
              </div>
              <div className="stat-title">Viajes Realizados</div>
              <div className="stat-footer">
                <span className="stat-subtitle">Histórico total</span>
              </div>
            </div>
          </div>

          {/* Grid de Pasajeros */}
          <div id="gridPasajeros" className="passengers-section">
            {loading ? (
              <div className="loading-state">
                <div className="conductores-spinner" />
                <p>Cargando pasajeros...</p>
              </div>
            ) : passengers.length > 0 ? (
              <div className="passengers-list-grid">
                {passengers.map(p => <PassengerCard key={p._id} passenger={p} />)}
              </div>
            ) : (
              <div className="empty-state">
                <Users size={48} />
                <h3>No se encontraron pasajeros</h3>
                <p>Conecta el backend o prueba con otro término de búsqueda.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default PasajerosPage;