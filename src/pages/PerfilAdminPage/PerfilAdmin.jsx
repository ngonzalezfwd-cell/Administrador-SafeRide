import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadToCloudinary } from '../../services/cloudinary';
import DefaultImageUser from '../../imgs/DefaultImageUser.png';
import api from '../../services/api';
import { Link } from 'react-router-dom';

// DISEÑOS E ICONOS
import { 
    User, Mail, Building2, Check, BarChart2, Zap, Shield, Users, 
    ArrowLeft, Camera, X, Phone
} from 'lucide-react';
import './PerfilAdmin.css';
import Swal from 'sweetalert2';

// ────────────────────────────────────────────────────────────────────────────────────────────────────
// COMPONENTE: PERFIL DE ADMINISTRADOR
// ────────────────────────────────────────────────────────────────────────────────────────────────────

const PerfilAdmin = () => {
    const { user, setUser } = useAuth();
    const [cargando, setCargando] = useState(false);
    const [EditActivo, setEditActivo] = useState(false);
    const [nuevaFoto, setNuevaFoto] = useState(null);
    const [previewFoto, setPreviewFoto] = useState(null);
    
    // Estado para los datos del perfil
    const [datosPerfil, setDatosPerfil] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: ''
    });

    // Opciones de configuración (Aun simuladas)
    const [ajustes, setAjustes] = useState({
        dobleFactor: true,
        notificacionesEmail: true,
        tiempoSesion: '30 Minutos'
    });

    useEffect(() => {
        if (user) {
            setDatosPerfil({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                company: user.company || '',
                status: user.isActive || ''
            });
            setPreviewFoto(user.profileImage || DefaultImageUser);
        }
    }, [user]);

    const manejarSeleccionFoto = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNuevaFoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewFoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const manejarCambioPerfil = (e) => {
        setDatosPerfil({
            ...datosPerfil,
            [e.target.name]: e.target.value
        });
    };

    // -----------------------------------------------
    const toggleAjuste = (key) => {
        setAjustes({
            ...ajustes,
            [key]: !ajustes[key]
        });
    };
    // -----------------------------------------------

    const guardarCambios = async () => {
        setCargando(true);
        try {
            let profileImageUrl = user.profileImage;

            // 1. Subir a Cloudinary si hay una nueva foto
            if (nuevaFoto) {
                profileImageUrl = await uploadToCloudinary(nuevaFoto);
            }

            // 2. Guardar en el backend
            const response = await api.put('/users/profile', {
                ...datosPerfil,
                profileImage: profileImageUrl
            });


            // ───────────────── VALIDACIONES DEL POST ─────────────────

            if (datosPerfil.name == user.name && datosPerfil.email == user.email && datosPerfil.phone == user.phone && datosPerfil.company == user.company && datosPerfil.status == user.isActive && !nuevaFoto) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Sin Cambios',
                    text: 'No se han realizado cambios en el perfil.',
                    confirmButtonText: 'De acuerdo',
                    confirmButtonColor: '#2563EB'
                });
                return;
            }

            if (!datosPerfil.name || !datosPerfil.email) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Nombre y correo son obligatorios',
                    confirmButtonText: 'De acuerdo',
                    confirmButtonColor: '#2563EB'
                });
                return;
            }

            if (response.data.success) {

                if (setUser) setUser(PerfilCambiado);

                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'Tu perfil se ha actualizado correctamente.',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#ffffff',
                    color: '#0F172A',
                    iconColor: '#2563EB'
                });
                setEditActivo(false);
                setNuevaFoto(null);
            }
        } catch (error) {
            console.error('Error al guardar cambios:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudieron guardar los cambios',
                confirmButtonColor: '#2563EB'
            });
        } finally {
            setCargando(false);
        }
    };

    if (!user) return <div className="contenedorPerfil">Cargando...</div>;


    // ─────────────────────────────────────────────────────────────────────────────────────────────────
    // ────────────────────────────────────────────

    /* ==================================================
    *  INFORMACIÓN DEL USUARIO
    *  ================================================== */ 

    return (
        <div className="contenedorPerfil">
            
            {/* ENLACE PARA REGRESAR AL PANEL */}
            <Link to="/inicio" className="enlaceVolver">
                <ArrowLeft size={18} />
                Volver al Panel
            </Link>

            {/* INFORMACIÓN DEL USUARIO */}
            <div className="tarjetaPrincipal">

                <div className="contenedorIzquierdo">

                    <div className="contenedorUser">
                        <img 
                            src={user.profileImage || DefaultImageUser} 
                            alt="Avatar" 
                            className="imagenUser" 
                        />
                        <div className="checkVerificado">
                            <Check size={14} />
                        </div>
                    </div>

                    <div className="conteinerInfo">

                        <h1 id="nombreAdmin">
                            {datosPerfil.name}
                            {datosPerfil.status === false ? (
                                <span className="insigniaEstado" style={{ background: '#ffcbcbff', color: '#832e2eff' }}>Inactivo</span>
                            ) : (
                                <span className="insigniaEstado" style={{ background: '#cbffddff', color: '#2e834eff' }}>Activo</span>
                            )}
                        </h1>

                        <p className="PuestoAdmin">Administrador Senior</p>

                        <div className="DetallesInfo">

                            <div className="detalleItem">
                                <Mail size={16} />
                                <span>{datosPerfil.email}</span>

                            </div>
                            <div className="detalleItem">
                                <Building2 size={18} />
                                <span>{datosPerfil.company || "Sin empresa"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => setEditActivo(true)} 
                    className="botonEditPerfil"
                >
                    Editar Perfil
                </button>
            </div>

            {/* MODAL DE EDICIÓN */}
            {/* ─────────────────────────────────────────────────────────────── */}

            {EditActivo && (
                <div className="overlayModal" onClick={(e) => e.target.id === 'modalEdicion' && setEditActivo(false)}>

                    <div className="modalContenido">

                        <div className="encabezadoTarjeta">
                            <div>

                                <h2>Editar Perfil</h2>
                                <p>Actualiza tu información personal y foto de perfil</p>
                            </div>
                            
                            <button onClick={() => setEditActivo(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="contenidoTarjeta">

                            {/* Sección de Foto */}
                            <div className="seccionFotoModal">

                                <div className="contenedorFoto">

                                    <img 
                                        src={previewFoto || DefaultImageUser} 
                                        alt="Preview" 
                                        className="foto" 
                                    />
                                    <label htmlFor="inputFoto" className="btnCambiarFoto">
                                        <Camera size={18} />
                                        <input 
                                            type="file" 
                                            id="inputFoto" 
                                            style={{ display: 'none' }} 
                                            onChange={manejarSeleccionFoto}
                                            accept="image/jpeg, image/png, image/jpg, image/gif, image/webp, image/avif"
                                        />
                                    </label>
                                </div>

                                <p>Formatos permitidos: JPEG, JPG, PNG, GIF, WEBP, AVIF.</p>
                            </div>

                            {/* Campos del Formulario */}
                            <div className="cuadriculaCampos">

                                <div className="grupoInput">

                                    <label className="labelInput">Nombre Completo</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        className="inputEstilizado" 
                                        value={datosPerfil.name} 
                                        onChange={manejarCambioPerfil} 
                                    />
                                </div>

                                <div className="grupoInput">

                                    <label className="labelInput">Correo Electrónico</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        className="inputEstilizado" 
                                        value={datosPerfil.email} 
                                        onChange={manejarCambioPerfil} 
                                    />
                                </div>

                                <div className="grupoInput">

                                    <label className="labelInput">Teléfono</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="text" 
                                            name="phone" 
                                            className="inputEstilizado" 
                                            value={datosPerfil.phone} 
                                            onChange={manejarCambioPerfil} 
                                            style={{ paddingLeft: '40px' }}
                                        />
                                        <Phone size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94A3B8' }} />
                                    </div>
                                </div>

                                <div className="grupoInput">
                                    
                                    <label className="labelInput">Empresa</label>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="text" 
                                            name="company" 
                                            className="inputEstilizado" 
                                            value={datosPerfil.company} 
                                            onChange={manejarCambioPerfil} 
                                            style={{ paddingLeft: '40px' }}
                                        />
                                        <Building2 size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94A3B8' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pieTarjeta">
                            <button className="botonCancelar" onClick={() => setEditActivo(false)}>
                                Cancelar
                            </button>
                            <button className="botonGuardar" onClick={guardarCambios} disabled={cargando}>
                                {cargando ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FILA DE ESTADÍSTICAS */}
            <div id="filaEstadisticas" className="filaEstadisticas">
                <div className="tarjetaEstadistica">
                    <div className="estadisticaEncabezado">
                        <div className="iconoEstadistica"><BarChart2 size={20} /></div>
                        <span className="cambioPositivo">+12%</span>
                    </div>
                    <p className="estadisticaEtiqueta">Total de Acciones</p>
                    <h3 className="estadisticaValor">14,282</h3>
                </div>
                <div className="tarjetaEstadistica">
                    <div className="estadisticaEncabezado">
                        <div className="iconoEstadistica"><Zap size={20} /></div>
                        <span className="cambioPositivo" style={{ color: '#64748B' }}>Estable</span>
                    </div>
                    <p className="estadisticaEtiqueta">Tiempo en Línea</p>
                    <h3 className="estadisticaValor">99.98%</h3>
                </div>
                <div className="tarjetaEstadistica">
                    <div className="estadisticaEncabezado">
                        <div className="iconoEstadistica"><Shield size={20} /></div>
                        <span className="cambioPositivo" style={{ color: '#EF4444' }}>Alto</span>
                    </div>
                    <p className="estadisticaEtiqueta">Puntaje de Seguridad</p>
                    <h3 className="estadisticaValor">98/100</h3>
                </div>
                <div className="tarjetaEstadistica">
                    <div className="estadisticaEncabezado">
                        <div className="iconoEstadistica"><Users size={20} /></div>
                        <span className="cambioPositivo" style={{ color: '#64748B' }}>Gestionados</span>
                    </div>
                    <p className="estadisticaEtiqueta">Usuarios Gestionados</p>
                    <h3 className="estadisticaValor">1,240</h3>
                </div>
            </div>

            {/* CUERPO DEL PERFIL */}
            <div className="cuerpoPerfil">
                <div className="columnaIzquierda">
                    <div className="tarjetaFormulario">
                        <div className="encabezadoTarjeta">
                            <h2>Seguridad y Ajustes de Cuenta</h2>
                            <p>Configura tus preferencias de privacidad y operativas.</p>
                        </div>
                        <div className="contenidoTarjeta">
                            <div className="itemAjuste">
                                <div className="infoAjuste">
                                    <h4>Autenticación de Dos Factores</h4>
                                    <p>Añade una capa extra de seguridad a tu cuenta de administrador.</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" checked={ajustes.dobleFactor} onChange={() => toggleAjuste('dobleFactor')} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="itemAjuste">
                                <div className="infoAjuste">
                                    <h4>Notificaciones por Correo</h4>
                                    <p>Recibe alertas sobre eventos críticos del sistema por correo electrónico.</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" checked={ajustes.notificacionesEmail} onChange={() => toggleAjuste('notificacionesEmail')} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="columnaDerecha">
                    <div className="tarjetaActividad">
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Actividad Reciente</h2>
                        <div className="lineaTiempo">
                            <div className="eventoTiempo azul">
                                <div className="infoEvento">
                                    <h4>Claves del sistema actualizadas</h4>
                                    <p>Protocolo de Seguridad Global v4.2</p>
                                    <span className="tagTiempo">HACE 2 HORAS</span>
                                </div>
                            </div>
                            <div className="eventoTiempo rojo">
                                <div className="infoEvento">
                                    <h4>IP no autorizada bloqueada</h4>
                                    <p>192.168.1.105 - Fallos de inicio de sesión repetidos</p>
                                    <span className="tagTiempo">HACE 2 DÍAS</span>
                                </div>
                            </div>
                        </div>
                        <button className="botonVerLogs">Ver Todos los Registros</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilAdmin;
