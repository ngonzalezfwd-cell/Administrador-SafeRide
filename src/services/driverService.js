/**
 * driverService.js
 *
 * Capa de servicio para la gestión de Conductores.
 * Usa la instancia de Axios centralizada (api.js) que ya
 * incluye el interceptor de token JWT automático.
 *
 * Endpoints mapeados del backend SafeRide:
 *   GET    /users?type=conductor        → getAllDrivers()
 *   GET    /users/:id                   → getDriverById()
 *   GET    /users/:id/stats             → getDriverStats()
 *   PUT    /users/:id                   → updateDriver()
 *   DELETE /users/:id                   → deleteDriver()
 *   POST   /users/:id/image             → uploadImage()
 *
 * @author SafeRide Dev Team
 */

import api from './api';

const driverService = {

  /**
   * Obtiene todos los conductores (type='conductor') con filtros y paginación.
   * @param {Object} params - { page, limit, search, company }
   * @returns {Promise<{ success: boolean, data: Driver[], pagination: object }>}
   */
  getAllDrivers: async (params = {}) => {
    const response = await api.get('/users', {
      params: {
        ...params,
        type: 'conductor', // Filtro fijo al rol conductor
      },
    });
    return response.data;
  },

  /**
   * Obtiene un conductor específico por su ID (con datos de vehículo populados).
   * @param {string} id - MongoDB ObjectId del conductor
   */
  getDriverById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Obtiene las estadísticas de un conductor:
   * viajes como conductor, rating promedio, kilómetros, carbono.
   * @param {string} id - MongoDB ObjectId
   */
  getDriverStats: async (id) => {
    const response = await api.get(`/users/${id}/stats`);
    return response.data;
  },

  /**
   * Actualiza información editable del conductor.
   * Campos permitidos por backend: name, phone, company, work_schedule, profileImage
   * @param {string} id
   * @param {Object} data - Campos a actualizar
   */
  updateDriver: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Desactiva (soft delete) un conductor. Pone isActive = false.
   * Requiere rol admin.
   * @param {string} id
   */
  deleteDriver: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Sube imagen de perfil del conductor a Azure Blob Storage.
   * @param {string} id
   * @param {File} imageFile - Archivo de imagen (jpeg/png, max 5MB)
   */
  uploadImage: async (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.post(`/users/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default driverService;
