import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Search, Truck,
  CheckCircle, AlertCircle, Clock, ShieldCheck,
  Eye, Check, X, Upload,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Bot
} from 'lucide-react';
import vehicleService from '../../services/vehicleService';
import driverService from '../../services/driverService';
import documentService from '../../services/documentService';
import DocumentReviewPanel from '../../components/DocumentReviewPanel';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import './Vehiculos.css';

// Todos los documentos relevantes que verifica el Agente
// (4 del vehículo + 2 del conductor que opera ese vehículo).
const VEHICLE_DOC_TYPES = [
  'cedula', 'licencia',
  'poliza', 'marchamo', 'rtv', 'tarjeta_circulacion',
];

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

  // Conteos del agente: { [driverId]: { approved: N, total: M } }
  const [agentDocCounts, setAgentDocCounts] = useState({});

  const getDocumentCount = (vehicle) => {
    let count = 0;
    if (vehicle.polizaUrl) count++;
    if (vehicle.rtvUrl) count++;
    return count;
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

  // Cuando cambian los vehículos visibles, traemos en paralelo los docs vehiculares
  // del agente para alimentar el badge "X/N aprobados".
  useEffect(() => {
    if (!vehicles?.length) return;
    let cancelled = false;
    (async () => {
      const driverIds = [...new Set(
        vehicles.map(v => (typeof v.driver_id === 'object' ? v.driver_id?._id : v.driver_id)).filter(Boolean)
      )];
      const pending = driverIds.filter(id => !(id in agentDocCounts));
      if (pending.length === 0) return;
      const results = await Promise.all(
        pending.map(id => documentService.getDocumentsByDriver(id).catch(() => []))
      );
      if (cancelled) return;
      const next = { ...agentDocCounts };
      pending.forEach((id, i) => {
        const docs = results[i] || [];
        const vehDocs = docs.filter(d => VEHICLE_DOC_TYPES.includes(d.type));
        const approved = vehDocs.filter(d => d.status === 'approved').length;
        next[id] = { approved, total: VEHICLE_DOC_TYPES.length };
      });
      setAgentDocCounts(next);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles]);

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

                {/* Badge de completitud de documentos (Agente IA) */}
                <div className="doc-status-row" style={{ marginTop: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                  {(() => {
                    const driverId = typeof vehicle.driver_id === 'object' ? vehicle.driver_id?._id : vehicle.driver_id;
                    const agentInfo = driverId ? agentDocCounts[driverId] : null;
                    const approved = agentInfo?.approved ?? 0;
                    const total = agentInfo?.total ?? VEHICLE_DOC_TYPES.length;
                    const ready = !!agentInfo;

                    let color = '#94A3B8';
                    let label = ready ? `${approved}/${total}` : 'Cargando…';
                    let suffix = ready ? '(Faltan documentos)' : '';
                    if (ready) {
                      if (approved === total) {
                        color = '#16A34A';
                        suffix = '(Completo)';
                      } else if (approved > 0) {
                        color = '#CA8A04';
                        suffix = '(Incompleto)';
                      } else {
                        color = '#EF4444';
                      }
                    }
                    return (
                      <span
                        title="Conteo provisto por el Agente de verificación"
                        style={{ color, display: 'flex', alignItems: 'center', gap: '6px', background: `${color}10`, padding: '4px 10px', borderRadius: '20px', border: `1px solid ${color}25` }}
                      >
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: color }}></span>
                        Docs IA: {label} {suffix}
                        {ready && <Bot size={12} style={{ marginLeft: 2, opacity: 0.7 }} />}
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
                      Aprobar Vehículo
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

            <div className="doc-modal-body doc-modal-body--agent">
              <div className="doc-agent-header">
                <div className="doc-agent-title">
                  <Bot size={18} />
                  <span>Verificación por Agente IA</span>
                </div>
                <span className="doc-agent-hint">
                  Cédula y licencia corresponden al conductor; póliza, marchamo, RTV y tarjeta al vehículo.
                </span>
              </div>

              <DocumentReviewPanel
                driver={typeof selectedDoc.driver_id === 'object' ? selectedDoc.driver_id : { _id: selectedDoc.driver_id }}
                vehicle={selectedDoc}
                filterTypes={VEHICLE_DOC_TYPES}
              />

              <div className="doc-modal-footer doc-modal-footer--standalone">
                {!selectedDoc.isActive ? (
                  <button
                    className="approve-doc-btn"
                    onClick={() => {
                      handleApprove(selectedDoc._id);
                      setSelectedDoc(null);
                    }}
                  >
                    <Check size={16} /> Aprobar y Activar Vehículo
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
