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
import IconSafeRide from '../../imgs/IconSafeRide.png';
import DefaultImageUser from '../../imgs/DefaultImageUser.png';

// ────────────── Función para imagen por defecto de Cloudinary ────────────────────────
const getDefaultImagen = (url) => (url && url.trim() !== '') ? url : DefaultImageUser;

// ────────────── Tarjeta de estadísticas con iconos ───────────────────────────────────
const TarjetaEstadistica = ({ icon, title, value, change, isPositive, subtitle }) => (
    <div className="tarjetaEstadistica">
        <div className="estadisticaHeader">
            <div className="estadisticaIcono">{icon}</div>
            <div className="estadisticaValor">{value}</div>
        </div>
        <div className="estadisticaTitulo">{title}</div>
        <div className="estadisticaFooter">
            <span className={"estadisticaCambio " + (isPositive ? 'positive' : 'negative')}>
                {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}
            </span>
            <span className="estadisticaSubtitulo">{subtitle}</span>
        </div>
    </div>
);

const Dashboard = () => {
    const { user, cerrarSesion, logout } = useAuth();
    const location = useLocation();
    const [metricas, setMetricas] = useState({});
    const [Reservas, setReservas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = cerrarSesion || logout;

    useEffect(() => {
        const CargarDatos = async () => {
            try {
                const [metricasRes, reservasRes, usuariosRes, notificacionesRes] = await Promise.all([
                    api.get('/metrics/global').catch(() => ({ data: { data: {} } })),
                    api.get('/bookings?limit=5').catch(() => ({ data: { data: [] } })),
                    api.get('/users?limit=5').catch(() => ({ data: { data: [] } })),
                    api.get('/notifications').catch(() => ({ data: { data: [] } }))
                ]);

                setMetricas(metricasRes.data?.data || {});
                setReservas(reservasRes.data?.data || reservasRes.data?.data?.docs || []);
                setUsuarios(usuariosRes.data?.data || usuariosRes.data?.data?.docs || []);
                setNotificaciones(notificacionesRes.data?.data || notificacionesRes.data?.data?.docs || []);
            } catch (error) {
                console.error("Error al cargar datos del dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        CargarDatos();
    }, []);

    const getStatusClass = (status) => {
        switch(status?.toLowerCase()) {
            case 'completada': return 'status-green';
            case 'confirmada': return 'status-blue';
            case 'pendiente': return 'status-yellow';
            case 'cancelada': return 'status-red';
            default: return '';
        }
    };

    const totalUsuarios = metricas.totalUsuarios || 0;
    const totalConductores = metricas.totalConductores || 0;
    const totalPasajeros = metricas.totalPasajeros || 0;
    const totalViajes = metricas.totalViajes || 0;
    
    const pieDataRoles = [
        { name: 'Pasajeros', value: totalPasajeros > 0 ? totalPasajeros : 892, color: '#3B82F6' },
        { name: 'Conductores', value: totalConductores > 0 ? totalConductores : 342, color: '#10B981' },
        { name: 'Moderadores', value: (totalUsuarios - totalPasajeros - totalConductores) > 0 ? (totalUsuarios - totalPasajeros - totalConductores) : 14, color: '#8B5CF6' },
    ];

    const pieDataPagos = [
        { name: 'Pagados', value: 100, color: '#10B981' },
        { name: 'Pendientes', value: 100, color: '#F59E0B' },
        { name: 'Fallidos', value: 100, color: '#EF4444' },
    ];

    const lineData = [
        { name: '14 May', value: 30 },
        { name: '15 May', value: 150 },
        { name: '16 May', value: 120 },
        { name: '17 May', value: 70 },
        { name: '18 May', value: 100 },
        { name: '19 May', value: Math.floor(totalViajes / 2) || 180 },
        { name: '20 May', value: totalViajes || 210 },
    ];

    if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Cargando métricas...</div>;

    return (
        <div className="dashboardContent">
            <aside>
                <div className="sidebaLogo">
                    <img src={IconSafeRide} alt="Icono" className='IconSafeRide' />
                    <span>RideAdmin</span>
                </div>

                <nav className="sidebarNav">
                    <Link to="/inicio" className={`navItem ${location.pathname === '/inicio' ? 'active' : ''}`}><LayoutDashboard size={20} /> <span>Panel</span></Link>
                    <Link to="/usuarios" className={`navItem ${location.pathname === '/usuarios' ? 'active' : ''}`}><Users size={20} /> <span>Usuarios</span><ChevronDown size={16} className="FlechaSidebar" /></Link>
                    <Link to="/conductores" className={`navItem ${location.pathname === '/conductores' ? 'active' : ''}`}><UserCheck size={20} /> <span>Conductores</span></Link>
                    <Link to="/vehiculos" className={`navItem ${location.pathname === '/vehiculos' ? 'active' : ''}`}><Car size={20} /> <span>Vehículos</span></Link>
                    <Link to="/reservas" className={`navItem ${location.pathname === '/reservas' ? 'active' : ''}`}><Calendar size={20} /> <span>Reservas</span><ChevronDown size={16} className="FlechaSidebar" /></Link>
                    <Link to="/pagos" className={`navItem ${location.pathname === '/pagos' ? 'active' : ''}`}><CreditCard size={20} /> <span>Pagos</span></Link>
                    <Link to="/notificaciones" className={`navItem ${location.pathname === '/notificaciones' ? 'active' : ''}`}><Bell size={20} /> <span>Notificaciones</span></Link>
                    <Link to="/quejas" className={`navItem ${location.pathname === '/quejas' ? 'active' : ''}`}><AlertCircle size={20} /> <span>Quejas</span></Link>
                    <Link to="/auditoria" className={`navItem ${location.pathname === '/auditoria' ? 'active' : ''}`}><ShieldCheck size={20} /> <span>Auditoría</span></Link>
                    <Link to="/configuracion" className={`navItem ${location.pathname === '/configuracion' ? 'active' : ''}`}><Settings size={20} /> <span>Configuración</span></Link>
                </nav>

                <div className="sidebarPerfil">
                    <img src={getDefaultImagen(user?.profileImage)} alt="Admin" className="FotoPerfil" />
                    <div className="PerfilInfo">
                        <span className="NombrePerfil">{user?.name || 'Admin'}</span>
                        <span className="RolPerfil">Super Administrador</span>
                    </div>
                    <ChevronDown size={16} className="FlechaPerfil" onClick={handleLogout} style={{cursor: 'pointer'}} />
                </div>
            </aside>

            <main>
                <header>
                    <div className="headerIzquierdo">
                        <div className="buscadorContainer">
                            <Search size={18} className="buscadorIcono" />
                            <input type="text" placeholder="Buscar en el sistema..." />
                        </div>
                    </div>
                    <div className="headerDerecho">
                        <div className='userInfo'>
                            <span>Bienvenido/a, {user?.name || 'Admin'}</span>
                            <ChevronDown size={16} />
                        </div>
                        <div className="notificacionCampana">
                            <Bell size={20} />
                            <span className="notificacionBadge">8</span>
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
                            <h1>Dashboard</h1>
                            <p>Resumen general de la plataforma</p>
                        </div>
                        <div className="date-picker-btn">
                            <Calendar size={16} />
                            <span>20 de mayo, 2025</span>
                            <ChevronDown size={14} />
                        </div>
                    </div>

                    <div id="cuadriculaEstadisticas" className="graficosGrid">
                        <TarjetaEstadistica icon={<Users size={20} className="color-purple" />} title="Usuarios totales" value={totalUsuarios.toLocaleString()} change="12.5%" isPositive={true} subtitle="vs mes anterior" />
                        <TarjetaEstadistica icon={<Car size={20} className="color-green" />} title="Conductores aprobados" value={totalConductores.toLocaleString()} change="8.2%" isPositive={true} subtitle="vs mes anterior" />
                        <TarjetaEstadistica icon={<Car size={20} className="color-yellow" />} title="Vehículos pendientes" value="24" change="4.3%" isPositive={false} subtitle="vs mes anterior" />
                        <TarjetaEstadistica icon={<Calendar size={20} className="color-blue" />} title="Reservas este mes" value={totalViajes.toLocaleString()} change="15.7%" isPositive={true} subtitle="vs mes anterior" />
                        <TarjetaEstadistica icon={<AlertCircle size={20} className="color-red" />} title="Quejas pendientes" value="18" change="5.6%" isPositive={true} subtitle="vs mes anterior" />
                        <TarjetaEstadistica icon={<CreditCard size={20} className="color-green-dark" />} title="Pagos fallidos" value="7" change="2.1%" isPositive={true} subtitle="vs mes anterior" />
                    </div>

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

                    <div id="cuadriculaListas" className="lists-grid">
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
                                        {notificaciones.slice(0, 5).map((item, idx) => (
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
                                        {notificaciones.length === 0 && (
                                            <tr><td colSpan="4" className="text-center text-gray pt-4">No hay actividad reciente</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="list-card">
                            <div className="list-header">
                                <h3>Reservas recientes</h3>
                                <button className="btn-view-all">Ver todas</button>
                            </div>
                            <div className="list-body">
                                {Reservas.slice(0, 4).map((item, i) => (
                                    <div className="list-item-row" key={item._id || i}>
                                        <img src={getDefaultImagen(item.passenger_id?.profileImage)} alt={item.passenger_id?.name || 'Pasajero'} className="avatar-sm" />
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
                                {Reservas.length === 0 && (
                                    <div className="text-center text-gray py-4">No hay reservas recientes</div>
                                )}
                            </div>
                        </div>

                        <div className="list-card">
                            <div className="list-header">
                                <h3>Usuarios recientes</h3>
                                <button className="btn-view-all">Ver todos</button>
                            </div>
                            <div className="list-body">
                                {usuarios.slice(0, 4).map((item, i) => (
                                    <div className="list-item-row" key={item._id || i}>
                                        <img src={getDefaultImagen(item.profileImage)} alt={item.name} className="avatar-sm" />
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
                                {usuarios.length === 0 && (
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
