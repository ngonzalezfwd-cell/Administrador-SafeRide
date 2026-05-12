/**
 * ConductoresPage.jsx
 * 
 * Página de Gestión de Conductores — SafeRide Admin Panel
 * Sincronizada con la estructura exacta de Pasajeros.jsx para heredar estilos.
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
  Award, Activity, Eye, Edit, Trash2
} from 'lucide-react';
import driverService from '../../services/driverService';
import DriverProfileModal from '../../components/DriverProfileModal';

import '../DashboardAdmin/Dashboard.css';
import './ConductoresPage.css';
import '../PasajerosPage/Pasajeros.css';
import IconSafeRide from '../../imgs/IconSafeRide.png';
import DefaultImageUser from '../../imgs/DefaultImageUser.png';

// ─────────────────────────────────────────────────────────────
const getDefaultImagen = (url) => (url && url.trim() !== '') ? url : DefaultImageUser;

// ─────────────────────────────────────────────────────────────
// COMPONENTE: Tarjeta de Conductor
// ─────────────────────────────────────────────────────────────
const DriverCard = ({ driver, onEdit, onDelete }) => {
  const statusClass = driver.isActive ? 'bg-green' : 'bg-red';
  const statusLabel = driver.isActive ? 'Activo' : 'Inactivo';

  return (
    <div className="passenger-card-v2">
      <div className="p-card-header">
        <div className="p-user-info">
          <img
            src={getDefaultImagen(driver.profileImage)}
            alt={driver.name}
            className="p-avatar"
          />
          <div className="p-name-info">
            <h3>{driver.name}</h3>
            <span className="p-company">
              <Award size={13} /> {driver.company || 'Independiente'}
            </span>
          </div>
        </div>
        <span className={`p-badge ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      <div className="p-card-body">
        {driver.vehicle && (
          <div className="p-detail">
            <Truck size={15} />
            <span>{driver.vehicle.brand} {driver.vehicle.model} · {driver.vehicle.license_plate}</span>
          </div>
        )}
        {driver.work_schedule && (
          <div className="p-detail">
            <Clock size={15} />
            <span>Horario: {driver.work_schedule}</span>
          </div>
        )}
      </div>

      <div className="p-card-footer">
        <div className="p-rating">
          <Star size={14} className="star-filled" />
          <span>{(driver.rating || 0).toFixed(1)}</span>
        </div>
        <div className="p-actions">
          <button title="Editar" onClick={() => onEdit(driver)}><Edit size={17} /></button>
          <button title="Eliminar" className="btn-delete" onClick={() => onDelete(driver)}><Trash2 size={17} /></button>
        </div>
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

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearch] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    activeNow: 0,
    avgRating: 0,
    onTrip: 0,
  });

  useEffect(() => { loadDrivers(); }, []);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const response = await driverService.getAllDrivers({ search: searchTerm });
      if (response?.success && Array.isArray(response.data)) {
        // Mostramos todos, pero podríamos filtrar si quisiéramos
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
    const active = data.filter(d => d.isActive);
    const avgRating = data.length > 0
      ? (data.reduce((s, d) => s + (d.rating || 0), 0) / data.length).toFixed(1)
      : '0.0';

    setStats({
      total: data.length,
      activeNow: active.length,
      avgRating,
      onTrip: 0,
    });
  };

  const handleOpenModal = (driver = null) => {
    setSelectedDriver(driver);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDriver(null);
  };

  const handleSaved = () => {
    loadDrivers();
  };

  const handleDelete = async (driver) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${driver.name}?`)) {
        try {
            await driverService.deleteDriver(driver._id);
            alert('Conductor y su vehículo eliminados permanentemente.');
            loadDrivers();
        } catch (err) {
            console.error('Error deleting driver:', err);
            alert('No se pudo eliminar al conductor.');
        }
    }
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
          <ChevronDown size={16} className="FlechaPerfil" onClick={handleCerrarSesion} style={{ cursor: 'pointer' }} />
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
                placeholder="Buscar conductores..."
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
            <button className="btn-add-passenger" onClick={() => handleOpenModal(null)}>
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
                <span className="estadisticaSubtitulo">Conductores registrados</span>
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

          <div id="gridConductores" className="passengers-section">
            {loading ? (
              <div className="loading-state-dashboard">
                <div className="spinner-dashboard" />
                <p>Cargando conductores...</p>
              </div>
            ) : drivers.length > 0 ? (
              <div className="passengers-list-grid">
                {drivers.map(driver => (
                  <DriverCard 
                    key={driver._id} 
                    driver={driver} 
                    onEdit={handleOpenModal} 
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state-dashboard">
                <Truck size={48} />
                <h3>No se encontraron conductores</h3>
                <p>Conecta el backend o registra el primer conductor para comenzar.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <DriverProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        driver={selectedDriver}
        onSaved={handleSaved}
      />
    </div>
  );
};

export default ConductoresPage;
