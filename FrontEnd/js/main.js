// La dirección URL de tu API que ya funciona
const API_URL = 'http://127.0.0.1:8000/api/data';

// Esto hace que el código se ejecute solo cuando toda la página HTML se ha cargado
document.addEventListener('DOMContentLoaded', () => {
    fetchDataAndRenderDashboard();
});

/**
 * Función principal: Pide los datos a la API y luego llama a las funciones
 * que actualizan la página web.
 */
async function fetchDataAndRenderDashboard() {
    try {
        // 'fetch' es como ir a la URL en el navegador, pero desde el código
        const response = await fetch(API_URL);
        const data = await response.json(); // Convierte la respuesta JSON en un objeto de JavaScript

        // Llama a la función para actualizar las tarjetas con los datos recibidos
        updateCards(data.cards);
        
        // Próximamente: llamaremos a la función para crear los gráficos
        // createCharts(data.charts);

    } catch (error) {
        console.error('Error al obtener los datos desde la API:', error);
        alert('No se pudieron cargar los datos del servidor. Revisa la consola.');
    }
}

/**
 * Actualiza los números en las tarjetas del HTML.
 * @param {object} cardsData El objeto "cards" que viene del JSON de la API.
 */
function updateCards(cardsData) {
    document.getElementById('total-aprendices').textContent = cardsData.total_aprendices;
    document.getElementById('activos').textContent = cardsData.activos;
    document.getElementById('femeninos').textContent = cardsData.femeninos;
    document.getElementById('masculinos').textContent = cardsData.masculinos;
    // Si quieres mostrar los no binarios, solo necesitas una tarjeta con id="no-binarios"
    // document.getElementById('no-binarios').textContent = cardsData.no_binarios;
}