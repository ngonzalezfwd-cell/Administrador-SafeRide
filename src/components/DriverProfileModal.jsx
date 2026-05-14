import React, { useState, useEffect } from 'react';
import { 
  X, Save, Upload, User, Truck, Mail, AtSign, Calendar, 
  Users, Palette, CheckCircle, AlertCircle, MapPin, Clock, 
  History, Navigation, Info, ExternalLink 
} from 'lucide-react';
import driverService from '../services/driverService';
import passengerService from '../services/passengerService';
import api from '../services/api';
import rideService from '../services/rideService';
import { toast } from 'react-hot-toast';
import './DriverProfileModal.css';

const CAR_DATA = {
  Acura: ['MDX', 'RDX', 'TLX', 'TSX', 'Integra'],
  Audi: ['A3', 'A4', 'Q3', 'Q5', 'Q7'],
  BMW: ['Serie 1', 'Serie 3', 'Serie 5', 'X1', 'X3', 'X5'],
  BYD: ['S1 Pro', 'Yuan Plus', 'Tang', 'Song Plus', 'F3', 'Dolphin'],
  Chery: ['Tiggo 2 Pro', 'Tiggo 4 Pro', 'Tiggo 7 Pro', 'Tiggo 8 Pro', 'QQ'],
  Chevrolet: ['Colorado', 'Tracker', 'Spark', 'Aveo', 'Captiva', 'Groove'],
  Citroen: ['C3', 'C4 Cactus', 'C5 Aircross', 'Berlingo', 'Jumpy'],
  Daihatsu: ['Terios', 'Bego', 'Sirion', 'Delta', 'Gran Max'],
  Dodge: ['RAM 1500', 'RAM 2500', 'Journey', 'Durango', 'Dakota'],
  Fiat: ['Strada', 'Fiorino', 'Pulse', 'Uno', '500', 'Fastback'],
  Ford: ['Ranger', 'Everest', 'Explorer', 'EcoSport', 'F-150', 'Focus'],
  Geely: ['Coolray', 'Azkarra', 'Okavango', 'GX3 Pro', 'Geometry C'],
  GMC: ['Sierra', 'Acadia', 'Terrain', 'Yukon', 'Canyon'],
  GreatWall: ['Wingle 5', 'Wingle 7', 'Poer', 'Haval M4', 'Voleex'],
  Haval: ['H6', 'Jolion', 'H2', 'H9', 'M4'],
  Honda: ['CR-V', 'Civic', 'HR-V', 'Accord', 'Fit', 'Pilot'],
  Hyundai: ['Tucson', 'Accent Blue', 'Elantra', 'Creta', 'Grand i10', 'Santa Fe', 'Kona'],
  Isuzu: ['D-Max', 'MU-X', 'NLR', 'NPR', 'FTR'],
  JAC: ['T8', 'JS2', 'JS4', 'S2', 'Sunray', 'E10X'],
  Jeep: ['Grand Cherokee', 'Wrangler', 'Compass', 'Renegade', 'Cherokee'],
  Jetour: ['Dashing', 'X70 Plus', 'X70', 'X90 Plus'],
  Kia: ['Sportage', 'Picanto', 'Rio', 'Seltos', 'Sorento', 'Cerato', 'Soluto'],
  LandRover: ['Defender', 'Discovery', 'Range Rover Evoque', 'Range Rover Sport'],
  Lexus: ['RX', 'NX', 'UX', 'GX', 'IS'],
  Mazda: ['CX-5', 'Mazda 3', 'CX-3', 'CX-30', 'BT-50', 'CX-9'],
  MercedesBenz: ['GLC', 'GLE', 'Clase C', 'Clase A', 'Clase E', 'Vito'],
  MG: ['ZS', 'HS', 'MG3', 'MG5', 'Marvel R', 'MG4'],
  Mitsubishi: ['Montero Sport', 'L200', 'Outlander', 'ASX', 'Eclipse Cross', 'Montero'],
  Nissan: ['Frontier', 'Sentra', 'Qashqai', 'Kicks', 'Versa', 'X-Trail', 'March'],
  Peugeot: ['2008', '3008', '5008', '208', 'Partner', 'Landtrek'],
  Renault: ['Kwid', 'Duster', 'Oroch', 'Stepway', 'Koleos', 'Logan'],
  Subaru: ['XV', 'Forester', 'Outback', 'Impreza', 'Crosstrek'],
  Suzuki: ['Vitara', 'Swift', 'Jimny', 'S-Presso', 'Ertiga', 'Dzire', 'Baleno'],
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X'],
  Toyota: ['Hilux', 'Corolla', 'Yaris', 'RAV4', 'Prado', 'Fortuner', 'Rush', 'Agya'],
  Volkswagen: ['Amarok', 'Tiguan', 'Jetta', 'T-Cross', 'Gol', 'Taos', 'Nivus'],
  Volvo: ['XC40', 'XC60', 'XC90', 'S60', 'V40', 'C40'],
};

const BRANDS = Object.keys(CAR_DATA);
const COLORS = ['Blanco', 'Negro', 'Gris', 'Plateado', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Café', 'Beige', 'Vinilado'];
const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

const COMPANIES = [
  'Intel', 'Cargill', 'Deloitte', 'Citi', 'Experian', '3M',
  'DHL', 'Bill Gosling Outsourcing (BGO)', 'WeWork Costa Rica',
  'Concentrix', 'Nestlé Costa Rica'
];

const SCHEDULES = [
  '08:00 - 17:00', '07:00 - 16:00', '06:00 - 15:00',
  '22:00 - 06:00 (Nocturno)', 'Rotativo', 'Fines de semana'
];

const generateTempPassword = () => "SafeRide@" + Math.random().toString(36).slice(-4) + Math.floor(Math.random() * 10);

const DriverProfileModal = ({ isOpen, onClose, driver, onSaved, userType = 'conductor', initialTab = 'info' }) => {
  const isEditMode = Boolean(driver);
  const isPassenger = userType === 'pasajero';
  const [form, setForm] = useState({
    name: '', username: '', email: '', phone: '',
    company: COMPANIES[0], work_schedule: SCHEDULES[0],
    vehicle: {
      brand: BRANDS[0],
      model: CAR_DATA[BRANDS[0]][0],
      license_plate: '',
      color: COLORS[0],
      year: YEARS[0],
      capacity: 4
    }
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('idle');
  const [emailStatus, setEmailStatus] = useState('idle');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const v = driver.vehicle || {};
      const brand = v.brand || BRANDS[0];
      setForm({
        name: driver.name || '',
        username: driver.username || '',
        email: driver.email || '',
        phone: driver.phone || '',
        company: driver.company || COMPANIES[0],
        work_schedule: driver.work_schedule || SCHEDULES[0],
        vehicle: {
          brand: brand,
          model: v.model || CAR_DATA[brand][0],
          license_plate: v.license_plate || '',
          color: v.color || COLORS[0],
          year: String(v.year || YEARS[0]),
          capacity: v.capacity || 4,
        }
      });
      setPreviewUrl(driver.profileImage || '');
      setUsernameStatus('idle');
    } else {
      setForm({
        name: '', username: '', email: '', phone: '',
        company: COMPANIES[0], work_schedule: SCHEDULES[0],
        vehicle: {
          brand: BRANDS[0],
          model: CAR_DATA[BRANDS[0]][0],
          license_plate: '',
          color: COLORS[0],
          year: YEARS[0],
          capacity: 4
        }
      });
      setPreviewUrl('');
      setAvatarFile(null);
      setUsernameStatus('idle');
    }
    setStep('');
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [driver, isEditMode, isOpen, initialTab]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (activeTab === 'history' && driver?._id) {
        setLoadingTrips(true);
        try {
          let res;
          if (isPassenger) {
            res = await rideService.getBookingsByPassenger(driver._id);
            // Normalizamos: en las reservas, los datos del viaje están en .ride
            const normalized = (res.data || []).map(b => ({
              ...b.ride,
              status: b.status, // Usamos el estado de la reserva
              _id: b._id
            }));
            setTrips(normalized);
          } else {
            res = await rideService.getRidesByDriver(driver._id);
            setTrips(res.data || []);
          }
        } catch (err) {
          console.error('Error loading history:', err);
          toast.error('No se pudo cargar el historial');
          setTrips([]);
        } finally {
          setLoadingTrips(false);
        }
      }
    };
    fetchHistory();
  }, [activeTab, driver?._id, isPassenger]);

  const checkUsernameUniqueness = async (val) => {
    if (!val || val.length < 4 || isEditMode) return;
    setUsernameStatus('checking');
    try {
      const response = await api.get(`/users?search=${val}`);
      const exists = response.data?.data?.some(u => u.username.toLowerCase() === val.toLowerCase());
      setUsernameStatus(exists ? 'taken' : 'available');
    } catch (err) {
      setUsernameStatus('idle');
    }
  };

  const checkEmailUniqueness = async (val) => {
    if (!val || !/^\S+@\S+\.\S+$/.test(val) || isEditMode) return;
    setEmailStatus('checking');
    try {
      // Consultamos al backend si existe alguien con ese correo
      const response = await api.get(`/users?search=${val}`);
      const exists = response.data?.data?.some(u => u.email.toLowerCase() === val.toLowerCase());
      setEmailStatus(exists ? 'taken' : 'available');
    } catch (err) {
      setEmailStatus('idle');
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('v-')) {
      const field = name.replace('v-', '');
      setForm(prev => {
        const newVehicle = { ...prev.vehicle, [field]: value };
        if (field === 'brand') newVehicle.model = CAR_DATA[value][0];
        return { ...prev, vehicle: newVehicle };
      });
    } else {
      if (name === 'name') {
        const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        setForm(prev => ({ ...prev, [name]: filteredValue }));
      } else if (name === 'username') {
        const filteredUser = value.replace(/[^a-zA-Z0-9]/g, '');
        setForm(prev => ({ ...prev, [name]: filteredUser }));
        if (!isEditMode) setUsernameStatus('idle');
      } else {
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'username' && !isEditMode) setUsernameStatus('idle');
        if (name === 'email' && !isEditMode) setEmailStatus('idle');
      }
    }
  };

  const validate = () => {
    if (!form.name.trim() || form.name.length < 4) return 'El nombre debe tener al menos 4 caracteres';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.name)) return 'El nombre solo puede contener letras y espacios';
    if (form.username && !/^[a-zA-Z0-9]+$/.test(form.username)) return 'El usuario solo puede contener letras y números';
    if (!/^\d{8}$/.test(form.phone)) return 'El teléfono debe tener exactamente 8 dígitos';
    if (!form.email || !form.username) return 'Email y Usuario son obligatorios';
    if (!isEditMode && (usernameStatus === 'taken' || emailStatus === 'taken')) {
      return emailStatus === 'taken' ? 'Este correo ya está registrado' : 'El nombre de usuario ya está en uso';
    }
    if (form.username.length < 4) return 'El usuario debe tener al menos 4 caracteres';
    
    // Validaciones exclusivas de conductor
    if (!isPassenger) {
      if (!/^[A-Z0-9]{6}$/.test(form.vehicle.license_plate.toUpperCase())) return 'La placa debe tener exactamente 6 caracteres alfanuméricos';
      if (!form.vehicle.model) return 'El modelo del vehículo es obligatorio';
    }
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const error = validate();
    if (error) return toast.error(error);

    setSubmitting(true);
    try {
      const savedDriverId = driver ? driver._id : null;

      if (!isEditMode) {
        setStep('Registrando usuario...');
        const userPayload = { ...form, password: generateTempPassword(), type: userType };
        delete userPayload.vehicle;

        const regRes = await api.post('/auth/register', userPayload);
        const newUserId = regRes.data?.data?.user?._id;

        if (!isPassenger) {
          setStep('Registrando vehículo...');
          const vehiclePayload = {
            ...form.vehicle,
            license_plate: form.vehicle.license_plate.toUpperCase(),
            year: parseInt(form.vehicle.year),
            capacity: parseInt(form.vehicle.capacity),
            driver_id: newUserId
          };
          await api.post('/vehicles', vehiclePayload);
        }

        setStep('Enviando invitación...');
        await api.post('/auth/send-verification-code', { email: form.email });
        toast.success('Conductor registrado exitosamente.');
      } else {
        setStep('Actualizando datos personales...');
        const userUpdatePayload = {
          name: form.name,
          phone: form.phone,
          company: form.company,
          work_schedule: form.work_schedule
        };
        
        if (isPassenger) {
          await passengerService.updatePassenger(savedDriverId, userUpdatePayload);
        } else {
          await driverService.updateDriver(savedDriverId, userUpdatePayload);

          const vehicleId = driver.vehicle?._id || driver.vehicle;
          if (vehicleId) {
            setStep('Actualizando vehículo...');
            const targetVehicleId = typeof vehicleId === 'object' ? vehicleId._id : vehicleId;
            const vehicleUpdate = {
              brand: form.vehicle.brand,
              model: form.vehicle.model,
              license_plate: form.vehicle.license_plate.toUpperCase(),
              color: form.vehicle.color,
              year: parseInt(form.vehicle.year),
              capacity: parseInt(form.vehicle.capacity)
            };
            await api.put(`/vehicles/${targetVehicleId}`, vehicleUpdate);
          } else {
            setStep('Creando vehículo faltante...');
            const vehiclePayload = {
              ...form.vehicle,
              license_plate: form.vehicle.license_plate.toUpperCase(),
              year: parseInt(form.vehicle.year),
              capacity: parseInt(form.vehicle.capacity),
              driver_id: savedDriverId
            };
            await api.post('/vehicles', vehiclePayload);
          }
        }
      }

      if (avatarFile && savedDriverId) {
        setStep('Subiendo imagen...');
        if (isPassenger) {
          await passengerService.uploadImage(savedDriverId, avatarFile);
        } else {
          await driverService.uploadImage(savedDriverId, avatarFile);
        }
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error('Save error details:', err.response?.data || err);
      const backendError = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || err.message;
      toast.error('Error: ' + backendError);
    } finally {
      setSubmitting(false);
      setStep('');
    }
  };

  if (!isOpen) return null;

  const currentModels = CAR_DATA[form.vehicle.brand] || [];


  return (
    <div className="modal-backdrop">
      <div className="modal-glass">
        <header className="modal-header">
          <h2>
            {activeTab === 'history' 
              ? `Historial de Viajes: ${driver?.name}` 
              : (isEditMode ? `Editar Perfil ${isPassenger ? 'Pasajero' : 'Conductor'}` : 'Nuevo Registro')}
          </h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </header>

        {activeTab === 'info' ? (
          <form className="modal-body" onSubmit={handleSubmit}>
            <div className="avatar-section">
              <img src={previewUrl || 'https://via.placeholder.com/150'} alt="Avatar" className="avatar-preview" />
              {/* Solo permitir subir foto si estamos editando o creando */}
              <label className="file-label">
                <Upload size={16} /> <span>{isEditMode ? 'Cambiar foto' : 'Subir foto (opcional)'}</span>
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files[0];
                  if (file) { setAvatarFile(file); setPreviewUrl(URL.createObjectURL(file)); }
                }} />
              </label>
            </div>

            <div className="section-title"><Mail size={14} /> Datos de Cuenta</div>
            <div className="field-group">
              <label>Correo Electrónico</label>
              <div className="username-input-wrapper">
                <input 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  onBlur={(e) => checkEmailUniqueness(e.target.value)}
                  required 
                  readOnly={isEditMode} 
                  className={isEditMode ? 'input-readonly' : ''} 
                />
                {!isEditMode && (
                  <div className="username-status-icon">
                    {emailStatus === 'checking' && <div className="spinner-mini" />}
                    {emailStatus === 'available' && <CheckCircle size={16} color="#10B981" />}
                    {emailStatus === 'taken' && <AlertCircle size={16} color="#EF4444" />}
                  </div>
                )}
              </div>
            </div>
            <div className="field-group">
              <label>Nombre de Usuario</label>
              <div className="username-input-wrapper">
                <input name="username" value={form.username} onChange={handleChange} onBlur={(e) => checkUsernameUniqueness(e.target.value)} required readOnly={isEditMode} className={isEditMode ? 'input-readonly' : ''} />
                {!isEditMode && (
                  <div className="username-status-icon">
                    {usernameStatus === 'checking' && <div className="spinner-mini" />}
                    {usernameStatus === 'available' && <CheckCircle size={16} color="#10B981" />}
                    {usernameStatus === 'taken' && <AlertCircle size={16} color="#EF4444" />}
                  </div>
                )}
              </div>
            </div>

            <div className="section-title"><User size={14} /> Información Personal</div>
            <div className="field-group">
              <label>Nombre Completo *</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="field-group">
              <label>Teléfono (8 dígitos) *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required maxLength={8} />
            </div>
            <div className="field-group">
              <label>Empresa *</label>
              <select name="company" value={form.company} onChange={handleChange}>
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label>Horario *</label>
              <select name="work_schedule" value={form.work_schedule} onChange={handleChange}>
                {SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {!isPassenger && (
              <>
                <div className="section-title"><Truck size={14} /> Información del Vehículo</div>
                <div className="field-group">
                  <label>Marca *</label>
                  <select name="v-brand" value={form.vehicle.brand} onChange={handleChange}>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label>Modelo *</label>
                  <select name="v-model" value={form.vehicle.model} onChange={handleChange}>
                    {currentModels.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label>Placa (6 Caracteres) *</label>
                  <input name="v-license_plate" value={form.vehicle.license_plate} onChange={handleChange} maxLength={6} style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="field-group">
                  <label>Color *</label>
                  <select name="v-color" value={form.vehicle.color} onChange={handleChange}>
                    {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label><Calendar size={12} /> Año *</label>
                  <select name="v-year" value={form.vehicle.year} onChange={handleChange}>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label><Users size={12} /> Capacidad *</label>
                  <input type="number" name="v-capacity" value={form.vehicle.capacity} onChange={handleChange} min="1" max="7" />
                </div>
              </>
            )}

            <div className="modal-footer">
              <button type="submit" className="save-btn" disabled={submitting || usernameStatus === 'checking' || emailStatus === 'checking'}>
                {submitting ? step : (isEditMode ? 'Actualizar Perfil' : 'Completar Registro')}
              </button>
            </div>
          </form>
        ) : (
          <div className="modal-body history-body">
            {loadingTrips ? (
              <div className="loading-trips">
                <div className="spinner-dashboard" />
                <p>Cargando historial de viajes...</p>
              </div>
            ) : trips.length > 0 ? (
              <div className="trips-timeline">
                {trips.map((trip, idx) => (
                  <div key={trip._id || idx} className="trip-history-item">
                    <div className="trip-date-indicator">
                      <div className="date-dot" />
                      {idx !== trips.length - 1 && <div className="date-line" />}
                    </div>
                    <div className="trip-card-history">
                      <div className="trip-header-h">
                        <span className={`trip-status-badge ${trip.status}`}>
                          {trip.status === 'completed' ? 'Completado' : 
                           trip.status === 'cancelled' ? 'Cancelado' : 
                           trip.status === 'in progress' ? 'En Curso' : 'Programado'}
                        </span>
                        <span className="trip-date-h"><Calendar size={12} /> {trip.fecha} · {trip.hora}</span>
                      </div>
                      <div className="trip-route-h">
                        <div className="route-step">
                          <MapPin size={14} color="#10B981" />
                          <div>
                            <p className="route-label">Origen</p>
                            <p className="route-name">{trip.origin?.name}</p>
                          </div>
                        </div>
                        <div className="route-divider-h" />
                        <div className="route-step">
                          <MapPin size={14} color="#EF4444" />
                          <div>
                            <p className="route-label">Destino</p>
                            <p className="route-name">{trip.destination?.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="trip-footer-h">
                        <span><Users size={12} /> {trip.available_seats} Asientos</span>
                        {trip.distance_km && <span><Navigation size={12} /> {trip.distance_km} km</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-trips">
                <History size={48} />
                <p>Este {isPassenger ? 'pasajero' : 'conductor'} aún no registra actividad.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverProfileModal;
