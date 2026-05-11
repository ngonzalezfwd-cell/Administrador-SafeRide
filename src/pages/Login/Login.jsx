import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div id="paginaLogin" className="contenedorLogin">
            <div id="formularioLoginContenedor" className="glass-card animate-fade-in tarjetaLogin">
                <h2 className="tituloLogin">SafeRide Admin</h2>
                <form id="formularioLogin" onSubmit={handleSubmit}>
                    <div id="grupoEmail" className="grupoEmail">
                        <label htmlFor="campoEmail" className="etiquetaCampo">Email</label>
                        <input
                            id="campoEmail"
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@saferide.com"
                            required
                        />
                    </div>
                    <div id="grupoContrasena" className="grupoContrasena">
                        <label htmlFor="campoContrasena" className="etiquetaCampo">Contraseña</label>
                        <input
                            id="campoContrasena"
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {error && (
                        <p id="mensajeErrorLogin" className="mensajeError">{error}</p>
                    )}
                    <button
                        id="botonEntrar"
                        type="submit"
                        className="btn-primary botonAcceso"
                    >
                        Entrar al Sistema
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
