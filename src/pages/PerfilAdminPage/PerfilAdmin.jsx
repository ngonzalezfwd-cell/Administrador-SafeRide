import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { InsertarEnCloudinary } from '../../services/cloudinary';
import DefaultImageUser from '../../imgs/DefaultImageUser.png';
import api from '../../services/api';
import { Link } from 'react-router-dom';

// DISEÑOS E ICONOS
import {
    User, FileUser, Mail, Building2, Check, Users,
    ArrowLeft, Camera, X, Phone, Car, Leaf, MapPin
} from 'lucide-react';
import './PerfilAdmin.css';
import Swal from 'sweetalert2';

// ────────────────────────────────────────────────────────────────────────────────────────────────────
// COMPONENTE: PERFIL DE ADMINISTRADOR
// ────────────────────────────────────────────────────────────────────────────────────────────────────

const PerfilAdmin = () => {
    const { user, setUser } = useAuth();
    const [empresas, setEmpresas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [EditActivo, setEditActivo] = useState(false);
    const [nuevaFoto, setNuevaFoto] = useState(null);
    const [previewFoto, setPreviewFoto] = useState(null);
    const [estadisticas, setEstadisticas] = useState({
        totalRides: 0,
        totalDrivers: 0,
        totalPassengers: 0,
        totalCarbonSaved: 0
    });
    const [notificaciones, setNotificaciones] = useState([]);

    // Estado para los datos del perfil
    const [datosPerfil, setDatosPerfil] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        company: '',
        status: ''
    });

    // Opciones de configuración (Aun simuladas)
    const [ajustes, setAjustes] = useState({
        alertasEmergencia: true,
        reportesDiarios: true,
        monitoreoTiempoReal: false,
        notificacionesEmail: true
    });

    useEffect(() => {
        if (user) {
            setDatosPerfil({
                name: user.name || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone ? `${String(user.phone).slice(0, 4)}-${String(user.phone).slice(4, 8)}` : '',
                company: user.company || '',
                status: user.isActive || ''
            });
            setPreviewFoto(user.profileImage || DefaultImageUser);
        }
    }, [user]);

    useEffect(() => {
        // Cargar lista de empresas
        api.get('/users/companies')
            .then(res => setEmpresas(res.data.data || []))
            .catch(err => console.error(err));

        // Cargar estadísticas globales
        api.get('/metrics/global')
            .then(res => {
                if (res.data.success && res.data.data) {
                    setEstadisticas(res.data.data);
                }
            })
            .catch(err => console.error("Error al cargar estadísticas:", err));

        // Cargar actividad reciente (notificaciones)
        api.get('/notifications')
            .then(res => {
                if (res.data.success && Array.isArray(res.data.data)) {
                    setNotificaciones(res.data.data.slice(0, 3));
                }
            })
            .catch(err => console.error("Error al cargar actividad:", err));
    }, []);

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
        const { name, value } = e.target;

        if (name === 'phone') {
            // Eliminar cualquier caracter que no sea dígito
            const soloNumeros = value.replace(/\D/g, '');
            let valorFormateado = soloNumeros;

            // Aplicar formato 0000-0000
            if (soloNumeros.length > 4) {
                valorFormateado = `${soloNumeros.slice(0, 4)}-${soloNumeros.slice(4, 8)}`;
            }

            setDatosPerfil({
                ...datosPerfil,
                [name]: valorFormateado
            });
        } else {
            setDatosPerfil({
                ...datosPerfil,
                [name]: value
            });
        }
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

            // ───────────────── VALIDACIONES PREVIAS ─────────────────
            // Validar si hubo algún cambio real
            const phoneVal = user.phone ? `${String(user.phone).slice(0, 4)}-${String(user.phone).slice(4, 8)}` : '';
            if (datosPerfil.name == user.name && datosPerfil.phone == phoneVal && datosPerfil.company == (user.company || '') && !nuevaFoto) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Sin Cambios',
                    text: 'No se han realizado cambios en el perfil.',
                    confirmButtonText: 'De acuerdo',
                    confirmButtonColor: '#2563EB'
                });
                setCargando(false);
                return;
            }

            if (datosPerfil.name.trim() === '') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'El nombre no puede estar vacío',
                    confirmButtonText: 'De acuerdo',
                    confirmButtonColor: '#2563EB'
                });
                setCargando(false);
                return;
            }

            if (!/^[a-zA-Z\s]+$/.test(datosPerfil.name)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'El nombre solo puede contener letras.',
                    confirmButtonText: 'De acuerdo',
                    confirmButtonColor: '#2563EB'
                });
                setCargando(false);
                return;
            }

            const phoneLimpio = (datosPerfil.phone || '').replace(/-/g, '');
            if (phoneLimpio && !/^\d+$/.test(phoneLimpio)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'El teléfono solo puede contener números.',
                    confirmButtonText: 'De acuerdo',
                    confirmButtonColor: '#2563EB'
                });
                setCargando(false);
                return;
            }

            // 1. Subir a Cloudinary si hay una nueva foto
            if (nuevaFoto) {
                profileImageUrl = await InsertarEnCloudinary(nuevaFoto);
            }

            // 2. Guardar en el backend (Limpiamos el teléfono de guiones antes de enviar)
            const datosParaEnviar = {
                name: datosPerfil.name,
                profileImage: profileImageUrl
            };
            
            // Solo enviar phone si tiene valor válido (8 dígitos)
            if (phoneLimpio && /^\d{8}$/.test(phoneLimpio)) {
                datosParaEnviar.phone = phoneLimpio;
            }
            // Solo enviar company si tiene valor
            if (datosPerfil.company && datosPerfil.company.trim() !== '') {
                datosParaEnviar.company = datosPerfil.company;
            }

            const response = await api.put('/users/profile', datosParaEnviar);

            if (response.data.success) {

                if (setUser) setUser(response.data.data);

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
                                <FileUser size={16} />
                                <span>{datosPerfil.username}</span>
                            </div>

                            <div className="detalleItem">
                                <Mail size={16} />
                                <span>{datosPerfil.email}</span>

                            </div>

                            <div className="detalleItem">
                                <Phone size={16} />
                                <span>{datosPerfil.phone || "Sin teléfono"}</span>
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

                            <div className="contenedorUsername">

                                <div className="grupoInput">
                                    <label className="labelInput">Nombre de Usuario</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            name="username"
                                            className="inputEstilizado"
                                            value={datosPerfil.username}
                                            onChange={manejarCambioPerfil}
                                            style={{ paddingLeft: '40px', width: '100%' }}
                                        />
                                        <FileUser size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94A3B8' }} />
                                    </div>
                                </div>
                            </div>

                            <div className="cuadriculaCampos">

                                <div className="grupoInput">
                                    <label className="labelInput">Nombre Completo</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            name="name"
                                            className="inputEstilizado"
                                            value={datosPerfil.name}
                                            onChange={manejarCambioPerfil}
                                            style={{ paddingLeft: '40px', width: '100%' }}
                                        />
                                        <User size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94A3B8' }} />
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
            <div className="filaEstadisticas">

                <div className="tarjetaEstadistica">

                    <div className="estadisticaEncabezado">

                        <div className="iconoEstadistica"><MapPin size={20} /></div>
                    </div>

                    <p className="estadisticaEtiqueta">Viajes Corporativos</p>
                    <h3 className="estadisticaValor">{(estadisticas.totalRides || 0).toLocaleString()}</h3>
                </div>

                <div className="tarjetaEstadistica">

                    <div className="estadisticaEncabezado">

                        <div className="iconoEstadistica"><Car size={20} /></div>
                    </div>

                    <p className="estadisticaEtiqueta">Conductores Registrados</p>
                    <h3 className="estadisticaValor">{estadisticas.totalDrivers || 0}</h3>
                </div>

                <div className="tarjetaEstadistica">

                    <div className="estadisticaEncabezado">

                        <div className="iconoEstadistica"><Users size={20} /></div>
                    </div>

                    <p className="estadisticaEtiqueta">Funcionarios Beneficiados</p>
                    <h3 className="estadisticaValor">{(estadisticas.totalPassengers || 0).toLocaleString()}</h3>
                </div>

                <div className="tarjetaEstadistica">

                    <div className="estadisticaEncabezado">

                        <div className="iconoEstadistica" style={{ background: '#ecfdf5', color: '#10b981' }}><Leaf size={20} /></div>
                    </div>

                    <p className="estadisticaEtiqueta">CO₂ Ahorrado (kg)</p>
                    <h3 className="estadisticaValor">{estadisticas.totalCarbonSaved?.toFixed(1) || 0}</h3>
                </div>
            </div>

        </div>
    );
};

export default PerfilAdmin;
