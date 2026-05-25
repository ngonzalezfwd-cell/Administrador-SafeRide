import { ShieldCheck, Palette, Mail, Phone, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import SupportImage from '../../imgs/SupportConfig.png';
import './Configuracion.css';

const Configuracion = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="contenedorConfiguracion">
            <div className="cabeceraConfiguracion">
                <h1>Configuración del Sistema</h1>
                <p>Gestiona la red de transporte de tu organización y la identidad del sistema. Usa estos controles para asegurar una experiencia segura y fluida para todo el equipo.</p>
            </div>

            <div className="cuerpoConfiguracion">

                {/* ───────────────────────────────────────────────────────── */}
                {/* FILA 1: Estado del Sistema & Temas Visuales */}

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
                {/* FILA 2: Soporte Técnico Dedicado (Ancho completo) */}

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
                                <span>saferidefwd@gmail.com</span>
                            </div>
                            <div className="contactoItem">
                                <Phone size={18} />
                                <span>71041281</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Configuracion;
