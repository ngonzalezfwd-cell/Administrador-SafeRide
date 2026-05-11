import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute/PrivateRoute';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/DashboardAdmin/Dashboard';

const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif' }}>
    <h2>{title}</h2>
    <p style={{ color: '#64748B' }}>Página en blanco configurada para el futuro.</p>
  </div>
);

const Routing = () => {

  return (
    <Router>
      <Routes>

        {/*  Rutas Públicas */}
        <Route path="/Login" element={<Login />} />
        
        {/* Rutas Privadas (Admin Only) */}
        <Route element={<PrivateRoute requiredRole="admin" />}>
          <Route path="/Inicio" element={<Dashboard />} />
          <Route path="/Usuarios" element={<PlaceholderPage title="Gestión de Usuarios" />} />
          <Route path="/Conductores" element={<PlaceholderPage title="Gestión de Conductores" />} />
          <Route path="/Vehiculos" element={<PlaceholderPage title="Gestión de Vehículos" />} />
          <Route path="/Reservas" element={<PlaceholderPage title="Gestión de Reservas" />} />
          <Route path="/Pagos" element={<PlaceholderPage title="Historial de Pagos" />} />
          <Route path="/Notificaciones" element={<PlaceholderPage title="Notificaciones del Sistema" />} />
          <Route path="/Quejas" element={<PlaceholderPage title="Atención de Quejas" />} />
          <Route path="/Auditoria" element={<PlaceholderPage title="Registros de Auditoría" />} />
          <Route path="/Configuracion" element={<PlaceholderPage title="Configuración" />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/Inicio" replace />} />
        <Route path="*" element={<Navigate to="/Inicio" replace />} />
      </Routes>
    </Router>
  );
};

export default Routing;
