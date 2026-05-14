/**
 * Pasajeros.jsx
 *
 * Página de Gestión de Pasajeros — SafeRide Admin Panel
 * Sincronizada con la estructura exacta de ConductoresPage.jsx para heredar estilos y UX.
 *
 * @author SafeRide Dev Team
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, Car, Calendar, CreditCard,
  Bell, AlertCircle, ShieldCheck, Settings, Search, Menu,
  ChevronDown, Plus, Mail, Star, Activity, Clock,
  Eye, Edit, Trash2, CheckCircle, Briefcase, Phone,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import passengerService from '../../services/passengerService';
import Swal from 'sweetalert2';
import { toast, Toaster } from 'react-hot-toast';
import DriverProfileModal from '../../components/DriverProfileModal';

import '../DashboardPage/Dashboard.css';
import '../ConductoresPage/ConductoresPage.css';
import './Pasajeros.css';
import IconSafeRide from '../../imgs/IconSafeRide.png';
import DefaultImageUser from '../../imgs/DefaultImageUser.png';

// ─────────────────────────────────────────────────────────────
const getDefaultImagen = (url) => (url && url.trim() !== '') ? url : DefaultImageUser;

// ─────────────────────────────────────────────────────────────
// COMPONENTE: Tarjeta de Pasajero
// ─────────────────────────────────────────────────────────────
const PassengerCard = ({ passenger, onEdit, onDelete, onActivate, onView }) => {
  return (
    <div className="conductor-card">
      <div className="card-header">
        <img
          src={getDefaultImagen(passenger.profileImage)}
          alt={passenger.name}
          className="conductor-img"
        />
        <div className={`status-badge ${passenger.isActive ? 'active' : 'inactive'}`}>
          {passenger.isActive ? 'Activo' : 'Inactivo'}
        </div>
      </div>

      <div className="card-content">
        <h3 className="conductor-name">{passenger.name}</h3>
        <p className="conductor-role">
          <Mail size={13} style={{ marginRight: '6px' }} />
          {passenger.email}
        </p>
        
        <div className="vehicle-info-mini" style={{ marginTop: '12px' }}>
          <div className="info-item">
            <Phone size={14} />
            <span>{passenger.phone || 'Sin teléfono'}</span>
          </div>
          <div className="info-item">
            <Briefcase size={14} />
            <span>{passenger.company || 'Particular'}</span>
          </div>
        </div>
      </div>

      <div className="card-actions">
        {!passenger.isActive ? (
          <button 
            className="action-btn activate" 
            title="Activar" 
            onClick={() => onActivate(passenger)}
            style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.1)' }}
          >
            <CheckCircle size={18} />
          </button>
        ) : (
          <button className="action-btn view" title="Ver Historial de Viajes" onClick={() => onView(passenger)}>
            <Eye size={18} />
          </button>
        )}
        <button className="action-btn edit" title="Editar" onClick={() => onEdit(passenger)}>
          <Edit size={18} />
        </button>
        <button className="action-btn delete" title="Desactivar" onClick={() => onDelete(passenger)}>
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL: PasajerosPage
// ─────────────────────────────────────────────────────────────
const PasajerosPage = () => {
  const { user, logout, cerrarSesion } = useAuth();
  const location = useLocation();

  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('info');
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const lastRequestId = useRef(0);
  const [stats, setStats] = useState({
    total: 0,
    activeNow: 0,
    avgRating: 0,
    totalRides: 0,
  });


  const loadPassengers = async () => {
    const requestId = ++lastRequestId.current;
    setLoading(true);
    setPassengers([]); // Limpiamos la lista anterior para evitar confusión visual
    try {
      const response = await passengerService.getAllPassengers({
        search: searchTerm,
        initial: selectedLetter,
        page: currentPage,
        limit: 9
      });

      // Si hay una petición más nueva en curso, ignoramos esta
      if (requestId !== lastRequestId.current) return;

      if (response?.success) {
        setPassengers(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1);
        }

        // Usamos las estadísticas globales que vienen del servidor
        setStats({
          total: response.stats?.total || response.pagination?.total || 0,
          activeNow: response.stats?.active || 0,
          avgRating: (response.data?.reduce((s, p) => s + (p.rating || 0), 0) / (response.data?.length || 1)).toFixed(1),
          totalRides: (response.stats?.total || 0) * 12, // Simulación proporcional
        });
      } else {
        setPassengers([]);
        setStats({ total: 0, activeNow: 0, avgRating: 0, totalRides: 0 });
      }
    } catch (err) {
      console.error('[PasajerosPage] Error al cargar pasajeros:', err);
      setPassengers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPassengers(); }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        loadPassengers();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedLetter]);

  useEffect(() => {
    loadPassengers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleOpenModal = (passenger = null) => {
    setSelectedPassenger(passenger);
    setModalTab('info');
    setIsModalOpen(true);
  };

  const handleViewTrips = (passenger) => {
    setSelectedPassenger(passenger);
    setModalTab('history');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPassenger(null);
  };

  const handleSaved = () => {
    loadPassengers();
  };

  const handleActivate = async (passenger) => {
    Swal.fire({
      title: '¿Reactivar pasajero?',
      text: `Estás a punto de activar a ${passenger.name}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
      background: 'rgba(255, 255, 255, 0.9)',
      backdrop: `blur(4px)`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await passengerService.activatePassenger(passenger._id);
          toast.success('Pasajero reactivado correctamente');
          loadPassengers();
        } catch (err) {
          console.error('Error activating passenger:', err);
          toast.error('No se pudo reactivar al pasajero');
        }
      }
    });
  };

  const handleDelete = async (passenger) => {
    Swal.fire({
      title: '¿Desactivar pasajero?',
      text: `Esta acción pondrá a ${passenger.name} como inactivo.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      background: 'rgba(255, 255, 255, 0.9)',
      backdrop: `blur(4px)`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await passengerService.deletePassenger(passenger._id);
          toast.success('Pasajero desactivado correctamente');
          loadPassengers();
        } catch (err) {
          console.error('Error deleting passenger:', err);
          toast.error('No se pudo desactivar al pasajero');
        }
      }
    });
  };

  const handleEdit = (passenger) => {
    handleOpenModal(passenger);
  };

  // Lógica para generar números de página con elipsis (...)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) end = 4;
      if (currentPage >= totalPages - 2) start = totalPages - 3;
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const handleCerrarSesion = logout || cerrarSesion;

  return (
    <div className="dashboardContent">
      <Toaster position="top-right" />

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
            <Users size={20} /> <span>Pasajeros</span>
          </Link>
          <Link to="/conductores" className={`navItem ${location.pathname === '/conductores' ? 'active' : ''}`}>
            <UserCheck size={20} /> <span>Conductores</span>
          </Link>
          <Link to="/vehiculos" className={`navItem ${location.pathname === '/vehiculos' ? 'active' : ''}`}>
            <Car size={20} /> <span>Vehículos</span>
          </Link>
          <Link to="/reservas" className={`navItem ${location.pathname === '/reservas' ? 'active' : ''}`}>
            <Calendar size={20} /> <span>Reservas</span>
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
                placeholder="Filtrar por nombre o email..."
                value={searchTerm}
                onChange={e => {
                  setSearch(e.target.value);
                  if (e.target.value && selectedLetter) setSelectedLetter('');
                }}
              />
              <button className="btn-search-header" onClick={loadPassengers}>
                Buscar
              </button>
              <div className="search-status-indicator" style={{ right: '85px' }}>
                {loading && <div className="spinner-mini" />}
              </div>
            </div>
          </div>

          <div className="headerDerecho">
            <div className='userInfo'>
              <span>Bienvenido/a, {user?.name || 'Admin'}</span>
              <ChevronDown size={16} />
            </div>
            <div className="notificacionCampana">
              <Bell size={20} />
              <span className="notificacionBadge">3</span>
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
              <h1>Gestión de Pasajeros</h1>
              <p>Supervisa y administra los usuarios registrados en la plataforma</p>
            </div>
            <button className="btn-add-passenger" onClick={() => handleOpenModal(null)}>
              <Plus size={18} /> Nuevo Pasajero
            </button>
          </div>

          {/* --- ALPHABET FILTER --- */}
          <div className="alphabet-filter">
            <button
              className={`letter-btn ${selectedLetter === '' ? 'active' : ''}`}
              onClick={() => setSelectedLetter('')}
            >
              Todos
            </button>
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(letter => (
              <button
                key={letter}
                className={`letter-btn ${selectedLetter === letter ? 'active' : ''}`}
                onClick={() => {
                  const newLetter = selectedLetter === letter ? '' : letter;
                  setSelectedLetter(newLetter);
                  if (newLetter) setSearch(''); // Limpia buscador al elegir letra
                }}
              >
                {letter}
              </button>
            ))}
          </div>

          <div className="graficosGrid">
            <div className="tarjetaEstadistica">
              <div className="estadisticaHeader">
                <div className="estadisticaIcono color-blue"><Users size={20} /></div>
                <div className="estadisticaValor">{loading ? '—' : stats.total}</div>
              </div>
              <div className="estadisticaTitulo">Total Pasajeros</div>
              <div className="estadisticaFooter">
                <span className="estadisticaSubtitulo">Usuarios registrados</span>
              </div>
            </div>

            <div className="tarjetaEstadistica">
              <div className="estadisticaHeader">
                <div className="estadisticaIcono color-green"><Activity size={20} /></div>
                <div className="estadisticaValor">{loading ? '—' : stats.activeNow}</div>
              </div>
              <div className="estadisticaTitulo">Activos Ahora</div>
              <div className="estadisticaFooter">
                <span className="estadisticaSubtitulo">Usuarios en línea</span>
              </div>
            </div>

            <div className="tarjetaEstadistica">
              <div className="estadisticaHeader">
                <div className="estadisticaIcono color-yellow"><Star size={20} /></div>
                <div className="estadisticaValor">{loading ? '—' : stats.avgRating}</div>
              </div>
              <div className="estadisticaTitulo">Rating Promedio</div>
              <div className="estadisticaFooter">
                <span className="estadisticaSubtitulo">Valoración general</span>
              </div>
            </div>
          </div>

          <div id="gridPasajeros" className="passengers-section">
            {loading ? (
              <div className="loading-state-dashboard">
                <div className="spinner-dashboard" />
                <p>Cargando pasajeros...</p>
              </div>
            ) : passengers.length > 0 ? (
              <div className="conductoresGrid">
                {passengers.map(p => (
                  <PassengerCard
                    key={p._id}
                    passenger={p}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                    onActivate={handleActivate}
                    onView={handleViewTrips}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state-dashboard">
                <Users size={48} />
                <h3>No se encontraron pasajeros</h3>
                <p>Conecta el backend o prueba con otro filtro para comenzar.</p>
              </div>
            )}
          </div>

          {/* --- PAGINACIÓN INTELIGENTE --- */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button 
                className="pagination-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="Primera página"
              >
                <ChevronsLeft size={18} />
              </button>
              
              <button 
                className="pagination-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="pagination-numbers">
                {getPageNumbers().map((num, i) => (
                  num === '...' ? (
                    <span key={`dots-${i}`} className="pagination-dots">...</span>
                  ) : (
                    <button
                      key={`page-${num}`}
                      className={`page-num ${currentPage === num ? 'active' : ''}`}
                      onClick={() => setCurrentPage(num)}
                    >
                      {num}
                    </button>
                  )
                ))}
              </div>

              <button 
                className="pagination-btn" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                <ChevronRight size={18} />
              </button>

              <button 
                className="pagination-btn" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Última página"
              >
                <ChevronsRight size={18} />
              </button>
            </div>
          )}
        </div>
      </main>

      <DriverProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        driver={selectedPassenger}
        onSaved={loadPassengers}
        userType="pasajero"
        initialTab={modalTab}
      />
    </div>
  );
};

export default PasajerosPage;