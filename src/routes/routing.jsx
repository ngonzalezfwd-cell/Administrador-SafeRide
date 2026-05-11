import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute/PrivateRoute';
import Login from '../pages/Login/Login';
import DashboardAdmin from '../pages/DashboardAdmin/Dashboard';

const Routing = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Privadas (Admin Only) */}
        <Route element={<PrivateRoute requiredRole="admin" />}>
          <Route path="/Inicio" element={<DashboardAdmin />} />
          {/* Añade más rutas de admin aquí */}
        </Route>

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/Inicio" replace />} />
        <Route path="*" element={<Navigate to="/Inicio" replace />} />
      </Routes>
    </Router>
  );
};

export default Routing;
