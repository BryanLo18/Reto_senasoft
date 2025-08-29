/**
 * @file apiService.js
 * @description Módulo centralizado para todas las interacciones con la API.
 * Provee un conjunto de funciones para abstraer la lógica de las llamadas fetch.
 */

import { logout } from './auth.js';

// --- 1. CONFIGURACIÓN ---
// Centralizamos la URL base de la API para facilitar su mantenimiento.
const BASE_URL = '';


// --- 2. FUNCIÓN PRIVADA DE FETCH ---
/**
 * Motor central para realizar todas las llamadas a la API.
 * Maneja de forma centralizada la autenticación, cabeceras y errores comunes.
 * @private
 * @param {string} endpoint - El endpoint de la API al que se llamará (ej. '/users/create').
 * @param {object} options - El objeto de opciones para la llamada fetch (method, body, etc.).
 * @returns {Promise<any>} La respuesta JSON de la API.
 */
const _fetchAPI = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const token = localStorage.getItem('accessToken');

    // Configuración de cabeceras por defecto
    const headers = {
        'accept': 'application/json',
        ...options.headers // Permite sobreescribir o añadir cabeceras
    };

    // Si la llamada necesita autenticación y hay un token, lo añadimos.
    if (options.requiresAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options, // método, cuerpo, etc.
            headers: headers
        });

        // Manejo de error de autenticación centralizado
        if (response.status === 401) {
            alert('Tu sesión ha expirado o no tienes permiso. Serás redirigido al login.');
            logout();
            throw new Error('Sesión expirada.');
        }

        // Manejo de otros errores del servidor
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Ocurrió un error inesperado.' }));
            throw new Error(errorData.detail);
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
     * Realiza la autenticación del usuario.
     * @param {string} username - El correo del usuario.
     * @param {string} password - La contraseña.
     * @returns {Promise<object>}
     */
    loginUser: (username, password) => {
        const body = new URLSearchParams();
        body.append('username', username);
        body.append('password', password);

        return _fetchAPI('/access/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body,
            requiresAuth: false // La llamada de login no requiere autenticación previa
        });
    },

    /**
     * Obtiene los usuarios por código de centro.
     * @returns {Promise<Array>}
     */
    getUsersByCentro: () => {
        const userString = localStorage.getItem('user');
        if (!userString) {
            return Promise.reject(new Error('Información de usuario no encontrada.'));
        }
        const user = JSON.parse(userString);
        const cod_centro = user.cod_centro;
        
        return _fetchAPI(`/users/get-by-centro?cod_centro=${cod_centro}`, {
            method: 'GET',
            requiresAuth: true // Esta llamada sí necesita el token
        });
    },

    /**
     * Envía los datos de un nuevo usuario a la API para su creación.
     * @param {object} userData - Objeto con los datos del nuevo usuario.
     * @returns {Promise<object>}
     */
    createUser: (userData) => {
        return _fetchAPI('/users/create', { // <-- ¡VERIFICA ESTE ENDPOINT!
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
            requiresAuth: true
        });
    }
};


