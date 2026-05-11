import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';

const Routing = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas Privadas (Admin Only) */}
        <Route element={<PrivateRoute requiredRole="admin" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Añade más rutas de admin aquí */}
        </Route>

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default Routing;
