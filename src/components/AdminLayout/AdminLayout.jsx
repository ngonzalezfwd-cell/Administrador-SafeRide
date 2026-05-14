import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, Car, Calendar, CreditCard,
  Bell, AlertCircle, ShieldCheck, Settings, ChevronDown, Menu
} from 'lucide-react';
import IconSafeRide from '../../imgs/IconSafeRide.png';
import DefaultImageUser from '../../imgs/DefaultImageUser.png';
import { Toaster } from 'react-hot-toast';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getDefaultImagen = (img) => img || DefaultImageUser;

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
          <ChevronDown size={16} className="FlechaPerfil" onClick={logout} style={{ cursor: 'pointer' }} />
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <main>
        <header>
          {/* El contenido de la izquierda del header (buscador) se inyectará desde cada página si es necesario */}
          <div className="headerIzquierdo" id="header-dynamic-content">
            {/* Espacio para contenido dinámico */}
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
              <img src={getDefaultImagen(user?.profileImage)} alt="Admin" className="FotoPerfilHeader" />
            </div>
            <Menu size={22} className="IconMenu" onClick={() => setSidebarOpen(!sidebarOpen)} />
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
