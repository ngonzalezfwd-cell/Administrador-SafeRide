import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div style={{ padding: '40px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 className="animate-fade-in">Dashboard Administrativo</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Hola, <strong>{user?.name}</strong></span>
                    <button onClick={logout} className="btn-primary" style={{ background: 'var(--error-color)' }}>
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div className="glass-card animate-fade-in" style={{ padding: '25px', animationDelay: '0.1s' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Usuarios Totales</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '10px' }}>1,248</p>
                </div>
                <div className="glass-card animate-fade-in" style={{ padding: '25px', animationDelay: '0.2s' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Viajes Hoy</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '10px', color: 'var(--primary-color)' }}>42</p>
                </div>
                <div className="glass-card animate-fade-in" style={{ padding: '25px', animationDelay: '0.3s' }}>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>CO2 Ahorrado</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '10px', color: 'var(--accent-color)' }}>850kg</p>
                </div>
            </div>

            <div className="glass-card animate-fade-in" style={{ marginTop: '40px', padding: '30px', animationDelay: '0.4s' }}>
                <h2 style={{ marginBottom: '20px' }}>Próximos pasos</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Puedes empezar a añadir tablas de usuarios, gestión de conductores y reportes de métricas utilizando los endpoints documentados en SafeRideAPIDocs.md.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
