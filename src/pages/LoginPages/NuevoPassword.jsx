import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, ChevronRight, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './Login.css';

const NuevoPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [cargando, setCargando] = useState(false);

    const manejarRestablecimiento = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas no coinciden.', confirmButtonColor: '#EF4444' });
            return;
        }

        if (password.length < 8) {
            Swal.fire({ icon: 'warning', title: 'Seguridad', text: 'La contraseña debe tener al menos 8 caracteres.', confirmButtonColor: '#F59E0B' });
            return;
        }

        setCargando(true);
        try {
            await api.post('/auth/reset-password', { token, password });
            Swal.fire({
                icon: 'success',
                title: '¡Contraseña Actualizada!',
                text: 'Ya puedes acceder con tu nueva clave.',
                confirmButtonColor: '#2563EB'
            }).then(() => navigate('/login'));
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'El enlace ha expirado o no es válido.', confirmButtonColor: '#EF4444' });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="pantallaLogin">
            <div className="seccionFormularioLateral">
                <div className="contenedorCajaLogin animacionEntradaSuave">
                    <div className="encabezadoLogin">
                        <CheckCircle size={40} color="#2563EB" style={{ marginBottom: '15px' }} />
                        <h2>Nueva Clave</h2>
                        <p>Crea una contraseña segura para tu cuenta.</p>
                    </div>

                    <form className="formularioLoginEstilo" onSubmit={manejarRestablecimiento}>
                        <div className="grupoEntradaLogin">
                            <label>Nueva Contraseña</label>
                            <div className="envolturaEntrada">
                                <Lock size={18} className="iconoEntrada" />
                                <input
                                    type="password"
                                    placeholder="Mínimo 8 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grupoEntradaLogin">
                            <label>Confirmar Contraseña</label>
                            <div className="envolturaEntrada">
                                <Lock size={18} className="iconoEntrada" />
                                <input
                                    type="password"
                                    placeholder="Repite tu contraseña"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="botonEnviarLogin" disabled={cargando}>
                            <span>{cargando ? 'Guardando...' : 'Cambiar Contraseña'}</span>
                            {!cargando && <ChevronRight size={20} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NuevoPassword;
