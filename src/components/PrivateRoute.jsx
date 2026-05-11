import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner">Cargando...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role check: supports both 'admin' and 'administrador' as discussed
    if (requiredRole && user.type !== 'admin' && user.type !== 'administrador') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
