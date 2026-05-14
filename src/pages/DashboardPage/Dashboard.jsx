import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import {
    LayoutDashboard, Users, UserCheck, Car, Calendar, CreditCard,
    Bell, AlertCircle, ShieldCheck, Settings, Search, LogOut,
    ArrowUpRight, ArrowDownRight, Menu, ChevronDown, User, HelpCircle,
    Activity, Zap
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Tooltip
} from 'recharts';
import './Dashboard.css';
import IconSafeRide from '../../imgs/IconSafeRide.png';
import DefaultImageUser from '../../imgs/DefaultImageUser.png';

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────────────────────────


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


// ──────────────────────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────


const Dashboard = () => {
    const { user, cerrarSesion } = useAuth();
    const location = useLocation();
    const [metricas, setMetricas] = useState({});
    const [Reservas, setReservas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [notificaciones, setNotificaciones] = useState([]);
    const [MenuAbierto, setMenuAbierto] = useState(false);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const ClickFueraMenu = (event) => {
            if (MenuAbierto && !event.target.closest('.menuDesplegableContainer')) {
                setMenuAbierto(false);
            }
        };

        document.addEventListener('mousedown', ClickFueraMenu);
        return () => document.removeEventListener('mousedown', ClickFueraMenu);
    }, [MenuAbierto]);

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
                console.error("Error al cargar datos del Panel:", error);
            }
        };
        CargarDatos();
    }, []);


    const ObtenerColorPorEstado = (status) => {

        switch (status?.toLowerCase()) {
            case 'completada': return 'status-green';
            case 'confirmada': return 'status-blue';
            case 'pendiente': return 'status-yellow';
            case 'cancelada': return 'status-red';
            default: return '';
        }
    };

    const totalUsuarios = metricas.totalUsers || 0;
    const totalConductores = metricas.totalDrivers || 0;
    const totalPasajeros = totalUsuarios > 0 ? totalUsuarios - totalConductores : 0;
    const totalViajes = metricas.totalRides || 0;
    const totalKM = metricas.totalKilometers || 0;
    const totalCarbon = metricas.totalCarbonSaved || 0;

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



    // ===================================================================
    // DASHBOARD PRINCIPAL
    // ===================================================================
    return (

        <div className="dashboardContent">


            {/* ========== SIDEBAR ========== */}
            <aside>

                <div className="sidebaLogo">
                    <img src={IconSafeRide} alt="Logo" className='IconSafeRide' />
                    <span>SafeRide Admin</span>
                </div>

                <nav className="sidebarNav">

                    <Link to="/inicio" className={`navItem ${location.pathname === '/inicio' ? 'active' : ''}`}><LayoutDashboard size={20} /> <span>Panel</span></Link>

                    <Link to="/usuarios" className={`navItem ${location.pathname === '/usuarios' ? 'active' : ''}`}><Users size={20} /> <span>Pasajeros</span></Link>

                    <Link to="/conductores" className={`navItem ${location.pathname === '/conductores' ? 'active' : ''}`}><UserCheck size={20} /> <span>Conductores</span></Link>

                    <Link to="/vehiculos" className={`navItem ${location.pathname === '/vehiculos' ? 'active' : ''}`}><Car size={20} /> <span>Vehículos</span></Link>

                    <Link to="/reservas" className={`navItem ${location.pathname === '/reservas' ? 'active' : ''}`}><Calendar size={20} /> <span>Reservas</span></Link>

                    <Link to="/pagos" className={`navItem ${location.pathname === '/pagos' ? 'active' : ''}`}><CreditCard size={20} /> <span>Pagos</span></Link>

                    <Link to="/notificaciones" className={`navItem ${location.pathname === '/notificaciones' ? 'active' : ''}`}><Bell size={20} /> <span>Notificaciones</span></Link>

                    <Link to="/quejas" className={`navItem ${location.pathname === '/quejas' ? 'active' : ''}`}><AlertCircle size={20} /> <span>Quejas</span></Link>

                    <Link to="/auditoria" className={`navItem ${location.pathname === '/auditoria' ? 'active' : ''}`}><ShieldCheck size={20} /> <span>Auditoría</span></Link>

                    <Link to="/configuracion" className={`navItem ${location.pathname === '/configuracion' ? 'active' : ''}`}><Settings size={20} /> <span>Configuración</span></Link>

                </nav>


                {/*  PERFIL */}
                <div className="sidebarPerfil">

                    <img src={getDefaultImagen(user?.profileImage)} alt="Admin" className="FotoPerfil" />

                    <div className="PerfilInfo">

                        <span className="NombrePerfil">{user?.name || 'Admin'}</span>
                        <span className="RolPerfil">Super Administrador</span>
                    </div>

                </div>
            </aside>


            {/* ========== CONTENIDO PRINCIPAL ========== */}
            <main>

                {/*  HEADER  */}
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
                            <span className="notificacionBadge">3</span>
                        </div>

                        <img src={getDefaultImagen(user?.profileImage)} alt="Admin" className="FotoPerfilHeader" />

                        <div className="menuDesplegableContainer">

                            <Menu
                                size={25}
                                className={`IconMenu ${MenuAbierto ? 'active' : ''}`}
                                onClick={() => setMenuAbierto(!MenuAbierto)}
                                style={{ cursor: 'pointer' }}
                            />

                            {MenuAbierto && (

                                <div className="menuDesplegable animate-slide-down">

                                    <div className="menuHeader">

                                        <img src={getDefaultImagen(user?.profileImage)} alt="Admin" className="menuUserAvatar" />

                                        <div className="menuUserInfo">

                                            <span className="menuUserName">{user?.name}</span>
                                            <span className="menuUserEmail">{user?.email}</span>
                                        </div>
                                    </div>

                                    <div className="menuDivider"></div>

                                    <Link to="/miPerfil" className="menuItem" onClick={() => setMenuAbierto(false)}>

                                        <User size={18} /> <span>Mi Perfil</span>
                                    </Link>

                                    <Link to="/configuracion" className="menuItem" onClick={() => setMenuAbierto(false)}>

                                        <Settings size={18} /> <span>Configuración</span>
                                    </Link>

                                    <Link to="/ayuda" className="menuItem" onClick={() => setMenuAbierto(false)}>

                                        <HelpCircle size={18} /> <span>Ayuda</span>
                                    </Link>

                                    <div className="menuDivider"></div>

                                    <button className="menuItem logout" onClick={() => { cerrarSesion(); setMenuAbierto(false); }}>

                                        <LogOut size={18} /> <span>Cerrar Sesión</span>
                                    </button>
                                </div>

                            )}
                        </div>

                    </div>

                </header>


                {/*  CUERPO  */}
                <div className="dashboardBody">

                    <div className="TituloPagina">

                        <div>
                            <h1>Panel Principal</h1>
                            <p>Resumen general de SafeRide</p>
                        </div>
                        <div className="botonFecha">
                            <Calendar size={16} />
                            <span>20 de mayo, 2025</span>
                            <ChevronDown size={14} />
                        </div>
                    </div>


                    {/*  1. ESTADISTICAS PRINCIPALES */}
                    <div className="graficosGrid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>

                        <TarjetaEstadistica icon={<Users size={20} className="color-purple" />} title="Usuarios Totales" value={totalUsuarios.toLocaleString()} change="12.5%" isPositive={true} subtitle="Crecimiento" />

                        <TarjetaEstadistica icon={<Calendar size={20} className="color-blue" />} title="Viajes Completados" value={totalViajes.toLocaleString()} change="15.7%" isPositive={true} subtitle="Éxito" />

                        <TarjetaEstadistica icon={<Car size={20} className="color-yellow" />} title="KM Totales" value={`${totalKM.toLocaleString()} km`} change="4.3%" isPositive={true} subtitle="Alcance de red" />

                        <TarjetaEstadistica icon={<AlertCircle size={20} className="color-green" />} title="Carbono Ahorrado" value={`${totalCarbon.toFixed(1)} kg`} change="5.6%" isPositive={true} subtitle="Sostenibilidad" />

                    </div>


                    {/*  2. GRAFICOS  */}
                    <div className="graficoGrid">

                        <div className="graficos graficoFilaCompleta">

                            <div className="graficoHeader">

                                <h3>Reservas por día</h3>

                                <div className="selectorMini">Últimos 7 días <ChevronDown size={14} /></div>
                            </div>

                            <div className="graficoBody">

                                <ResponsiveContainer width="100%" height="100%">

                                    <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>

                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />

                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />

                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />

                                        <RechartsTooltip />
                                        <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="graficos">

                            <div className="graficoHeader">
                                <h3>Distribución de pagos</h3>
                            </div>

                            <div className="graficoBody contenedorTorta">

                                <div className="envolturaTorta">

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

                                    <div className="textoCentroTorta">

                                        <span className="etiquetaTotal">Total</span>

                                        <span className="valorTotal">1,896</span>
                                    </div>
                                </div>

                                <div className="leyendaTorta">

                                    {pieDataPagos.map((item, i) => (

                                        <div key={i} className="elementoLeyenda">

                                            <div className="indicadorLeyenda" style={{ backgroundColor: item.color }}></div>

                                            <div className="detallesLeyenda">

                                                <span className="nombreLeyenda">{item.name}</span>
                                                <span className="valorLeyenda">{item.value} <span className="porcentajeLeyenda">({((item.value / 1896) * 100).toFixed(1)}%)</span></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="graficos">

                            <div className="graficoHeader">

                                <h3>Usuarios por rol</h3>
                            </div>

                            <div className="graficoBody contenedorTorta">

                                <div className="envolturaTorta">

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

                                    <div className="textoCentroTorta">

                                        <span className="valorTotal">{totalUsuarios.toLocaleString()}</span>
                                        <span className="etiquetaTotal">Total</span>
                                    </div>
                                </div>

                                <div className="leyendaTorta">

                                    {pieDataRoles.map((item, i) => (

                                        <div key={i} className="elementoLeyenda">

                                            <div className="indicadorLeyenda" style={{ backgroundColor: item.color }}></div>

                                            <div className="detallesLeyenda">

                                                <span className="nombreLeyenda">{item.name}</span>
                                                <span className="valorLeyenda">{item.value} <span className="porcentajeLeyenda">({((item.value / 1248) * 100).toFixed(1)}%)</span></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*  3. MONITOREO Y ALERTAS (NUEVO) */}
                    <div id="seccionMonitoreoAlertas" className="graficoGrid">
                        <div className="graficos graficoFilaCompleta tarjetaMonitoreo">
                            <div className="graficoHeader">
                                <div className="tituloConIcono">
                                    <Activity size={20} className="color-green-dark" />
                                    <h3>Centro de Monitoreo en Tiempo Real</h3>
                                </div>
                                <div className="indicadorEnVivo">
                                    <span className="puntoPulso"></span>
                                    Sincronizado
                                </div>
                            </div>
                            <div className="cuerpoMonitoreo">
                                <div id="mapaSimulado" className="mapaPlaceholder">
                                    <div className="marcadorVehiculo v1" style={{ top: '30%', left: '40%' }}>
                                        <Car size={16} />
                                        <span className="etiquetaVehiculo">SafeRide #102</span>
                                    </div>
                                    <div className="marcadorVehiculo v2" style={{ top: '60%', left: '70%' }}>
                                        <Car size={16} />
                                        <span className="etiquetaVehiculo">SafeRide #045</span>
                                    </div>
                                    <div className="marcadorVehiculo v3" style={{ top: '45%', left: '20%' }}>
                                        <Car size={16} />
                                        <span className="etiquetaVehiculo">SafeRide #089</span>
                                    </div>
                                    <div className="overlayMapa">
                                        <p>Visualizando 8 vehículos activos en la zona metropolitana</p>
                                    </div>
                                </div>
                                <div className="estadisticasRapidas">
                                    <div className="itemMiniEstadistica">
                                        <span className="valorMini">{metricas.totalRides || 12}</span>
                                        <span className="etiquetaMini">Viajes en curso</span>
                                    </div>
                                    <div className="itemMiniEstadistica">
                                        <span className="valorMini">98%</span>
                                        <span className="etiquetaMini">Cumplimiento</span>
                                    </div>
                                    <div className="itemMiniEstadistica">
                                        <span className="valorMini">4.2 min</span>
                                        <span className="etiquetaMini">Espera prom.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="panelAlertasCriticas" className="graficos tarjetaAlertas">
                            <div className="graficoHeader">
                                <div className="tituloConIcono">
                                    <AlertCircle size={20} className="color-red" />
                                    <h3>Alertas de Seguridad (SOS)</h3>
                                </div>
                            </div>
                            <div className="cuerpoAlertas">
                                <div className="alertaItem critica">
                                    <div className="alertaIcono"><Zap size={16} /></div>
                                    <div className="alertaInfo">
                                        <h4>Botón SOS Activado</h4>
                                        <p>Conductor: Roberto M. · Ruta 14-B</p>
                                        <span className="tiempoAlerta">Hace 2 min</span>
                                    </div>
                                    <button className="botonAtender">Atender</button>
                                </div>
                                <div className="alertaItem advertencia">
                                    <div className="alertaIcono"><AlertCircle size={16} /></div>
                                    <div className="alertaInfo">
                                        <h4>Retraso por Tráfico Alto</h4>
                                        <p>Zona Norte · 5 funcionarios afectados</p>
                                        <span className="tiempoAlerta">Hace 15 min</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="panelMetasVerdes" className="graficos tarjetaMetas">
                            <div className="graficoHeader">
                                <div className="tituloConIcono">
                                    <ShieldCheck size={20} className="color-green" />
                                    <h3>Meta Mensual SafeRide</h3>
                                </div>
                            </div>
                            <div className="cuerpoMeta">
                                <div className="progresoMeta">
                                    <div className="barraProgreso">
                                        <div className="progresoLleno" style={{ width: '75%' }}></div>
                                    </div>
                                    <span className="porcentajeMeta">75%</span>
                                </div>
                                <p className="descripcionMeta">Faltan <strong>12.5 kg</strong> de CO₂ para alcanzar la meta de sostenibilidad institucional.</p>
                            </div>
                        </div>
                    </div>

                    <div className="cuadriculaListas">

                        <div className="tarjetaLista">

                            <div className="encabezadoLista">

                                <h3>Reservas recientes</h3>

                                <Link to="/reservas" className='botonVerTodos'><span>Ver todas</span></Link>
                            </div>

                            <div className="cuerpoLista">

                                {Reservas.slice(0, 4).map((item, i) => (

                                    <div className="filaElemento" key={item._id || i}>

                                        <img src={getDefaultImagen(item.passenger_id?.profileImage)} alt={item.passenger_id?.name || 'Pasajero'} className="avatarPequeno" />

                                        <div className="infoElemento">

                                            <div className="tituloElemento">#{item._id?.substring(0, 8) || 'R-0000'}</div>
                                            <div className="descripcionElemento">{item.passenger_id?.name || 'Desconocido'}<br /><span className="textoGris">Destino: {item.ride_id?.destination?.address || 'Pendiente'}</span></div>
                                        </div>

                                        <div className="estadoElemento">

                                            <span className={`insigniaEstado ${ObtenerColorPorEstado(item.status)}`}>{item.status || 'Pendiente'}</span>
                                        </div>

                                        <div className="precioElemento">

                                            <div className="valorPrecio">${item.ride_id?.price || '0.00'}</div>
                                            <div className="tiempoPrecio">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}

                                {Reservas.length === 0 && (
                                    <div className="textoGris">No hay reservas recientes</div>
                                )}
                            </div>
                        </div>

                        <div className="tarjetaLista">

                            <div className="encabezadoLista">

                                <h3>Usuarios recientes</h3>

                                <Link to="/usuarios" className='botonVerTodos'><span>Ver todas</span></Link>
                            </div>

                            <div className="cuerpoLista">

                                {usuarios.slice(0, 4).map((item, i) => (

                                    <div className="filaElemento" key={item._id || i}>

                                        <img src={getDefaultImagen(item.profileImage)} alt={item.name} className="avatarPequeno" />

                                        <div className="infoElemento">

                                            <div className="tituloElemento fuenteNegrita">{item.name}</div>
                                            <div className="descripcionElemento textoGris">{item.email}</div>
                                        </div>

                                        <div className="prioridadElemento">

                                            <span className={`textoPrioridad prioridadBaja`}>{item.type}</span>
                                        </div>

                                        <div className="tiempoElemento textoGris textoChico">

                                            {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}


                                {usuarios.length === 0 && (
                                    <div className="textoGris">No hay usuarios recientes</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
};

export default Dashboard;
