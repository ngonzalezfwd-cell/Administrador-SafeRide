/**
 * ConductoresPage.jsx
 * 
 * Página de Gestión de Conductores — SafeRide Admin Panel
 * Sincronizada con la estructura exacta de Pasajeros.jsx para heredar estilos.
 * 
 * @author SafeRide Dev Team
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, Car, Calendar, CreditCard,
  Bell, AlertCircle, ShieldCheck, Settings, Search, Menu,
  ChevronDown, Plus, Truck, Star, Zap, MapPin, Clock,
  Award, Activity, Eye, Edit, Trash2, CheckCircle, Mail, Phone,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import driverService from '../../services/driverService';
import DriverProfileModal from '../../components/DriverProfileModal';
import Swal from 'sweetalert2';
import { toast, Toaster } from 'react-hot-toast';

import '../DashboardPage/Dashboard.css';
import './ConductoresPage.css';
import '../PasajerosPage/Pasajeros.css';
import IconSafeRide from '../../imgs/IconSafeRide.png';
import DefaultImageUser from '../../imgs/DefaultImageUser.png';

// ─────────────────────────────────────────────────────────────
const getDefaultImagen = (url) => (url && url.trim() !== '') ? url : DefaultImageUser;

// ─────────────────────────────────────────────────────────────
// COMPONENTE: Tarjeta de Conductor
// ─────────────────────────────────────────────────────────────
const DriverCard = ({ driver, onEdit, onDelete, onActivate, onView }) => {
  return (
    <div className="conductor-card">
      <div className="card-header">
        <img
          src={getDefaultImagen(driver.profileImage)}
          alt={driver.name}
          className="conductor-img"
        />
        <div className={`status-badge ${driver.isActive ? 'active' : 'inactive'}`}>
          {driver.isActive ? 'Activo' : 'Inactivo'}
        </div>
      </div>

      <div className="card-content">
        <h3 className="conductor-name">{driver.name}</h3>
        <p className="conductor-role">
          <Mail size={13} style={{ marginRight: '6px' }} />
          {driver.email}
        </p>
        
        <div className="vehicle-info-mini" style={{ marginTop: '12px' }}>
          <div className="info-item">
            <Phone size={14} />
            <span>{driver.phone || 'Sin teléfono'}</span>
          </div>
          <div className="info-item">
            <Car size={14} />
            <span>{driver.vehicle?.license_plate || 'Sin placa'}</span>
          </div>
        </div>
      </div>

      <div className="card-actions">
        {!driver.isActive ? (
          <button 
            className="action-btn activate" 
            title="Activar" 
            onClick={() => onActivate(driver)}
            style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.1)' }}
          >
            <CheckCircle size={18} />
          </button>
        ) : (
          <button className="action-btn view" title="Ver Historial de Viajes" onClick={() => onView(driver)}>
            <Eye size={18} />
          </button>
        )}
        <button className="action-btn edit" title="Editar" onClick={() => onEdit(driver)}>
          <Edit size={18} />
        </button>
        <button className="action-btn delete" title="Desactivar" onClick={() => onDelete(driver)}>
          <Trash2 size={18} />
        </button>
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

  const cached = driverService.getCachedDrivers();
  const [drivers, setDrivers] = useState(cached.data || []);
  const [loading, setLoading] = useState(!cached.data?.length);
  const [searchTerm, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('info');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const lastRequestId = useRef(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(cached.pagination?.pages || 1);
  const [stats, setStats] = useState({
    total: cached.pagination?.total || 0,
    activeNow: cached.stats?.active || 0,
    avgRating: cached.stats?.rating || 0,
    onTrip: 0,
  });
  const [selectedLetter, setSelectedLetter] = useState('');


  const loadDrivers = async () => {
    const requestId = ++lastRequestId.current;
    setLoading(true);
    try {
      const response = await driverService.getAllDrivers({
        search: searchTerm,
        initial: selectedLetter,
        page: currentPage,
        limit: 9
      });

      const list = response?.data;
      const pagination = response?.pagination;

      if (pagination) {
        setTotalPages(pagination.pages || 1);
      }

      // Si hay una petición más nueva en curso, ignoramos esta
      if (requestId !== lastRequestId.current) return;

      if (Array.isArray(list)) {
        // Enriquecemos cada conductor con su vehículo de forma paralela y resiliente
        const enriched = await Promise.all(
          list.map(async (d) => {
            try {
              const vehicle = await driverService.getVehicleByDriver(d._id);
              return { ...d, vehicle };
            } catch (vErr) {
              // Si falla el vehículo, devolvemos el conductor sin vehículo en lugar de romper todo
              console.warn(`No se pudo cargar el vehículo para ${d.name}:`, vErr);
              return { ...d, vehicle: null };
            }
          })
        );

        // Verificación final de Race Condition después de la carga pesada
        if (requestId !== lastRequestId.current) return;

        setDrivers(enriched);

        // Usamos las estadísticas globales que vienen del servidor
        setStats({
          total: response.stats?.total || response.pagination?.total || 0,
          activeNow: response.stats?.active || 0,
          avgRating: (enriched.reduce((s, d) => s + (d.rating || 0), 0) / (enriched.length || 1)).toFixed(1),
          onTrip: 0,
        });
      } else {
        setDrivers([]);
        setStats({ total: 0, activeNow: 0, avgRating: 0, onTrip: 0 });
      }
    } catch (err) {
      console.error('[ConductoresPage] Error al cargar conductores:', err);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDrivers(); }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        loadDrivers();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedLetter]);

  useEffect(() => {
    loadDrivers();
    // Subir al inicio de la página para dar feedback visual de cambio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleOpenModal = (driver = null) => {
    setSelectedDriver(driver);
    setModalTab('info');
    setIsModalOpen(true);
  };

  const handleViewTrips = (driver) => {
    setSelectedDriver(driver);
    setModalTab('history');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDriver(null);
  };

  const handleSaved = () => {
    loadDrivers();
  };

  const handleActivate = async (driver) => {
    Swal.fire({
      title: '¿Reactivar conductor?',
      text: `Estás a punto de activar a ${driver.name}`,
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
          await driverService.activateDriver(driver._id);
          toast.success('Conductor reactivado correctamente');
          loadDrivers();
        } catch (err) {
          console.error('Error activating driver:', err);
          toast.error('No se pudo reactivar al conductor');
        }
      }
    });
  };

  const handleDelete = async (driver) => {
    Swal.fire({
      title: '¿Eliminar conductor?',
      text: `Esta acción desactivará a ${driver.name} del sistema.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: 'rgba(255, 255, 255, 0.9)',
      backdrop: `blur(4px)`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await driverService.deleteDriver(driver._id);
          toast.success('Conductor desactivado correctamente');
          loadDrivers();
        } catch (err) {
          console.error('Error deleting driver:', err);
          toast.error('No se pudo eliminar al conductor');
        }
      }
    });
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
    <>
      <Toaster position="top-right" />

      <div className="local-header-actions">
        <div className="buscadorContainer">
          <Search size={18} className="buscadorIcono" />
          <input
            type="text"
            placeholder="Filtrar conductores..."
            value={searchTerm}
            onChange={e => {
              setSearch(e.target.value);
              if (e.target.value && selectedLetter) setSelectedLetter('');
            }}
          />
          <button className="btn-search-header" onClick={loadDrivers}>
            Buscar
          </button>
          <div className="search-status-indicator" style={{ right: '85px' }}>
            {loading && <div className="spinner-mini" />}
          </div>
        </div>
      </div>

      <div id="encabezadoPagina" className="page-header">
        <div>
          <h1>Gestión de Conductores</h1>
          <p>Gestiona y monitorea el rendimiento y disponibilidad de la flota</p>
        </div>
        <button className="btn-add-passenger" onClick={() => handleOpenModal(null)}>
          <Plus size={18} /> Registrar Conductor
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
              if (newLetter) setSearch(''); 
            }}
          >
            {letter}
          </button>
        ))}
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
        {loading && drivers.length === 0 && (
          <div className="loading-state-dashboard">
            <div className="spinner-dashboard" />
            <p>Cargando conductores...</p>
          </div>
        )}

        <div className={`conductoresGrid ${loading ? 'conductoresGrid--loading' : 'conductoresGrid--loaded'}`}>
          {drivers.length > 0 ? (
            drivers.map(driver => (
              <DriverCard
                key={driver._id}
                driver={driver}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                onActivate={handleActivate}
                onView={handleViewTrips}
              />
            ))
          ) : !loading && (
            <div className="empty-state-dashboard">
              <Truck size={48} />
              <h3>No se encontraron conductores</h3>
              <p>Intenta con otros filtros o registra uno nuevo.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- PAGINACIÓN --- */}
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

      <DriverProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        driver={selectedDriver}
        onSaved={handleSaved}
        initialTab={modalTab}
      />
    </>
  );
};

export default ConductoresPage;
