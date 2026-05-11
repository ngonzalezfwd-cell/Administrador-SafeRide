import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './PrivateRoute.css';

const PrivateRoute = ({ requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div id="pantallaAccesoCargando" className="contenedorCargando">
                <div id="textoAccesoCargando" className="indicadorCargando">Cargando...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/Login" replace />;
    }

    // Verificación de rol: acepta 'admin' y 'administrador'
    if (requiredRole && user.type !== 'admin' && user.type !== 'administrador') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
