import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Search, Filter, MoreVertical, Truck,
  CheckCircle, AlertCircle, Clock, ShieldCheck,
  ExternalLink, Eye, Check, X, Upload,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  FileText, Trash2
} from 'lucide-react';
import vehicleService from '../../services/vehicleService';
import driverService from '../../services/driverService';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import './Vehiculos.css';

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

// ─────────────────────────────────────────────────────────────
// COMPONENTE: Skeleton para carga de vehículos
// ─────────────────────────────────────────────────────────────
const VehicleSkeleton = () => (
  <div className="vehicle-card skeleton">
    <div className="card-top skeleton-pulse">
      <div className="skeleton-img-v" />
    </div>
    <div className="card-content">
      <div className="skeleton-line-v title" />
      <div className="driver-info">
        <div className="skeleton-avatar" />
        <div className="skeleton-line-v small" />
      </div>
      <div className="card-actions">
        <div className="skeleton-btn-v" />
        <div className="skeleton-btn-v" />
      </div>
    </div>
  </div>
);

const VehiculosPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, pending
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0
  });

  // Formulario de añadir vehículo
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    driver_id: '',
    brand: BRANDS[0] || '',
    model: (BRANDS[0] && CAR_DATA[BRANDS[0]] && CAR_DATA[BRANDS[0]][0]) || '',
    license_plate: '',
    color: COLORS[0] || '',
    year: YEARS[0] || '',
    capacity: 4
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'brand') {
        updated.model = CAR_DATA[value] ? CAR_DATA[value][0] : '';
      }
      return updated;
    });
  };

  const currentModels = useMemo(() => {
    if (!form.brand) return [];
    return CAR_DATA[form.brand] || [];
  }, [form.brand]);

  const handleOpenAddModal = async () => {
    setIsAddModalOpen(true);
    setForm({
      driver_id: '',
      brand: BRANDS[0] || '',
      model: (BRANDS[0] && CAR_DATA[BRANDS[0]] && CAR_DATA[BRANDS[0]][0]) || '',
      license_plate: '',
      color: COLORS[0] || '',
      year: YEARS[0] || '',
      capacity: 4
    });
    setImageFile(null);
    setImagePreview('');

    try {
      const response = await driverService.getAllDrivers({ limit: 100 });
      if (response && response.data) {
        setDrivers(response.data);
        if (response.data.length > 0) {
          setForm(prev => ({ ...prev, driver_id: response.data[0]._id }));
        }
      }
    } catch (error) {
      console.error('Error loading drivers for modal:', error);
      toast.error('Error al cargar la lista de conductores');
    }
  };

  const validateForm = () => {
    if (!form.driver_id) return 'Debes seleccionar un conductor';
    if (!form.brand) return 'La marca es obligatoria';
    if (!form.model) return 'El modelo es obligatorio';
    if (!form.license_plate) return 'La placa es obligatoria';
    if (!/^[A-Z0-9]{6}$/.test(form.license_plate.toUpperCase())) {
      return 'La placa debe tener exactamente 6 caracteres alfanuméricos';
    }
    if (!form.color) return 'El color es obligatorio';
    if (!form.year) return 'El año es obligatorio';
    if (!form.capacity || form.capacity < 1 || form.capacity > 7) {
      return 'La capacidad debe ser entre 1 y 7 asientos';
    }
    return null;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) return toast.error(errorMsg);

    setSubmitting(true);
    try {
      const payload = {
        brand: form.brand,
        model: form.model,
        license_plate: form.license_plate.toUpperCase(),
        color: form.color,
        year: parseInt(form.year),
        capacity: parseInt(form.capacity),
        driver_id: form.driver_id
      };

      const response = await vehicleService.createVehicle(payload);

      if (imageFile && response?.data?._id) {
        const formData = new FormData();
        formData.append('image', imageFile);
        await api.post(`/vehicles/${response.data._id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success(response.message || 'Vehículo registrado con éxito');
      setIsAddModalOpen(false);
      loadVehicles();
    } catch (error) {
      console.error('Error creating vehicle:', error);
      const errMsg = error.response?.data?.message || 'Error al registrar el vehículo';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeDocTab, setActiveDocTab] = useState('photo'); // 'photo' | 'poliza' | 'rtv'
  const [localDocs, setLocalDocs] = useState({ poliza: null, rtv: null });

  // Cargar documentos del localStorage al abrir el modal
  useEffect(() => {
    if (selectedDoc) {
      setActiveDocTab('photo');
      const stored = localStorage.getItem(`saferide_docs_${selectedDoc._id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setLocalDocs({
            poliza: parsed.poliza || null,
            rtv: parsed.rtv || null
          });
        } catch {
          setLocalDocs({ poliza: null, rtv: null });
        }
      } else {
        setLocalDocs({ poliza: null, rtv: null });
      }
    }
  }, [selectedDoc]);

  const handleLocalDocUpload = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande (máximo 1.5 MB para almacenamiento local)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const updated = {
        ...localDocs,
        [type]: {
          name: file.name,
          type: file.type,
          data: event.target.result,
          uploadedAt: new Date().toLocaleDateString()
        }
      };
      setLocalDocs(updated);
      localStorage.setItem(`saferide_docs_${selectedDoc._id}`, JSON.stringify(updated));
      toast.success(`Documento '${file.name}' cargado con éxito`);
    };
    reader.readAsDataURL(file);
  };

  const handleLocalDocDelete = (type) => {
    const updated = {
      ...localDocs,
      [type]: null
    };
    setLocalDocs(updated);
    localStorage.setItem(`saferide_docs_${selectedDoc._id}`, JSON.stringify(updated));
    toast.success('Documento eliminado');
  };

  const getDocumentCount = (vehicleId) => {
    const stored = localStorage.getItem(`saferide_docs_${vehicleId}`);
    if (!stored) return 0;
    try {
      const docs = JSON.parse(stored);
      let count = 0;
      if (docs.poliza) count++;
      if (docs.rtv) count++;
      return count;
    } catch {
      return 0;
    }
  };

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await vehicleService.getAllVehicles({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: debouncedSearch,
        page: currentPage,
        limit: 9 // Cambiado de 6 a 9 a petición del usuario
      });

      if (response && response.data) {
        setVehicles(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1);
        }
        
        // Calcular stats (usamos los totales del backend si vienen)
        const total = response.pagination?.total || response.data.length;
        const active = response.stats?.active || response.data.filter(v => v.isActive).length;
        const pending = response.stats?.pending || response.data.filter(v => !v.isActive).length;

        setStats({ total, active, pending });
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast.error('No se pudieron cargar los vehículos');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, debouncedSearch, currentPage]);

  useEffect(() => {
    loadVehicles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadVehicles();
    }
  }, [filterStatus, debouncedSearch]);

  // Lógica de números de página
  const getPageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 3) end = 4;
      if (currentPage >= totalPages - 2) start = totalPages - 3;
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  const handleApprove = async (id) => {
    try {
      await vehicleService.updateVehicleStatus(id, true);
      toast.success('Vehículo aprobado con éxito');
      loadVehicles();
    } catch (error) {
      toast.error('Error al aprobar el vehículo');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('¿Estás seguro de desactivar este vehículo?')) return;
    try {
      await vehicleService.updateVehicleStatus(id, false);
      toast.success('Vehículo desactivado');
      loadVehicles();
    } catch (error) {
      toast.error('Error al desactivar el vehículo');
    }
  };

  return (
    <div className="vehiculos-container">
      <div className="vehiculos-header">
        <div>
          <h1>Inventario de Vehículos</h1>
          <p>Gestiona y monitorea el estado de la flota activa.</p>
        </div>
        <button className="add-vehicle-btn" onClick={handleOpenAddModal}>
          <Plus size={20} />
          Añadir Vehículo
        </button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon fleet">
            <Truck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Flota</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Operativos</span>
            <span className="stat-value">{stats.active}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pendientes</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon alert">
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">En Revisión</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="controls-row">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por placa, marca o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Todos
          </button>
          <button
            className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            Operativos
          </button>
          <button
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pendientes
          </button>
        </div>
      </div>

      {/* Grid de Vehículos */}
      <div className="vehicles-grid">
        {loading ? (
          Array.from({ length: 9 }).map((_, i) => <VehicleSkeleton key={`vsk-${i}`} />)
        ) : vehicles.length === 0 ? (
          <div className="empty-state">No se encontraron vehículos.</div>
        ) : (
          vehicles.map((vehicle, index) => (
            <div 
              key={vehicle._id} 
              className={`vehicle-card ${!vehicle.isActive ? 'is-pending' : ''}`}
              style={{ '--card-index': index }}
            >
              <div className="card-top">
                <span className="plate-badge">{vehicle.license_plate}</span>
                <div className="card-image-container">
                  <img
                    src={vehicle.vehicleImage || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                    alt={vehicle.model}
                    className="vehicle-image"
                    loading="lazy"
                  />
                  {!vehicle.isActive && (
                    <div className="pending-overlay">
                      <ShieldCheck size={32} />
                      <span>Revisión de Papeles</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-content">
                <div className="card-title-row">
                  <h3>{vehicle.brand} {vehicle.model}</h3>
                  <span className={`status-tag ${vehicle.isActive ? 'optimo' : 'revisión'}`}>
                    {vehicle.isActive ? 'Óptimo' : 'Pendiente'}
                  </span>
                </div>

                {/* Badge de completitud de papeles */}
                <div className="doc-status-row" style={{ marginTop: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                  {(() => {
                    const count = getDocumentCount(vehicle._id);
                    let color = '#EF4444'; // Rojo por defecto
                    let text = `Papeles: ${count}/2 (Faltan documentos)`;
                    if (count === 2) {
                      color = '#16A34A'; // Verde
                      text = 'Papeles: 2/2 (Completo)';
                    } else if (count > 0) {
                      color = '#CA8A04'; // Amarillo/Mostaza
                      text = `Papeles: ${count}/2 (Incompleto)`;
                    }
                    return (
                      <span style={{ color, display: 'flex', alignItems: 'center', gap: '6px', background: `${color}10`, padding: '4px 10px', borderRadius: '20px', border: `1px solid ${color}25` }}>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: color }}></span>
                        {text}
                      </span>
                    );
                  })()}
                </div>

                <div className="driver-info">
                  <div className="driver-avatar-mini">
                    {vehicle.driver_id?.profileImage ? (
                      <img src={vehicle.driver_id.profileImage} alt="Driver" />
                    ) : (
                      <div className="avatar-placeholder">{vehicle.driver_id?.name?.[0]}</div>
                    )}
                  </div>
                  <div className="driver-text">
                    <span className="label">Conductor:</span>
                    <span className="name">{vehicle.driver_id?.name || 'Sin asignar'}</span>
                  </div>
                </div>

                <div className="card-actions">
                  {vehicle.isActive ? (
                    <button
                      className="action-btn deactivate"
                      onClick={() => handleDeactivate(vehicle._id)}
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      className="action-btn approve"
                      onClick={() => handleApprove(vehicle._id)}
                    >
                      Aprobar Marchamo
                    </button>
                  )}
                  <button
                    className="view-details-btn"
                    title="Ver Papeles Completos"
                    onClick={() => setSelectedDoc(vehicle)}
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- PAGINACIÓN --- */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button 
            className="pagination-btn" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            title="Primera página"
          >
            <ChevronsLeft size={18} />
          </button>
          
          <button 
            className="pagination-btn" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="pagination-numbers">
            {getPageNumbers.map((num, i) => (
              num === '...' ? (
                <span key={`dots-${i}`} className="pagination-dots">...</span>
              ) : (
                <button
                  key={`page-${num}`}
                  className={`page-num ${currentPage === num ? 'active' : ''}`}
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              )
            ))}
          </div>

          <button 
            className="pagination-btn" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            <ChevronRight size={18} />
          </button>

          <button 
            className="pagination-btn" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            title="Última página"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      )}

      {/* MODAL DE REVISIÓN DOCUMENTAL */}
      {selectedDoc && (
        <div className="doc-modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="doc-modal-content" onClick={e => e.stopPropagation()}>
            <div className="doc-modal-header">
              <div>
                <h2>Revisión de Documentación Legal</h2>
                <p>Vehículo: {selectedDoc.brand} {selectedDoc.model} - {selectedDoc.license_plate}</p>
              </div>
              <button className="close-modal-btn" onClick={() => setSelectedDoc(null)}>
                <X size={24} />
              </button>
            </div>

            <div className="doc-modal-body">
              <div className="doc-viewer-container">
                {/* Selector de pestañas de documentos */}
                <div className="doc-tabs-container">
                  <button
                    className={`doc-tab-btn ${activeDocTab === 'photo' ? 'active' : ''}`}
                    onClick={() => setActiveDocTab('photo')}
                  >
                    <Truck size={16} /> Foto Auto
                  </button>
                  <button
                    className={`doc-tab-btn ${activeDocTab === 'poliza' ? 'active' : ''}`}
                    onClick={() => setActiveDocTab('poliza')}
                  >
                    <FileText size={16} /> Póliza INS {localDocs.poliza && '✓'}
                  </button>
                  <button
                    className={`doc-tab-btn ${activeDocTab === 'rtv' ? 'active' : ''}`}
                    onClick={() => setActiveDocTab('rtv')}
                  >
                    <FileText size={16} /> Dekra RTV {localDocs.rtv && '✓'}
                  </button>
                </div>

                {/* Contenido dinámico según pestaña */}
                <div className="doc-viewer-viewport" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                  {activeDocTab === 'photo' && (
                    <>
                      <img
                        src={selectedDoc.vehicleImage || 'https://via.placeholder.com/600x400?text=Sin+Foto'}
                        alt="Foto del Vehículo"
                        className="full-doc-image"
                      />
                      <div className="zoom-hint">Fotografía oficial del vehículo físico</div>
                    </>
                  )}

                  {activeDocTab !== 'photo' && (() => {
                    const doc = localDocs[activeDocTab];
                    const tabLabels = { poliza: 'Póliza INS', rtv: 'Dekra RTV' };
                    
                    if (doc) {
                      return (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <div className="doc-viewer-actions">
                            <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>
                              Cargado el: {doc.uploadedAt} ({doc.name})
                            </span>
                            <button
                              className="delete-doc-btn"
                              onClick={() => handleLocalDocDelete(activeDocTab)}
                            >
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </div>
                          <div style={{ flex: 1, background: '#0F172A', borderRadius: '12px', overflow: 'hidden', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                            {doc.type.includes('pdf') ? (
                              <iframe
                                src={doc.data}
                                title={tabLabels[activeDocTab]}
                                width="100%"
                                height="420px"
                                style={{ border: 'none', borderRadius: '8px' }}
                              />
                            ) : (
                              <img
                                src={doc.data}
                                alt={tabLabels[activeDocTab]}
                                style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '8px', objectFit: 'contain' }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <label className="doc-upload-zone">
                        <Upload size={36} />
                        <h3>Cargar {tabLabels[activeDocTab]}</h3>
                        <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Soporta PDF o Imágenes (Máx. 1.5MB)</p>
                        <input
                          type="file"
                          accept=".pdf, image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleLocalDocUpload(activeDocTab, e)}
                        />
                      </label>
                    );
                  })()}
                </div>
              </div>

              <div className="doc-validation-sidebar">
                <div className="validation-item">
                  <ShieldCheck size={20} />
                  <span>Verificar Número de Póliza</span>
                </div>
                <div className="validation-item">
                  <Clock size={20} />
                  <span>Verificar Fecha de Vencimiento</span>
                </div>
                <div className="validation-item">
                  <Truck size={20} />
                  <span>Coincidencia de Placa</span>
                </div>

                <div className="doc-modal-footer">
                  {!selectedDoc.isActive ? (
                    <button
                      className="approve-doc-btn"
                      onClick={() => {
                        handleApprove(selectedDoc._id);
                        setSelectedDoc(null);
                      }}
                    >
                      Aprobar y Activar Vehículo
                    </button>
                  ) : (
                    <div className="already-approved-badge">
                      <Check size={20} /> Vehículo ya está activo
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE REGISTRO DE VEHÍCULO */}
      {isAddModalOpen && (
        <div className="doc-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="doc-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh' }}>
            <div className="doc-modal-header">
              <div>
                <h2>Registrar Nuevo Vehículo</h2>
                <p>Introduce los datos del vehículo y asígnalo a un conductor.</p>
              </div>
              <button className="close-modal-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <form className="add-vehicle-form" onSubmit={handleAddSubmit}>
              <div className="form-grid-admin">
                <div className="form-group-admin full-width">
                  <label>Conductor Asignado *</label>
                  <select name="driver_id" value={form.driver_id} onChange={handleFormChange} required>
                    <option value="" disabled>Seleccione un conductor...</option>
                    {drivers.map(d => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-admin">
                  <label>Marca *</label>
                  <select name="brand" value={form.brand} onChange={handleFormChange} required>
                    {BRANDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-admin">
                  <label>Modelo *</label>
                  <select name="model" value={form.model} onChange={handleFormChange} required>
                    {currentModels.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-admin">
                  <label>Placa (6 caracteres alfanuméricos) *</label>
                  <input
                    type="text"
                    name="license_plate"
                    value={form.license_plate}
                    onChange={handleFormChange}
                    maxLength={6}
                    placeholder="Ej: ABC123"
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                </div>

                <div className="form-group-admin">
                  <label>Color *</label>
                  <select name="color" value={form.color} onChange={handleFormChange} required>
                    {COLORS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-admin">
                  <label>Año *</label>
                  <select name="year" value={form.year} onChange={handleFormChange} required>
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-admin">
                  <label>Capacidad (Asientos) *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleFormChange}
                    min={1}
                    max={7}
                    required
                  />
                </div>

                <div className="form-group-admin full-width">
                  <label>Imagen del Vehículo</label>
                  <div className="file-upload-zone">
                    <label className="file-label">
                      <Upload size={20} style={{ marginRight: '8px', color: '#64748B' }} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            setImageFile(file);
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                      {imagePreview ? (
                        <div className="file-selected-status" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle size={18} color="#10B981" />
                          <span style={{ fontSize: '0.9rem', color: '#334155' }}>{imageFile?.name}</span>
                        </div>
                      ) : (
                        <div className="file-placeholder-status">
                          <span style={{ fontSize: '0.9rem', color: '#64748B' }}>Haga clic para subir una imagen</span>
                        </div>
                      )}
                    </label>
                  </div>
                  {imagePreview && (
                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                      <img src={imagePreview} alt="Vista previa del auto" style={{ maxWidth: '120px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions-admin">
                <button type="button" className="cancel-btn-admin" onClick={() => setIsAddModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-btn-admin" disabled={submitting}>
                  {submitting ? 'Registrando...' : 'Registrar Vehículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiculosPage;
