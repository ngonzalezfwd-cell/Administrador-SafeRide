import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/auth/me');
            
            if (response.data.success) {
                setUser(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                const { accessToken, user } = response.data.data;
                localStorage.setItem('token', accessToken);
                setUser(user);
                return { success: true };
            }
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Error al iniciar sesión' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
