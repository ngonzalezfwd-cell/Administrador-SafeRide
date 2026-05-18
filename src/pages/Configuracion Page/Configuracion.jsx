import React, { useState } from 'react';
import { Building, ShieldCheck, Lock, Palette, Mail, Phone, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import SupportImage from '../../imgs/SupportConfig.png';
import './Configuracion.css';

const Configuracion = () => {
    const { theme, setTheme } = useTheme();

    // Formularios y switches
    const [ajustes, setAjustes] = useState({
        nombreSitio: 'SafeRide Transport',
        zonaHoraria: '(GMT-06:00) Central Time',
        emailSoporte: 'support@saferide.com'
    });

    const [accesos, setAccesos] = useState({
        dominioVerificado: true,
        modoPrivacidad: true,
        transitoInvitados: false
    });

    const manejarCambioAjustes = (e) => {
        const { name, value } = e.target;
        setAjustes(prev => ({ ...prev, [name]: value }));
    };

    const toggleAcceso = (key) => {
        setAccesos(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="contenedorConfiguracion">
            <div className="cabeceraConfiguracion">
                <h1>Configuración del Sistema</h1>
                <p>Gestiona la red de transporte de tu organización y la identidad del sistema. Usa estos controles para asegurar una experiencia segura y fluida para todo el equipo.</p>
            </div>

            <div className="cuerpoConfiguracion">
                
                {/* ───────────────────────────────────────────────────────── */}
                {/* FILA 1: Identidad & Salud del Sistema */}
                
                <div className="tarjetaConfiguracion">
                    <div className="tarjetaTitulo">
                        <div className="iconoTituloWrap bg-celeste">
                            <Building size={20} className="iconoCeleste" />
                        </div>
                        <h3>Identidad del Sistema</h3>
                    </div>
                    <div className="tarjetaCuerpo flexCol">
                        <div className="gridFormularioDosCols">
                            <div className="grupoInput">
                                <label>Nombre del Sistema</label>
                                <input 
                                    type="text" 
                                    name="nombreSitio"
                                    className="inputEstilizado" 
                                    value={ajustes.nombreSitio}
                                    onChange={manejarCambioAjustes}
                                />
                            </div>
                            <div className="grupoInput">
                                <label>Zona Horaria</label>
                                <select 
                                    name="zonaHoraria"
                                    className="selectEstilizado"
                                    value={ajustes.zonaHoraria}
                                    onChange={manejarCambioAjustes}
                                >
                                    <option>(GMT-05:00) Eastern Time</option>
                                    <option>(GMT-06:00) Central Time</option>
                                    <option>(GMT-04:00) Atlantic Time</option>
                                </select>
                            </div>
                        </div>
                        <div className="grupoInput mT-16">
                            <label>Email de Contacto</label>
                            <input 
                                type="email" 
                                name="emailSoporte"
                                className="inputEstilizado" 
                                value={ajustes.emailSoporte}
                                onChange={manejarCambioAjustes}
                            />
                        </div>
                        <button className="botonGuardarPrimario mT-24">
                            Guardar Cambios
                        </button>
                    </div>
                </div>

                <div className="tarjetaConfiguracion">
                    <div className="tarjetaTitulo">
                        <div className="iconoTituloWrap bg-verdeClaro">
                            <ShieldCheck size={20} className="iconoVerde" />
                        </div>
                        <h3>Estado del Sistema</h3>
                    </div>
                    <div className="tarjetaCuerpo flexCol">
                        <div className="listaEstado">
                            <div className="itemEstado">
                                <div className="estadoIzquierda">
                                    <div className="puntoVerde"></div>
                                    <span>Conectividad de Red</span>
                                </div>
                                <span className="badgeEstado optimo">Óptima</span>
                            </div>
                            <div className="itemEstado">
                                <div className="estadoIzquierda">
                                    <div className="puntoVerde"></div>
                                    <span>Servicios API</span>
                                </div>
                                <span className="badgeEstado estable">Estable</span>
                            </div>
                            <div className="itemEstado">
                                <div className="estadoIzquierda">
                                    <div className="puntoVerde"></div>
                                    <span>Base de Datos</span>
                                </div>
                                <span className="badgeEstado sincronizada">Sincronizada</span>
                            </div>
                        </div>

                        <div className="bannerInfoSistema">
                            <Info size={20} />
                            <p>La plataforma funciona correctamente para los 1,240 miembros activos en las tres regiones.</p>
                        </div>
                    </div>
                </div>

                {/* ───────────────────────────────────────────────────────── */}
                {/* FILA 2: Acceso & Temas */}
                
                <div className="tarjetaConfiguracion">
                    <div className="tarjetaTitulo">
                        <div className="iconoTituloWrap bg-naranjaClaro">
                            <Lock size={20} className="iconoNaranja" />
                        </div>
                        <h3>Acceso a la Plataforma</h3>
                    </div>
                    <div className="tarjetaCuerpo flexCol gap-24">
                        <div className="itemSwitch">
                            <div className="infoSwitch">
                                <h4>Acceso a Dominio Verificado</h4>
                                <p>Solo los empleados con correo corporativo pueden unirse.</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={accesos.dominioVerificado}
                                    onChange={() => toggleAcceso('dominioVerificado')}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="itemSwitch">
                            <div className="infoSwitch">
                                <h4>Modo Privacidad de Datos</h4>
                                <p>Oculta el teléfono de los empleados hasta confirmar el viaje.</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={accesos.modoPrivacidad}
                                    onChange={() => toggleAcceso('modoPrivacidad')}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="itemSwitch">
                            <div className="infoSwitch">
                                <h4>Tránsito de Invitados</h4>
                                <p>Permitir acceso temporal para socios o visitas externas.</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={accesos.transitoInvitados}
                                    onChange={() => toggleAcceso('transitoInvitados')}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="tarjetaConfiguracion">
                    <div className="tarjetaTitulo">
                        <div className="iconoTituloWrap bg-grisClaro">
                            <Palette size={20} className="iconoGris" />
                        </div>
                        <h3>Temas Visuales</h3>
                    </div>
                    <div className="tarjetaCuerpo flexCol">
                        <p className="textoDescriptivo">Personaliza la apariencia de la plataforma para ajustarla a la identidad corporativa y preferencias de los usuarios.</p>
                        
                        <div className="gridTemas">
                            <div className="temaOpcion" onClick={() => setTheme('estandar')}>
                                <div className={`cajaColor bg-temaEstandar ${theme === 'estandar' ? 'seleccionado' : ''}`}></div>
                                <span>Estándar</span>
                            </div>
                            <div className="temaOpcion" onClick={() => setTheme('gris')}>
                                <div className={`cajaColor bg-temaGris ${theme === 'gris' ? 'seleccionado' : ''}`}></div>
                                <span>Gris</span>
                            </div>
                            <div className="temaOpcion" onClick={() => setTheme('oscuro')}>
                                <div className={`cajaColor bg-temaOscuro ${theme === 'oscuro' ? 'seleccionado' : ''}`}></div>
                                <span>Oscuro</span>
                            </div>
                            <div className="temaOpcion" onClick={() => setTheme('salvia')}>
                                <div className={`cajaColor bg-temaSalvia ${theme === 'salvia' ? 'seleccionado' : ''}`}></div>
                                <span>Salvia</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ───────────────────────────────────────────────────────── */}
                {/* FILA 3: Soporte Técnico Dedicado (Ancho completo) */}

                <div className="tarjetaConfiguracion fullWidth cardSoporteDedicado">
                    <div className="soporteImagenWrap">
                        <img src={SupportImage} alt="Equipo de Soporte SafeRide" />
                    </div>
                    <div className="soporteContenido">
                        <h2>Soporte Dedicado al Staff</h2>
                        <p>Nuestra misión principal es asegurar que cada empleado tenga un viaje seguro y libre de estrés. Si necesitas ayuda con integraciones avanzadas del sistema, nuestro equipo de soporte interno está disponible de 8 AM a 6 PM de Lunes a Viernes.</p>
                        
                        <div className="contactoSoporteList">
                            <div className="contactoItem">
                                <Mail size={18} />
                                <span>soporte@saferide.cr</span>
                            </div>
                            <div className="contactoItem">
                                <Phone size={18} />
                                <span>Ext. 4455</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Configuracion;
