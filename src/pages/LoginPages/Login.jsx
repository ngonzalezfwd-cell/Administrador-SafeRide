import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ChevronRight } from 'lucide-react';
import './Login.css';
import IconSafeRide from '../../imgs/IconSafeRide.png';
import Swal from 'sweetalert2';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const iniciarSesion = async (e) => {
        e.preventDefault();
        setError('');

        if (email.trim() === "" || password.trim() === "") {
            Swal.fire({
                icon: "error",
                title: "Campos vacíos",
                text: "Por favor, ingresa tu correo electrónico y contraseña",
                confirmButtonColor: "#2563EB",
                confirmButtonText: "Aceptar"
            });
            return;
        }

        try {
            const result = await login(email, password);

            if (result.success) {

                // VERIFICACIÓN DE ROL
                if (result.user.type !== 'admin') {
                    localStorage.removeItem('token'); 
                    Swal.fire({
                        icon: "error",
                        title: "Acceso Denegado",
                        text: "No tienes permisos de administrador. Serás redirigido fuera de este panel por seguridad.",
                        confirmButtonColor: "#EF4444",
                        confirmButtonText: "Entendido"
                    }).then(() => {
                        // Intenta regresar a la página anterior, si no hay historial, va al inicio
                        if (window.history.length > 1) {
                            window.history.back();
                        } else {
                            window.location.href = '/';
                        }
                    });
                    return;
                }

                // SI ES ADMIN: Éxito
                Swal.fire({
                    icon: "success",
                    title: "Inicio de sesión exitoso",
                    text: "Serás redirigido al panel de administrador.",
                    confirmButtonColor: "#2563EB",
                    confirmButtonText: "Entendido",
                    timer: 2000,
                    timerProgressBar: true
                }).then(() => {
                    navigate('/inicio');
                });

            } else {
                setError(result.message);
                Swal.fire({
                    icon: "error",
                    title: "Credenciales Incorrectas",
                    text: result.message || "Asegúrate de que el correo y la contraseña sean correctos.",
                    confirmButtonColor: "#EF4444"
                });
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setError('Error al iniciar sesión');
        }
    };



    // ===================================================================
    // VISTA DE LOGIN
    // ===================================================================
    return (
        <div className="pantallaLogin">
            
            {/* SECCIÓN IZQUIERDA: IMAGEN (ESPACIO EN BLANCO) */}
            <div className="ImagenLateral">

                <div className="capaSuperpuestaImagen">

                    <div className="marcaSeguridad">

                        <img src={IconSafeRide} alt="Icono SafeRide" width="200px"/>

                        <h1>SafeRide</h1>
                        <p>Gestión de transporte institucional seguro y eficiente.</p>
                    </div>
                </div>
            </div>


            {/* SECCIÓN DERECHA: FORMULARIO */}
            <div className="seccionFormularioLateral">

                <div className="contenedorCajaLogin animacionEntradaSuave">

                    <div className="encabezadoLogin">

                        <h2>¡Bienvenido de nuevo!</h2>
                        <p>Ingresa tus credenciales para acceder al panel administrativo.</p>
                    </div>

                    {/* INICIO DEL FORMULARIO */}
                    <section autoComplete="off" className="formularioLoginEstilo">

                        <div id="grupoEmail" className="grupoEntradaLogin">

                            <label htmlFor="campoEmail">Correo Electrónico</label>
                            <div className="envolturaEntrada">
                                <Mail size={18} className="iconoEntrada" />
                                <input
                                    id="campoEmail"
                                    type="email"
                                    placeholder="ejemplo@saferide.cr"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div id="grupoPassword" className="grupoEntradaLogin">

                            <label htmlFor="campoPassword">Contraseña</label>
                            <div className="envolturaEntrada">
                                <Lock size={18} className="iconoEntrada" />
                                <input
                                    id="campoPassword"
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <button type="submit" onClick={iniciarSesion} className="botonEnviarLogin">
                            <span>Entrar al Panel</span>
                            <ChevronRight size={20} />
                        </button>

                        <div className="enlacesPieLogin">
                            <a href="#olvido">¿Olvidaste tu contraseña?</a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Login;
