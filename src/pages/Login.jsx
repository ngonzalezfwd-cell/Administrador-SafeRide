import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="glass-card animate-fade-in" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2rem' }}>SafeRide Admin</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
                        <input 
                            type="email" 
                            className="input-field" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@saferide.com"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
                        <input 
                            type="password" 
                            className="input-field" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {error && <p style={{ color: 'var(--error-color)', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</p>}
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Entrar al Sistema
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
