/**
 * routing.jsx
 *
 * Configuración central de rutas del Admin Panel SafeRide.
 * Rutas protegidas: requieren token válido + rol 'admin'
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute  from '../components/PrivateRoute/PrivateRoute';
import Login         from '../pages/Login/Login';
import Dashboard     from '../pages/DashboardAdmin/Dashboard';
import PasajerosPage from '../pages/PasajerosPage/Pasajeros';
import ConductoresPage from '../pages/ConductoresPage/ConductoresPage';

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

      {/* ── Rutas Públicas ────────────────────────────────── */}
      <Route path="/Login" element={<Login />} />

      {/* ── Rutas Privadas (Admin Only) ───────────────────── */}
      <Route element={<PrivateRoute requiredRole="admin" />}>
        <Route path="/Inicio"         element={<Dashboard />} />
        <Route path="/Usuarios"       element={<PasajerosPage />} />
        <Route path="/Conductores"    element={<ConductoresPage />} />
        <Route path="/Vehiculos"      element={<PlaceholderPage title="Gestión de Vehículos" />} />
        <Route path="/Reservas"       element={<PlaceholderPage title="Gestión de Reservas" />} />
        <Route path="/Pagos"          element={<PlaceholderPage title="Historial de Pagos" />} />
        <Route path="/Notificaciones" element={<PlaceholderPage title="Notificaciones del Sistema" />} />
        <Route path="/Quejas"         element={<PlaceholderPage title="Atención de Quejas" />} />
        <Route path="/Auditoria"      element={<PlaceholderPage title="Registros de Auditoría" />} />
        <Route path="/Configuracion"  element={<PlaceholderPage title="Configuración" />} />
      </Route>

      {/* ── Redirección por defecto ───────────────────────── */}
      <Route path="/"  element={<Navigate to="/Inicio" replace />} />
      <Route path="*"  element={<Navigate to="/Inicio" replace />} />

    </Routes>
  </Router>
);

export default Routing;
