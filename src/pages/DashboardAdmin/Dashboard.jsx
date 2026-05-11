import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import {
    LayoutDashboard, Users, UserCheck, Car, Calendar, CreditCard,
    Bell, AlertCircle, ShieldCheck, Settings, Search, LogOut,
    ArrowUpRight, ArrowDownRight, Menu, ChevronDown
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Tooltip
} from 'recharts';
import './Dashboard.css';

// Función para imagen por defecto de Cloudinary
const getDefaultImage = (url) => url ? url : 'https://res.cloudinary.com/demo/image/upload/d_avatar.png/non_existing_id.png';

const StatCard = ({ icon, title, value, change, isPositive, subtitle }) => (
    <div className="stat-card">
        <div className="stat-header">
            <div className="stat-icon-wrapper">{icon}</div>
            <div className="stat-value">{value}</div>
        </div>
        <div className="stat-title">{title}</div>
        <div className="stat-footer">
            <span className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}
            </span>
            <span className="stat-subtitle">{subtitle}</span>
        </div>
    </div>
);

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    return null; // Labels rendered via legend or custom HTML to match design
};

const Dashboard = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [metrics, setMetrics] = useState({});
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch basic metrics and recent data from API
                const [metricsRes, bookingsRes, usersRes, notifRes] = await Promise.all([
                    api.get('/metrics/global').catch(() => ({ data: { data: {} } })),
                    api.get('/bookings?limit=5').catch(() => ({ data: { data: [] } })),
                    api.get('/users?limit=5').catch(() => ({ data: { data: [] } })),
                    api.get('/notifications').catch(() => ({ data: { data: [] } }))
                ]);

                setMetrics(metricsRes.data?.data || {});
                setBookings(bookingsRes.data?.data || bookingsRes.data?.data?.docs || []);
                setUsers(usersRes.data?.data || usersRes.data?.data?.docs || []);
                setNotifications(notifRes.data?.data || notifRes.data?.data?.docs || []);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Helper functions to format status and priority
    const getStatusClass = (status) => {
        switch(status?.toLowerCase()) {
            case 'completed': case 'completada': case 'confirmed': return 'status-green';
            case 'pending': case 'pendiente': return 'status-yellow';
            case 'cancelled': case 'canceled': case 'cancelada': return 'status-red';
            default: return 'status-blue';
        }
    };

    // Calculate dynamic data based on metrics
    const totalUsers = metrics.totalUsers || 0;
    const totalDrivers = metrics.totalDrivers || 0;
    const totalPassengers = metrics.totalPassengers || 0;
    const totalRides = metrics.totalRides || 0;
    
    // Fallback data for charts if API doesn't provide it yet
    const pieDataRoles = [
        { name: 'Pasajeros', value: totalPassengers > 0 ? totalPassengers : 892, color: '#3B82F6' },
        { name: 'Conductores', value: totalDrivers > 0 ? totalDrivers : 342, color: '#10B981' },
        { name: 'Moderadores', value: (totalUsers - totalPassengers - totalDrivers) > 0 ? (totalUsers - totalPassengers - totalDrivers) : 14, color: '#8B5CF6' },
    ];

    const pieDataPagos = [
        { name: 'Pagados', value: 1245, color: '#10B981' },
        { name: 'Pendientes', value: 451, color: '#F59E0B' },
        { name: 'Fallidos', value: 200, color: '#EF4444' },
    ];

    const lineData = [
        { name: '14 May', value: 30 },
        { name: '15 May', value: 150 },
        { name: '16 May', value: 120 },
        { name: '17 May', value: 70 },
        { name: '18 May', value: 100 },
        { name: '19 May', value: Math.floor(totalRides / 2) || 180 },
        { name: '20 May', value: totalRides || 210 },
    ];

    if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Cargando métricas...</div>;

    return (
        <div id="disenoTablero" className="dashboard-layout">
            {/* Sidebar */}
            <aside id="barraLateral" className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                    </div>
                    <span>RideAdmin</span>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/Inicio" className={`nav-item ${location.pathname === '/Inicio' ? 'active' : ''}`}><LayoutDashboard size={20} /> <span>Dashboard</span></Link>
                    <Link to="/usuarios" className={`nav-item ${location.pathname === '/usuarios' ? 'active' : ''}`}><Users size={20} /> <span>Usuarios</span><ChevronDown size={16} className="ml-auto" /></Link>
                    <Link to="/conductores" className={`nav-item ${location.pathname === '/conductores' ? 'active' : ''}`}><UserCheck size={20} /> <span>Conductores</span></Link>
                    <Link to="/vehiculos" className={`nav-item ${location.pathname === '/vehiculos' ? 'active' : ''}`}><Car size={20} /> <span>Vehículos</span></Link>
                    <Link to="/reservas" className={`nav-item ${location.pathname === '/reservas' ? 'active' : ''}`}><Calendar size={20} /> <span>Reservas</span><ChevronDown size={16} className="ml-auto" /></Link>
                    <Link to="/pagos" className={`nav-item ${location.pathname === '/pagos' ? 'active' : ''}`}><CreditCard size={20} /> <span>Pagos</span></Link>
                    <Link to="/notificaciones" className={`nav-item ${location.pathname === '/notificaciones' ? 'active' : ''}`}><Bell size={20} /> <span>Notificaciones</span></Link>
                    <Link to="/quejas" className={`nav-item ${location.pathname === '/quejas' ? 'active' : ''}`}><AlertCircle size={20} /> <span>Quejas</span></Link>
                    <Link to="/auditoria" className={`nav-item ${location.pathname === '/auditoria' ? 'active' : ''}`}><ShieldCheck size={20} /> <span>Auditoría</span></Link>
                    <Link to="/configuracion" className={`nav-item ${location.pathname === '/configuracion' ? 'active' : ''}`}><Settings size={20} /> <span>Configuración</span></Link>
                </nav>
                <div className="sidebar-profile">
                    <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="profile-img" />
                    <div className="profile-info">
                        <span className="profile-name">{user?.name || 'Admin'}</span>
                        <span className="profile-role">Super Administrador</span>
                    </div>
                    <ChevronDown size={16} className="profile-chevron" onClick={logout} style={{cursor: 'pointer'}} />
                </div>
            </aside>

            {/* Main Content */}
            <main id="contenidoPrincipal" className="main-content">
                {/* Header */}
                <header id="cabeceraSuperior" className="top-header">
                    <div className="header-left">
                        <Menu size={24} className="menu-trigger" />
                        <div className="search-container">
                            <Search size={18} className="search-icon" />
                            <input type="text" placeholder="Buscar en el sistema..." />
                            <span className="search-kbd">⌘K</span>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="notification-wrapper">
                            <Bell size={20} />
                            <span className="notification-badge">8</span>
                        </div>
                        <div className="user-dropdown">
                            <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
                            <span>{user?.name || 'Admin'}</span>
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </header>

                {/* Dashboard Body */}
                <div id="areaDesplazable" className="dashboard-scrollable">
                    <div id="encabezadoPagina" className="page-header">
                        <div>
                            <h1>Dashboard</h1>
                            <p>Resumen general de la plataforma</p>
                        </div>
                        <div className="date-picker-btn">
                            <Calendar size={16} />
                            <span>20 de mayo, 2025</span>
                            <ChevronDown size={14} />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div id="cuadriculaEstadisticas" className="stats-grid">
                        <StatCard icon={<Users size={20} className="color-purple" />} title="Usuarios totales" value={totalUsers.toLocaleString()} change="12.5%" isPositive={true} subtitle="vs mes anterior" />
                        <StatCard icon={<Car size={20} className="color-green" />} title="Conductores aprobados" value={totalDrivers.toLocaleString()} change="8.2%" isPositive={true} subtitle="vs mes anterior" />
                        <StatCard icon={<Car size={20} className="color-yellow" />} title="Vehículos pendientes" value="24" change="4.3%" isPositive={false} subtitle="vs mes anterior" />
                        <StatCard icon={<Calendar size={20} className="color-blue" />} title="Reservas este mes" value={totalRides.toLocaleString()} change="15.7%" isPositive={true} subtitle="vs mes anterior" />
                        <StatCard icon={<AlertCircle size={20} className="color-red" />} title="Quejas pendientes" value="18" change="5.6%" isPositive={true} subtitle="vs mes anterior" />
                        <StatCard icon={<CreditCard size={20} className="color-green-dark" />} title="Pagos fallidos" value="7" change="2.1%" isPositive={true} subtitle="vs mes anterior" />
                    </div>

                    {/* Charts Grid */}
                    <div id="cuadriculaGraficos" className="charts-grid">
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3>Reservas por día</h3>
                                <div className="dropdown-small">Últimos 7 días <ChevronDown size={14}/></div>
                            </div>
                            <div className="chart-body">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                                        <RechartsTooltip />
                                        <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-header">
                                <h3>Distribución de pagos</h3>
                            </div>
                            <div className="chart-body pie-chart-container">
                                <div className="pie-wrapper">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieDataPagos} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                                                {pieDataPagos.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="pie-center-text">
                                        <span className="pie-total-label">Total</span>
                                        <span className="pie-total-value">1,896</span>
                                    </div>
                                </div>
                                <div className="pie-legend">
                                    {pieDataPagos.map((item, i) => (
                                        <div key={i} className="legend-item">
                                            <div className="legend-indicator" style={{backgroundColor: item.color}}></div>
                                            <div className="legend-details">
                                                <span className="legend-name">{item.name}</span>
                                                <span className="legend-val">{item.value} <span className="legend-percent">({((item.value/1896)*100).toFixed(1)}%)</span></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-header">
                                <h3>Usuarios por rol</h3>
                            </div>
                            <div className="chart-body pie-chart-container">
                                <div className="pie-wrapper">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieDataRoles} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                                                {pieDataRoles.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="pie-center-text">
                                        <span className="pie-total-value">1,248</span>
                                        <span className="pie-total-label">Total</span>
                                    </div>
                                </div>
                                <div className="pie-legend">
                                    {pieDataRoles.map((item, i) => (
                                        <div key={i} className="legend-item">
                                            <div className="legend-indicator" style={{backgroundColor: item.color}}></div>
                                            <div className="legend-details">
                                                <span className="legend-name">{item.name}</span>
                                                <span className="legend-val">{item.value} <span className="legend-percent">({((item.value/1248)*100).toFixed(1)}%)</span></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lists Grid */}
                    <div id="cuadriculaListas" className="lists-grid">
                        {/* Actividad reciente */}
                        <div className="list-card">
                            <div className="list-header">
                                <h3>Actividad reciente</h3>
                                <button className="btn-view-all">Ver todas</button>
                            </div>
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Actividad</th>
                                            <th>Usuario</th>
                                            <th>Fecha</th>
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notifications.slice(0, 5).map((item, idx) => (
                                            <tr key={item._id || idx}>
                                                <td>
                                                    <div className="activity-cell">
                                                        <div className={`icon-box icon-blue`}><Bell size={16} /></div>
                                                        <span>{item.message || 'Notificación del sistema'}</span>
                                                    </div>
                                                </td>
                                                <td>{item.user_id?.name || 'Sistema'}</td>
                                                <td><span className="text-gray">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span></td>
                                                <td><button className="btn-action">Ver</button></td>
                                            </tr>
                                        ))}
                                        {notifications.length === 0 && (
                                            <tr><td colSpan="4" className="text-center text-gray pt-4">No hay actividad reciente</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Reservas recientes */}
                        <div className="list-card">
                            <div className="list-header">
                                <h3>Reservas recientes</h3>
                                <button className="btn-view-all">Ver todas</button>
                            </div>
                            <div className="list-body">
                                {bookings.slice(0, 4).map((item, i) => (
                                    <div className="list-item-row" key={item._id || i}>
                                        <img src={getDefaultImage(item.passenger_id?.profileImage)} alt={item.passenger_id?.name || 'Pasajero'} className="avatar-sm" />
                                        <div className="item-info">
                                            <div className="item-title">#{item._id?.substring(0, 8) || 'R-0000'}</div>
                                            <div className="item-desc">{item.passenger_id?.name || 'Desconocido'}<br/><span className="text-gray">Destino: {item.ride_id?.destination?.address || 'Pendiente'}</span></div>
                                        </div>
                                        <div className="item-status">
                                            <span className={`status-badge ${getStatusClass(item.status)}`}>{item.status || 'Pendiente'}</span>
                                        </div>
                                        <div className="item-price">
                                            <div className="price-val">${item.cost || '0.00'}</div>
                                            <div className="price-time">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}
                                {bookings.length === 0 && (
                                    <div className="text-center text-gray py-4">No hay reservas recientes</div>
                                )}
                            </div>
                        </div>

                        {/* Quejas recientes (Usuarios recientes como fallback si no hay quejas) */}
                        <div className="list-card">
                            <div className="list-header">
                                <h3>Usuarios recientes</h3>
                                <button className="btn-view-all">Ver todos</button>
                            </div>
                            <div className="list-body">
                                {users.slice(0, 4).map((item, i) => (
                                    <div className="list-item-row" key={item._id || i}>
                                        <img src={getDefaultImage(item.profileImage)} alt={item.name} className="avatar-sm" />
                                        <div className="item-info">
                                            <div className="item-title font-semibold">{item.name}</div>
                                            <div className="item-desc text-gray">{item.email}</div>
                                        </div>
                                        <div className="item-priority">
                                            <span className={`priority-text priority-low`}>{item.type}</span>
                                        </div>
                                        <div className="item-time text-gray text-sm">
                                            {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                                {users.length === 0 && (
                                    <div className="text-center text-gray py-4">No hay usuarios recientes</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
