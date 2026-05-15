import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Filter, MoreVertical, Truck,
  CheckCircle, AlertCircle, Clock, ShieldCheck,
  ExternalLink, Eye, Check, X
} from 'lucide-react';
import vehicleService from '../../services/vehicleService';
import { toast } from 'react-hot-toast';
import './Vehiculos.css';

const VehiculosPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, pending
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0
  });

  const [selectedDoc, setSelectedDoc] = useState(null);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await vehicleService.getAllVehicles({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm
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
  }, [filterStatus, searchTerm]);

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

  return (
    <div className="vehiculos-container">
      <div className="vehiculos-header">
        <div>
          <h1>Inventario de Vehículos</h1>
          <p>Gestiona y monitorea el estado de la flota activa.</p>
        </div>
        <button className="add-vehicle-btn">
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
          <div className="loading-state">Cargando flota...</div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">No se encontraron vehículos.</div>
        ) : (
          vehicles.map((vehicle) => (
            <div key={vehicle._id} className={`vehicle-card ${!vehicle.isActive ? 'is-pending' : ''}`}>
              <div className="card-top">
                <span className="plate-badge">{vehicle.license_plate}</span>
                <div className="card-image-container">
                  <img
                    src={vehicle.vehicleImage || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                    alt={vehicle.model}
                    className="vehicle-image"
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
    </div>
  );
};

export default VehiculosPage;
