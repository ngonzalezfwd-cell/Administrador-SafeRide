import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, UserCheck, Car, Calendar, CreditCard,
    Bell, AlertCircle, ShieldCheck, Settings, Search, LogOut,
    ArrowUpRight, ArrowDownRight, Menu, ChevronDown
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Tooltip
} from 'recharts';
import './DashboardAdmin.css';

const lineData = [
    { name: '14 May', value: 30 },
    { name: '15 May', value: 150 },
    { name: '16 May', value: 120 },
    { name: '17 May', value: 70 },
    { name: '18 May', value: 100 },
    { name: '19 May', value: 180 },
    { name: '20 May', value: 210 },
];

const pieDataPagos = [
    { name: 'Pagados', value: 1245, color: '#10B981' },
    { name: 'Pendientes', value: 451, color: '#F59E0B' },
    { name: 'Fallidos', value: 200, color: '#EF4444' },
];

const pieDataRoles = [
    { name: 'Pasajeros', value: 892, color: '#3B82F6' },
    { name: 'Conductores', value: 342, color: '#10B981' },
    { name: 'Moderadores', value: 14, color: '#8B5CF6' },
];

const recientesData = [
    { id: 1, type: 'user', icon: <UserCheck size={16} />, title: 'Nuevo usuario registrado', user: 'Juan Pérez', date: '20/05/2025 10:45 AM', colorClass: 'icon-green' },
    { id: 2, type: 'car', icon: <Car size={16} />, title: 'Vehículo aprobado', user: 'María López', date: '20/05/2025 10:30 AM', colorClass: 'icon-blue' },
    { id: 3, type: 'calendar', icon: <Calendar size={16} />, title: 'Reserva realizada', user: 'Carlos Gómez', date: '20/05/2025 10:15 AM', colorClass: 'icon-yellow' },
    { id: 4, type: 'alert', icon: <AlertCircle size={16} />, title: 'Nueva queja recibida', user: 'Ana Torres', date: '20/05/2025 09:58 AM', colorClass: 'icon-red' },
    { id: 5, type: 'payment', icon: <CreditCard size={16} />, title: 'Pago realizado', user: 'Luis Ramírez', date: '20/05/2025 09:42 AM', colorClass: 'icon-purple' },
];

const reservasData = [
    { id: '#R-2025-00124', user: 'Juan Pérez', route: 'Centro → Aeropuerto', status: 'Completada', statusClass: 'status-green', price: '$15.50', time: 'Hoy, 10:45 AM', img: 'https://i.pravatar.cc/150?u=1' },
    { id: '#R-2025-00123', user: 'María López', route: 'Centro → Plaza Norte', status: 'En progreso', statusClass: 'status-blue', price: '$8.75', time: 'Hoy, 10:30 AM', img: 'https://i.pravatar.cc/150?u=2' },
    { id: '#R-2025-00122', user: 'Carlos Gómez', route: 'Centro → Mall del Sol', status: 'Pendiente', statusClass: 'status-yellow', price: '$12.00', time: 'Hoy, 10:15 AM', img: 'https://i.pravatar.cc/150?u=3' },
    { id: '#R-2025-00121', user: 'Ana Torres', route: 'Centro → Terminal', status: 'Cancelada', statusClass: 'status-red', price: '$9.25', time: 'Hoy, 09:58 AM', img: 'https://i.pravatar.cc/150?u=4' },
];

const quejasData = [
    { id: 1, title: 'Servicio tardío', user: 'Juan Pérez', priority: 'Alta', priorityClass: 'priority-high', time: 'Hoy, 10:45 AM' },
    { id: 2, title: 'Conductor no profesional', user: 'María López', priority: 'Media', priorityClass: 'priority-medium', time: 'Hoy, 10:30 AM' },
    { id: 3, title: 'Problema con el pago', user: 'Carlos Gómez', priority: 'Baja', priorityClass: 'priority-low', time: 'Hoy, 10:15 AM' },
    { id: 4, title: 'Vehículo en mal estado', user: 'Ana Torres', priority: 'Alta', priorityClass: 'priority-high', time: 'Hoy, 09:58 AM' },
];

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

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
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
                    <a href="#" className="nav-item active"><LayoutDashboard size={20} /> <span>Dashboard</span></a>
                    <a href="#" className="nav-item"><Users size={20} /> <span>Usuarios</span><ChevronDown size={16} className="ml-auto" /></a>
                    <a href="#" className="nav-item"><UserCheck size={20} /> <span>Conductores</span></a>
                    <a href="#" className="nav-item"><Car size={20} /> <span>Vehículos</span></a>
                    <a href="#" className="nav-item"><Calendar size={20} /> <span>Reservas</span><ChevronDown size={16} className="ml-auto" /></a>
                    <a href="#" className="nav-item"><CreditCard size={20} /> <span>Pagos</span></a>
                    <a href="#" className="nav-item"><Bell size={20} /> <span>Notificaciones</span></a>
                    <a href="#" className="nav-item"><AlertCircle size={20} /> <span>Quejas</span></a>
                    <a href="#" className="nav-item"><ShieldCheck size={20} /> <span>Auditoría</span></a>
                    <a href="#" className="nav-item"><Settings size={20} /> <span>Configuración</span></a>
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
            <main className="main-content">
                {/* Header */}
                <header className="top-header">
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
                <div className="dashboard-scrollable">
                    <div className="page-header">
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
                    <div className="stats-grid">
                        <StatCard icon={<Users size={20} className="color-purple" />} title="Usuarios totales" value="1,248" change="12.5%" isPositive={true} subtitle="vs mes anterior" />
                        <StatCard icon={<Car size={20} className="color-green" />} title="Conductores aprobados" value="342" change="8.2%" isPositive={true} subtitle="vs mes anterior" />
                        <StatCard icon={<Car size={20} className="color-yellow" />} title="Vehículos pendientes" value="24" change="4.3%" isPositive={false} subtitle="vs mes anterior" />
                        <StatCard icon={<Calendar size={20} className="color-blue" />} title="Reservas este mes" value="1,896" change="15.7%" isPositive={true} subtitle="vs mes anterior" />
                        <StatCard icon={<AlertCircle size={20} className="color-red" />} title="Quejas pendientes" value="18" change="5.6%" isPositive={true} subtitle="vs mes anterior" />
                        <StatCard icon={<CreditCard size={20} className="color-green-dark" />} title="Pagos fallidos" value="7" change="2.1%" isPositive={true} subtitle="vs mes anterior" />
                    </div>

                    {/* Charts Grid */}
                    <div className="charts-grid">
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
                    <div className="lists-grid">
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
                                        {recientesData.map(item => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="activity-cell">
                                                        <div className={`icon-box ${item.colorClass}`}>{item.icon}</div>
                                                        <span>{item.title}</span>
                                                    </div>
                                                </td>
                                                <td>{item.user}</td>
                                                <td><span className="text-gray">{item.date}</span></td>
                                                <td><button className="btn-action">Ver</button></td>
                                            </tr>
                                        ))}
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
                                {reservasData.map((item, i) => (
                                    <div className="list-item-row" key={i}>
                                        <img src={item.img} alt={item.user} className="avatar-sm" />
                                        <div className="item-info">
                                            <div className="item-title">{item.id}</div>
                                            <div className="item-desc">{item.user}<br/><span className="text-gray">{item.route}</span></div>
                                        </div>
                                        <div className="item-status">
                                            <span className={`status-badge ${item.statusClass}`}>{item.status}</span>
                                        </div>
                                        <div className="item-price">
                                            <div className="price-val">{item.price}</div>
                                            <div className="price-time">{item.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quejas recientes */}
                        <div className="list-card">
                            <div className="list-header">
                                <h3>Quejas recientes</h3>
                                <button className="btn-view-all">Ver todas</button>
                            </div>
                            <div className="list-body">
                                {quejasData.map((item, i) => (
                                    <div className="list-item-row" key={i}>
                                        <div className="icon-box icon-red"><AlertCircle size={16} /></div>
                                        <div className="item-info">
                                            <div className="item-title font-semibold">{item.title}</div>
                                            <div className="item-desc text-gray">{item.user}</div>
                                        </div>
                                        <div className="item-priority">
                                            <span className={`priority-text ${item.priorityClass}`}>{item.priority}</span>
                                        </div>
                                        <div className="item-time text-gray text-sm">
                                            {item.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
