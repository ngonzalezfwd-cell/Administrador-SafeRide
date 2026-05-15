import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Truck,
  CheckCircle, AlertCircle, Clock, ShieldCheck,
  Eye, Check, X
} from 'lucide-react';
import vehicleService from '../../services/vehicleService';
import driverService from '../../services/driverService';
import { toast } from 'react-hot-toast';
import './Vehiculos.css';

import { CAR_DATA, BRANDS, COLORS, YEARS } from '../../constants/carData';

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
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0
  });

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // Esperar 500ms después de dejar de escribir

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [selectedDoc, setSelectedDoc] = useState(null);
  
  // Estados para el formulario de nuevo vehículo
  const [showAddModal, setShowAddModal] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    driver_id: '',
    brand: BRANDS[0] || '',
    model: (BRANDS[0] && CAR_DATA[BRANDS[0]] && CAR_DATA[BRANDS[0]][0]) || '',
    license_plate: '',
    color: COLORS[0],
    year: YEARS[0],
    capacity: 4,
    image: null
  });

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await vehicleService.getAllVehicles({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: debouncedSearch
      });

      setVehicles(response.data);
      // Calcular stats locales
      const total = response.pagination?.total || response.data.length;
      const active = response.data.filter(v => v.isActive).length;
      const pending = response.data.filter(v => !v.isActive).length;

      setStats({ total, active, pending });
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast.error('No se pudieron cargar los vehículos');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, debouncedSearch]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

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

  const fetchDrivers = async () => {
    try {
      const response = await driverService.getAllDrivers({ limit: 100 });
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const handleOpenAddModal = () => {
    fetchDrivers();
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newVehicle.driver_id) {
      toast.error('Debes seleccionar un conductor');
      return;
    }

    setFormLoading(true);
    try {
      // 1. Crear el vehículo
      const vehicleRes = await vehicleService.createVehicle({
        driver_id: newVehicle.driver_id,
        brand: newVehicle.brand,
        model: newVehicle.model,
        license_plate: newVehicle.license_plate,
        color: newVehicle.color,
        year: parseInt(newVehicle.year),
        capacity: parseInt(newVehicle.capacity)
      });

      // 2. Si hay imagen, subirla
      if (newVehicle.image && vehicleRes.data?._id) {
        await vehicleService.uploadVehicleImage(vehicleRes.data._id, newVehicle.image);
      }

      toast.success('Vehículo registrado con éxito');
      setShowAddModal(false);
      setNewVehicle({
        driver_id: '',
        brand: BRANDS[0],
        model: CAR_DATA[BRANDS[0]][0],
        license_plate: '',
        color: COLORS[0],
        year: YEARS[0],
        capacity: 4,
        image: null
      });
      loadVehicles();
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast.error(error.response?.data?.message || 'Error al crear el vehículo');
    } finally {
      setFormLoading(false);
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
          Array.from({ length: 6 }).map((_, i) => <VehicleSkeleton key={`vsk-${i}`} />)
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
                <img
                  src={selectedDoc.vehicleImage}
                  alt="Documentación"
                  className="full-doc-image"
                />
                <div className="zoom-hint">Usa el mouse para desplazarte por el documento</div>
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

      {/* MODAL DE AÑADIR VEHÍCULO */}
      {showAddModal && (
        <div className="doc-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="doc-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="doc-modal-header">
              <div>
                <h2>Registrar Nuevo Vehículo</h2>
                <p>Completa la información técnica del vehículo y su conductor.</p>
              </div>
              <button className="close-modal-btn" onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="add-vehicle-form">
              <div className="form-grid-admin">
                <div className="form-group-admin full-width">
                  <label>Conductor Asignado</label>
                  <select
                    required
                    value={newVehicle.driver_id}
                    onChange={(e) => setNewVehicle({ ...newVehicle, driver_id: e.target.value })}
                  >
                    <option value="">Selecciona un conductor...</option>
                    {drivers.map(driver => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name} ({driver.company})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-admin">
                  <label>Marca</label>
                  <select
                    required
                    value={newVehicle.brand}
                    onChange={(e) => {
                      const brand = e.target.value;
                      setNewVehicle({ 
                        ...newVehicle, 
                        brand, 
                        model: CAR_DATA[brand][0] 
                      });
                    }}
                  >
                    {BRANDS.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-admin">
                  <label>Modelo</label>
                  <select
                    required
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  >
                    {(CAR_DATA[newVehicle.brand] || []).map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-admin">
                  <label>Placa (6 caracteres)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="ABC123"
                    value={newVehicle.license_plate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, license_plate: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="form-group-admin">
                  <label>Color</label>
                  <select
                    required
                    value={newVehicle.color}
                    onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                  >
                    {COLORS.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-admin">
                  <label>Año</label>
                  <select
                    required
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                  >
                    {YEARS.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-admin">
                  <label>Capacidad Pasajeros</label>
                  <select
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(num => (
                      <option key={num} value={num}>{num} Asientos</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-admin full-width">
                  <label>Imagen / Documento del Vehículo</label>
                  <div className="file-upload-zone">
                    <input
                      type="file"
                      id="vehicle-image"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => setNewVehicle({ ...newVehicle, image: e.target.files[0] })}
                    />
                    <label htmlFor="vehicle-image" className="file-label">
                      {newVehicle.image ? (
                        <div className="file-selected-status">
                          <CheckCircle size={24} color="#16A34A" />
                          <span>{newVehicle.image.name} seleccionado</span>
                        </div>
                      ) : (
                        <div className="file-placeholder-status">
                          <Plus size={24} />
                          <span>Subir Marchamo o Foto del Vehículo</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-actions-admin">
                <button 
                  type="button" 
                  className="cancel-btn-admin" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-btn-admin" 
                  disabled={formLoading}
                >
                  {formLoading ? 'Guardando...' : 'Registrar Vehículo'}
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
