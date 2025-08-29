/**
 * @file apiService.js
 * @description Módulo centralizado para todas las interacciones con la API del Dashboard de Aprendices.
 * Provee funciones para obtener datos del dashboard con filtros opcionales.
 */

// --- 1. CONFIGURACIÓN ---
// URL base de tu API FastAPI
const BASE_URL = 'http://localhost:8000';


// --- 2. FUNCIÓN PRIVADA DE FETCH ---
/**
 * Motor central para realizar todas las llamadas a la API.
 * Maneja de forma centralizada las cabeceras y errores comunes.
 * @private
 * @param {string} endpoint - El endpoint de la API al que se llamará (ej. '/api/data').
 * @param {object} options - El objeto de opciones para la llamada fetch (method, body, etc.).
 * @returns {Promise<any>} La respuesta JSON de la API.
 */
const _fetchAPI = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;

    // Configuración de cabeceras por defecto
    const headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers // Permite sobreescribir o añadir cabeceras
    };

    try {
        const response = await fetch(url, {
            ...options, // método, cuerpo, etc.
            headers: headers
        });

        // Manejo de errores del servidor
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ 
                error: `Error ${response.status}: ${response.statusText}` 
            }));
            throw new Error(errorData.error || errorData.detail || 'Error del servidor');
        }

        
        // Si la respuesta no tiene contenido (ej. un 204 No Content), devolvemos un objeto vacío.
        if (response.status === 204) {
            return {};
        }

        return await response.json();

    } catch (error) {
        console.error(`Error en la llamada API a ${endpoint}:`, error.message);
        // Relanzamos el error para que la función que llamó originalmente pueda manejarlo.
        throw error;
    }
};

// --- 3. SERVICIO PÚBLICO EXPORTADO ---
export const apiService = {

    /**
     * Obtiene todos los datos del dashboard sin filtros.
     * @returns {Promise<object>} Datos del dashboard con cards y charts
     */
    getDashboardData: () => {
        return _fetchAPI('/api/data', {
            method: 'GET'
        });
    },

    /**
     * Obtiene datos del dashboard con filtros específicos.
     * @param {object} filters - Objeto con filtros opcionales
     * @param {string} filters.modalidad - Filtro por modalidad
     * @param {string} filters.programa - Filtro por programa  
     * @param {string} filters.nivel - Filtro por nivel
     * @returns {Promise<object>} Datos filtrados del dashboard
     */
    getDashboardDataWithFilters: (filters = {}) => {
        // Construir query parameters
        const params = new URLSearchParams();
        
        if (filters.modalidad) params.append('modalidad', filters.modalidad);
        if (filters.programa) params.append('programa', filters.programa);
        if (filters.nivel) params.append('nivel', filters.nivel);

        const queryString = params.toString();
        const endpoint = queryString ? `/api/data?${queryString}` : '/api/data';

        return _fetchAPI(endpoint, {
            method: 'GET'
        });
    },

    /**
     * Verifica que la API esté funcionando.
     * @returns {Promise<object>} Estado de la API
     */
    checkAPIStatus: () => {
        return _fetchAPI('/', {
            method: 'GET'
        });
    }
};


