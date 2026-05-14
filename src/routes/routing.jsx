import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute      from '../components/PrivateRoute/PrivateRoute';
import Login             from '../pages/LoginPages/Login';
import NuevoPassword     from '../pages/LoginPages/NuevoPassword';
import RecuperarPassword from '../pages/LoginPages/RecuperarPassword';
import Dashboard         from '../pages/DashboardPage/Dashboard';
import PerfilAdmin       from '../pages/PerfilAdminPage/PerfilAdmin';
import PasajerosPage     from '../pages/PasajerosPage/Pasajeros';
import ConductoresPage   from '../pages/ConductoresPage/ConductoresPage';
import VehiculosPage     from '../pages/VehiculosPage/Vehiculos';
import AdminLayout       from '../components/AdminLayout/AdminLayout';

/** Placeholder temporal para páginas aún no implementadas */
const PlaceholderPage = ({ title }) => (
  <div style={{
    padding: '40px',
    fontFamily: 'Inter, sans-serif',
    background: '#F8FAFC',
    minHeight: '100vh'
  }}>
    <h2 style={{ color: '#0F172A' }}>{title}</h2>
    <p style={{ color: '#64748B' }}>Página en construcción.</p>
  </div>
);

const Routing = () => (
  <Router>
    <Routes>
      {/* ── RUTAS PÚBLICAS ────────────────────────────────── */}
      <Route path="/login"                element={<Login />} />
      <Route path="/recuperarPassword"    element={<RecuperarPassword />} />
      <Route path="/nuevoPassword/:token" element={<NuevoPassword />} />

      {/* ── RUTAS PRIVADAS (ADMIN ONLY) ───────────────────── */}
      <Route element={<PrivateRoute requiredRole="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/inicio"         element={<Dashboard />} />
          <Route path="/miPerfil"       element={<PerfilAdmin />} />
          <Route path="/usuarios"       element={<PasajerosPage />} />
          <Route path="/conductores"    element={<ConductoresPage />} />
          <Route path="/vehiculos"      element={<VehiculosPage />} />
          <Route path="/reservas"       element={<PlaceholderPage title="Gestión de Reservas" />} />
          <Route path="/pagos"          element={<PlaceholderPage title="Historial de Pagos" />} />
          <Route path="/notificaciones" element={<PlaceholderPage title="Notificaciones del Sistema" />} />
          <Route path="/quejas"         element={<PlaceholderPage title="Atención de Quejas" />} />
          <Route path="/auditoria"      element={<PlaceholderPage title="Registros de Auditoría" />} />
          <Route path="/configuracion"  element={<PlaceholderPage title="Configuración" />} />
        </Route>
      </Route>

      {/* ── REDIRECCIONES ───────────────────────── */}
      <Route path="/"  element={<Navigate to="/inicio" replace />} />
      <Route path="*"  element={<Navigate to="/inicio" replace />} />
    </Routes>
  </Router>
);

export default Routing;

