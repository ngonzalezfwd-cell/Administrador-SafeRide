import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, Car, Calendar, CreditCard,
  Bell, AlertCircle, ShieldCheck, Settings, ChevronDown, Menu, Search
} from 'lucide-react';
import IconSafeRide from '../../imgs/IconSafeRide.png';
import DefaultImageUser from '../../imgs/DefaultImageUser.png';
import { Toaster } from 'react-hot-toast';
import './AdminLayout.css';

// ───────────────────────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────

const AdminLayout = () => {
  const { user, cerrarSesion } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usuariosOpen, setUsuariosOpen] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const getDefaultImagen = (img) => img || DefaultImageUser;


  // =================================================
  // ASIDE Y HEADER
  // =================================================
  return (
    <div className="dashboardContent">
      <Toaster position="top-right" />

      {/* --- SIDEBAR PERSISTENTE --- */}
      <aside className={sidebarOpen ? 'open' : ''}>

        <div className="sidebaLogo">

          <img src={IconSafeRide} alt="Icono" className='IconSafeRide' />
          <span>SafeRide</span>
        </div>

        <nav className="sidebarNav">

          <Link to="/inicio" className={`navItem ${location.pathname === '/inicio' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <LayoutDashboard size={20} /> <span>Panel</span>
          </Link>

          {/* SUB-MENÚ USUARIOS */}
          <div className="navGroup">
            <div 
              className={`navItem ${location.pathname.includes('/usuarios') || location.pathname.includes('/conductores') ? 'active' : ''}`} 
              onClick={() => setUsuariosOpen(!usuariosOpen)}
              style={{ cursor: 'pointer' }}
            >
              <Users size={20} /> 
              <span style={{ flex: 1 }}>Usuarios</span>
              <ChevronDown size={16} style={{ transform: usuariosOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
            </div>

            {usuariosOpen && (
              <div className="subPanel">
                <Link to="/usuarios" className={`subNavItem ${location.pathname === '/usuarios' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                  <Users size={18} /> <span>Pasajeros</span>
                </Link>
                <Link to="/conductores" className={`subNavItem ${location.pathname === '/conductores' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                  <UserCheck size={18} /> <span>Conductores</span>
                </Link>
              </div>
            )}
          </div>

          <Link to="/vehiculos" className={`navItem ${location.pathname === '/vehiculos' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <Car size={20} /> <span>Vehículos</span>
          </Link>

          <Link to="/reservas" className={`navItem ${location.pathname === '/reservas' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <Calendar size={20} /> <span>Reservas</span>
          </Link>
          
          <Link to="/pagos" className={`navItem ${location.pathname === '/pagos' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <CreditCard size={20} /> <span>Pagos</span>
          </Link>
          <Link to="/notificaciones" className={`navItem ${location.pathname === '/notificaciones' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <Bell size={20} /> <span>Notificaciones</span>
          </Link>
          <Link to="/quejas" className={`navItem ${location.pathname === '/quejas' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <AlertCircle size={20} /> <span>Quejas</span>
          </Link>
          <Link to="/auditoria" className={`navItem ${location.pathname === '/auditoria' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <ShieldCheck size={20} /> <span>Auditoría</span>
          </Link>
          <Link to="/configuracion" className={`navItem ${location.pathname === '/configuracion' ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <Settings size={20} /> <span>Configuración</span>
          </Link>
        </nav>

        <div className="sidebarPerfil">

          <img src={getDefaultImagen(user?.profileImage)} alt="Admin" className="FotoPerfil" />

          <div className="PerfilInfo">
            
            <span className="NombrePerfil">{user?.name || 'Admin'}</span>
            
            <span className="RolPerfil">Super Administrador</span>
          </div>
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <main>
        <header>
          <div className="headerIzquierdo">
            <div className="buscadorContainer">
              <Search size={18} className="buscadorIcono" />
              <input type="text" placeholder="Buscar en el sistema..." />
            </div>
          </div>

          <div className="headerDerecho">
            <div className="userInfo">
              <span>Bienvenido/a, {user?.name || 'Admin'}</span>
            </div>

            <div className="userInfo">
              <img src={getDefaultImagen(user?.profileImage)} alt="Admin" className="FotoPerfilHeader" />
            </div>

            <div className="notificacionCampana">
              <Bell size={24} />
              <span className="notificacionBadge"></span>
            </div>

            <div className="menuIconContainer" style={{ position: 'relative' }}>
              <Menu 
                size={24} 
                className="IconMenu" 
                onClick={() => setMenuAbierto(!menuAbierto)} 
                style={{ cursor: 'pointer' }}
              />

              {menuAbierto && (
                <div className="menuDesplegable animate-slide-down" style={{ top: '100%', right: 0, marginTop: '10px' }}>
                  <div className="menuHeader">
                    <img src={getDefaultImagen(user?.profileImage)} alt="Admin" className="menuUserAvatar" />
                    <div className="menuUserInfo">
                      <span className="menuUserName">{user?.name}</span>
                      <span className="menuUserEmail">{user?.email}</span>
                    </div>
                  </div>
                  <div className="menuDivider"></div>
                  <Link to="/miPerfil" className="menuItem" onClick={() => setMenuAbierto(false)}>
                    <Users size={18} /> <span>Mi Perfil</span>
                  </Link>
                  <Link to="/configuracion" className="menuItem" onClick={() => setMenuAbierto(false)}>
                    <Settings size={18} /> <span>Configuración</span>
                  </Link>
                  <div className="menuDivider"></div>
                  <button className="menuItem logout" onClick={() => { cerrarSesion(); setMenuAbierto(false); }}>
                    <AlertCircle size={18} /> <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="dashboardBody">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
