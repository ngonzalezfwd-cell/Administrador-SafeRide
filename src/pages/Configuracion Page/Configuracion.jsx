import React, { useState } from 'react';
import { 
    Settings, Key, CreditCard, Palette, Info, 
    Wrench, Save, X, Upload, Globe, Mail 
} from 'lucide-react';
import './Configuracion.css';

const Configuracion = () => {
    const [tabActiva, setTabActiva] = useState('general');
    const [modoMantenimiento, setModoMantenimiento] = useState(false);

    // Estado del formulario
    const [ajustes, setAjustes] = useState({
        nombreSitio: 'SafeRide Global',
        emailSoporte: 'soporte@saferide.com',
        zonaHoraria: '(GMT-05:00) Eastern Time',
        colorPrimario: '#2563EB',
        colorAcento: '#10B981',
        colorError: '#EF4444'
    });

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setAjustes(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="contenedorConfiguracion">
            <div className="cabeceraConfiguracion">
                <h1>Configuración del Sistema</h1>
                <p>Gestiona los ajustes globales, integraciones y la identidad visual de SafeRide.</p>
            </div>

            <div className="cuerpoConfiguracion">
                {/* Sidebar de Navegación de Ajustes */}
                <div className="sidebarOpciones">
                    <div 
                        className={`itemOpcion ${tabActiva === 'general' ? 'activo' : ''}`}
                        onClick={() => setTabActiva('general')}
                    >
                        <Settings size={20} />
                        <span>Ajustes Generales</span>
                    </div>
                    <div 
                        className={`itemOpcion ${tabActiva === 'seguridad' ? 'activo' : ''}`}
                        onClick={() => setTabActiva('seguridad')}
                    >
                        <Key size={20} />
                        <span>Seguridad y API</span>
                    </div>
                    <div 
                        className={`itemOpcion ${tabActiva === 'pagos' ? 'activo' : ''}`}
                        onClick={() => setTabActiva('pagos')}
                    >
                        <CreditCard size={20} />
                        <span>Pasarelas de Pago</span>
                    </div>
                    <div 
                        className={`itemOpcion ${tabActiva === 'apariencia' ? 'activo' : ''}`}
                        onClick={() => setTabActiva('apariencia')}
                    >
                        <Palette size={20} />
                        <span>Apariencia</span>
                    </div>
                </div>

                {/* Contenido Dinámico */}
                <div className="contenidoAjustes">
                    {tabActiva === 'general' && (
                        <>
                            {/* Identidad General */}
                            <div className="tarjetaConfiguracion">
                                <div className="tarjetaTitulo">
                                    <h3>Identidad General</h3>
                                    <Info size={18} className="infoIcono" />
                                </div>
                                <div className="tarjetaCuerpo">
                                    <div className="gridFormulario">
                                        <div className="grupoInput">
                                            <label>Nombre del Sistema</label>
                                            <input 
                                                type="text" 
                                                name="nombreSitio"
                                                className="inputEstilizado" 
                                                value={ajustes.nombreSitio}
                                                onChange={manejarCambio}
                                            />
                                        </div>
                                        <div className="grupoInput">
                                            <label>Email de Soporte</label>
                                            <input 
                                                type="email" 
                                                name="emailSoporte"
                                                className="inputEstilizado" 
                                                value={ajustes.emailSoporte}
                                                onChange={manejarCambio}
                                            />
                                        </div>
                                        <div className="grupoInput fullWidth">
                                            <label>Zona Horaria del Sistema</label>
                                            <select 
                                                name="zonaHoraria"
                                                className="selectEstilizado"
                                                value={ajustes.zonaHoraria}
                                                onChange={manejarCambio}
                                            >
                                                <option>(GMT-05:00) Eastern Time</option>
                                                <option>(GMT-06:00) Central Time</option>
                                                <option>(GMT-04:00) Atlantic Time</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Estado de la Plataforma */}
                            <div className="tarjetaConfiguracion">
                                <div className="tarjetaTitulo">
                                    <h3>Estado de la Plataforma</h3>
                                </div>
                                <div className="tarjetaCuerpo">
                                    <div className="filaEstado">
                                        <div className="infoEstado">
                                            <div className="iconoEstadoWrap">
                                                <Wrench size={24} />
                                            </div>
                                            <div className="textoEstado">
                                                <h4>Modo Mantenimiento</h4>
                                                <p>Poner la plataforma fuera de línea para actualizaciones programadas.</p>
                                            </div>
                                        </div>
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                checked={modoMantenimiento}
                                                onChange={() => setModoMantenimiento(!modoMantenimiento)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Branding y Temas */}
                            <div className="tarjetaConfiguracion">
                                <div className="tarjetaTitulo">
                                    <h3>Imagen de Marca y Temas</h3>
                                </div>
                                <div className="tarjetaCuerpo">
                                    <div className="seccionBranding">
                                        <div className="grupoInput">
                                            <label>Color Primario</label>
                                            <div className="colorPickerWrap">
                                                <div className="indicadorColor" style={{ background: ajustes.colorPrimario }}></div>
                                                <input 
                                                    type="text" 
                                                    name="colorPrimario"
                                                    value={ajustes.colorPrimario} 
                                                    onChange={manejarCambio}
                                                />
                                            </div>
                                        </div>
                                        <div className="grupoInput">
                                            <label>Color de Acento</label>
                                            <div className="colorPickerWrap">
                                                <div className="indicadorColor" style={{ background: ajustes.colorAcento }}></div>
                                                <input 
                                                    type="text" 
                                                    name="colorAcento"
                                                    value={ajustes.colorAcento} 
                                                    onChange={manejarCambio}
                                                />
                                            </div>
                                        </div>
                                        <div className="grupoInput">
                                            <label>Resaltado de Errores</label>
                                            <div className="colorPickerWrap">
                                                <div className="indicadorColor" style={{ background: ajustes.colorError }}></div>
                                                <input 
                                                    type="text" 
                                                    name="colorError"
                                                    value={ajustes.colorError} 
                                                    onChange={manejarCambio}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grupoInput">
                                        <label>Logo del Sistema</label>
                                        <div className="uploadLogoWrap">
                                            <div className="iconoUploadWrap">
                                                <Upload size={24} />
                                            </div>
                                            <div className="textoUpload">
                                                <h5>Haz clic para subir el logo</h5>
                                                <p>SVG, PNG o JPG (Máx 2MB)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {tabActiva !== 'general' && (
                        <div className="tarjetaConfiguracion">
                            <div className="tarjetaCuerpo" style={{ textAlign: 'center', padding: '60px' }}>
                                <Wrench size={48} style={{ color: '#94A3B8', marginBottom: '16px' }} />
                                <h3>Sección en Desarrollo</h3>
                                <p>Estamos trabajando para traerte más opciones de configuración en {tabActiva}.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Acciones Finales */}
            <div className="pieAcciones">
                <button className="botonDescartar">Descartar Cambios</button>
                <button className="botonGuardar">
                    <Save size={18} />
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
};

export default Configuracion;
