/**
 * Pasajeros.jsx
 *
 * Página de Gestión de Pasajeros — SafeRide Admin Panel
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
    ChevronDown, Plus, Mail, Phone, Briefcase, Clock,
    TrendingUp, Activity, Star, Eye, Edit, Trash2
} from 'lucide-react';
import passengerService from '../../services/passengerService';
import '../DashboardPage/Dashboard.css';
import './Pasajeros.css';
import IconSafeRide from '../../imgs/IconSafeRide.png';
import DefaultImageUser from '../../imgs/DefaultImageUser.png';

// ─────────────────────────────────────────────────────────────
const getDefaultImagen = (url) => (url && url.trim() !== '') ? url : DefaultImageUser;

// ─────────────────────────────────────────────────────────────
// COMPONENTE: Tarjeta de Pasajero
// ─────────────────────────────────────────────────────────────
const PassengerCard = ({ passenger }) => (
    <div className="passenger-card-v2">
        <div className="p-card-header">
            <div className="p-user-info">
                <img
                    src={getDefaultImagen(passenger.profileImage)}
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
    const { user, logout, cerrarSesion } = useAuth();
    const location = useLocation();

    const [passengers, setPassengers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearch] = useState('');
    const [stats, setStats] = useState({
        total: 0, active: 0, avgRating: 0, totalRides: 0
    });

    useEffect(() => { loadPassengers(); }, []);

    const loadPassengers = async () => {
        setLoading(true);
        try {
            const response = await passengerService.getAllPassengers({ search: searchTerm });
            if (response?.success && Array.isArray(response.data)) {
                setPassengers(response.data);
                const active = response.data.filter(p => p.isActive).length;
                const totalRating = response.data.reduce((a, p) => a + (p.rating || 0), 0);
                setStats({
                    total: response.pagination?.total || response.data.length,
                    active,
                    avgRating: response.data.length > 0
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

    // Usamos el mismo nombre de función de logout que en Dashboard para consistencia
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
                                placeholder="Buscar pasajeros..."
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
                        <button className="btn-add-passenger">
                            <Plus size={18} /> Nuevo Pasajero
                        </button>
                    </div>

                    {/* Stats Reutilizando las clases de Dashboard */}
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
                                <div className="estadisticaValor">{loading ? '—' : stats.active}</div>
                            </div>
                            <div className="estadisticaTitulo">Activos ahora</div>
                            <div className="estadisticaFooter">
                                <span className="estadisticaSubtitulo">En línea actualmente</span>
                            </div>
                        </div>

                        <div className="tarjetaEstadistica">
                            <div className="estadisticaHeader">
                                <div className="estadisticaIcono color-yellow"><Star size={20} /></div>
                                <div className="estadisticaValor">{loading ? '—' : stats.avgRating}</div>
                            </div>
                            <div className="estadisticaTitulo">Rating Promedio</div>
                            <div className="estadisticaFooter">
                                <span className="estadisticaSubtitulo">Basado en reseñas</span>
                            </div>
                        </div>
                    </div>

                    {/* Grid de Pasajeros */}
                    <div className="passengers-section">
                        {loading ? (
                            <div className="loading-state-dashboard">
                                <div className="spinner-dashboard" />
                                <p>Cargando pasajeros...</p>
                            </div>
                        ) : passengers.length > 0 ? (
                            <div className="passengers-list-grid">
                                {passengers.map(p => <PassengerCard key={p._id} passenger={p} />)}
                            </div>
                        ) : (
                            <div className="empty-state-dashboard">
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