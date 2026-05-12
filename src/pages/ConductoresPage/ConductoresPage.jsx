/**
 * ConductoresPage.jsx
 * 
 * Página de Gestión de Conductores — SafeRide Admin Panel
 * Sincronizada con la estructura exacta de Dashboard.jsx para heredar estilos.
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
import driverService from '../../services/driverService';
import '../DashboardAdmin/Dashboard.css';
import './ConductoresPage.css';
import IconSafeRide from '../../imgs/IconSafeRide.png';
import DefaultImageUser from '../../imgs/DefaultImageUser.png';

// ─────────────────────────────────────────────────────────────
const getDefaultImagen = (url) => (url && url.trim() !== '') ? url : DefaultImageUser;

// ─────────────────────────────────────────────────────────────
// COMPONENTE: Tarjeta de Conductor
// ─────────────────────────────────────────────────────────────
const DriverCard = ({ driver }) => {
  const statusClass = {
    'online':   'status-green',
    'on-trip':  'status-blue',
    'offline':  'status-gray',
  }[driver.status?.toLowerCase().replace(' ', '-')] || 'status-gray';

  return (
    <div className="conductor-card">
      <div className="conductor-card-header">
        <div className="conductor-avatar-group">
          <img
            src={getDefaultImagen(driver.profileImage)}
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
        <span className={`status-badge ${statusClass}`}>
          {driver.status || 'Offline'}
        </span>
      </div>

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

      <div className="conductor-actions">
        <button className="conductor-btn-secondary">Ver Perfil</button>
        <button className="conductor-btn-primary">Editar</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL: ConductoresPage
// ─────────────────────────────────────────────────────────────
const ConductoresPage = () => {
  const { user, logout, cerrarSesion } = useAuth();
  const location = useLocation();

  const [drivers, setDrivers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearch]   = useState('');
  const [stats, setStats] = useState({
    total:     0,
    activeNow: 0,
    avgRating: 0,
    onTrip:    0,
  });

  useEffect(() => { loadDrivers(); }, []);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const response = await driverService.getAllDrivers({ search: searchTerm });
      if (response?.success && Array.isArray(response.data)) {
        setDrivers(response.data);
        computeStats(response.data);
      } else {
        setDrivers([]);
        setStats({ total: 0, activeNow: 0, avgRating: 0, onTrip: 0 });
      }
    } catch (err) {
      console.error('[ConductoresPage] Error al cargar conductores:', err);
    } finally {
      setLoading(false);
    }
  };

  const computeStats = (data) => {
    const active    = data.filter(d => d.status === 'online' || d.status === 'on-trip');
    const onTrip    = data.filter(d => d.status === 'on-trip');
    const avgRating = data.length > 0
      ? (data.reduce((s, d) => s + (d.rating || 0), 0) / data.length).toFixed(1)
      : '0.0';

    setStats({
      total:     data.length,
      activeNow: active.length,
      avgRating,
      onTrip:    onTrip.length,
    });
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') loadDrivers();
  };

  const handleCerrarSesion = logout || cerrarSesion;

  return (
    <div className="dashboardContent">

      {/* --- SIDEBAR --- */}
      <aside>
        <div className="sidebaLogo">
          <img src={IconSafeRide} alt="Icono" className='IconSafeRide' />
          <span>RideAdmin</span>
        </div>

        <nav className="sidebarNav">
          <Link to="/inicio" className={`navItem ${location.pathname === '/inicio' ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> <span>Panel</span>
          </Link>
          <Link to="/usuarios" className={`navItem ${location.pathname === '/usuarios' ? 'active' : ''}`}>
            <Users size={20} /> <span>Usuarios</span><ChevronDown size={16} className="FlechaSidebar" />
          </Link>
          <Link to="/conductores" className={`navItem ${location.pathname === '/conductores' ? 'active' : ''}`}>
            <UserCheck size={20} /> <span>Conductores</span>
          </Link>
          <Link to="/vehiculos" className={`navItem ${location.pathname === '/vehiculos' ? 'active' : ''}`}>
            <Car size={20} /> <span>Vehículos</span>
          </Link>
          <Link to="/reservas" className={`navItem ${location.pathname === '/reservas' ? 'active' : ''}`}>
            <Calendar size={20} /> <span>Reservas</span><ChevronDown size={16} className="FlechaSidebar" />
          </Link>
          <Link to="/pagos" className={`navItem ${location.pathname === '/pagos' ? 'active' : ''}`}>
            <CreditCard size={20} /> <span>Pagos</span>
          </Link>
          <Link to="/notificaciones" className={`navItem ${location.pathname === '/notificaciones' ? 'active' : ''}`}>
            <Bell size={20} /> <span>Notificaciones</span>
          </Link>
          <Link to="/quejas" className={`navItem ${location.pathname === '/quejas' ? 'active' : ''}`}>
            <AlertCircle size={20} /> <span>Quejas</span>
          </Link>
          <Link to="/auditoria" className={`navItem ${location.pathname === '/auditoria' ? 'active' : ''}`}>
            <ShieldCheck size={20} /> <span>Auditoría</span>
          </Link>
          <Link to="/configuracion" className={`navItem ${location.pathname === '/configuracion' ? 'active' : ''}`}>
            <Settings size={20} /> <span>Configuración</span>
          </Link>
        </nav>

        <div className="sidebarPerfil">
          <img src={getDefaultImagen(user?.profileImage)} alt="Admin" className="FotoPerfil" />
          <div className="PerfilInfo">
            <span className="NombrePerfil">{user?.name || 'Admin'}</span>
            <span className="RolPerfil">Super Administrador</span>
          </div>
          <ChevronDown size={16} className="FlechaPerfil" onClick={handleCerrarSesion} style={{cursor: 'pointer'}} />
        </div>
      </aside>

      {/* --- MAIN --- */}
      <main>
        <header>
          <div className="headerIzquierdo">
            <div className="buscadorContainer">
              <Search size={18} className="buscadorIcono" />
              <input
                type="text"
                placeholder="Buscar conductores por nombre, placa..."
                value={searchTerm}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>
          
          <div className="headerDerecho">
            <div className='userInfo'>
              <span>Bienvenido/a, {user?.name || 'Admin'}</span>
              <ChevronDown size={16} />
            </div>
            <div className="notificacionCampana">
              <Bell size={20} />
              <span className="notificacionBadge">5</span>
            </div>
            <div className="userInfo">
              <img src={getDefaultImagen(user?.profileImage)} alt="Admin" />
            </div>
            <Menu size={22} className="IconMenu" />
          </div>
        </header>

        <div className="dashboardBody">
          <div id="encabezadoPagina" className="page-header">
            <div>
              <h1>Gestión de Conductores</h1>
              <p>Gestiona y monitorea el rendimiento y disponibilidad de la flota</p>
            </div>
            <button className="conductores-btn-registrar">
              <Plus size={18} /> Registrar Conductor
            </button>
          </div>

          <div className="graficosGrid">
            <div className="tarjetaEstadistica">
              <div className="estadisticaHeader">
                <div className="estadisticaIcono color-purple"><Users size={20} /></div>
                <div className="estadisticaValor">{loading ? '—' : stats.total}</div>
              </div>
              <div className="estadisticaTitulo">Total Conductores</div>
              <div className="estadisticaFooter">
                <span className="estadisticaCambio positive"><ArrowUpRight size={14} /> 12.5%</span>
                <span className="estadisticaSubtitulo">vs mes anterior</span>
              </div>
            </div>

            <div className="tarjetaEstadistica">
              <div className="estadisticaHeader">
                <div className="estadisticaIcono color-green"><Zap size={20} /></div>
                <div className="estadisticaValor">{loading ? '—' : stats.activeNow}</div>
              </div>
              <div className="estadisticaTitulo">Activos Ahora</div>
              <div className="estadisticaFooter">
                <span className="estadisticaSubtitulo">Monitoreo en vivo</span>
              </div>
            </div>

            <div className="tarjetaEstadistica">
              <div className="estadisticaHeader">
                <div className="estadisticaIcono color-yellow"><Star size={20} /></div>
                <div className="estadisticaValor">{loading ? '—' : stats.avgRating}</div>
              </div>
              <div className="estadisticaTitulo">Rating Promedio</div>
              <div className="estadisticaFooter">
                <span className="estadisticaSubtitulo">Todas las valoraciones</span>
              </div>
            </div>
          </div>

          <div id="gridConductores">
            {loading ? (
              <div className="loading-state-dashboard">
                <div className="spinner-dashboard" />
                <p>Cargando conductores...</p>
              </div>
            ) : drivers.length > 0 ? (
              <div className="conductores-grid">
                {drivers.map(driver => (
                  <DriverCard key={driver._id} driver={driver} />
                ))}
                <div className="conductor-add-card">
                  <div className="conductor-add-icon">
                    <UserCheck size={32} />
                  </div>
                  <h3>Registrar Conductor</h3>
                  <p>Incorporar un nuevo miembro a la flota</p>
                </div>
              </div>
            ) : (
              <div className="conductores-grid">
                <div className="empty-state-dashboard">
                  <Truck size={40} />
                  <h3>No hay conductores registrados</h3>
                  <p>Conecta el backend o registra el primer conductor para comenzar.</p>
                </div>
                <div className="conductor-add-card">
                  <div className="conductor-add-icon">
                    <UserCheck size={32} />
                  </div>
                  <h3>Registrar Conductor</h3>
                  <p>Incorporar un nuevo miembro a la flota</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConductoresPage;
