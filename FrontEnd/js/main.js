import { apiService } from './apiService.js';

// Variables globales para mantener las instancias de los gráficos
let chartNivel = null;
let chartModalidad = null;
let chartPrograma = null;

// Esto hace que el código se ejecute solo cuando toda la página HTML se ha cargado
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

/**
 * Función principal: Inicializa el dashboard y carga los datos
 */
async function initializeDashboard() {
    // Verificar que la API esté funcionando
    await checkAPIConnection();
    
    // Cargar datos del dashboard
    await fetchDataAndRenderDashboard();
    
    // Configurar filtros si existen
    setupFilters();
}

/**
 * Verifica la conexión con la API
 */
async function checkAPIConnection() {
    try {
        const status = await apiService.checkAPIStatus();
        console.log('✅ API conectada:', status);
    } catch (error) {
        console.error('❌ Error de conexión con la API:', error);
        showErrorMessage('No se pudo conectar con el servidor. Asegúrate de que el backend esté ejecutándose.');
    }
}

/**
 * Función principal: Pide los datos a la API y luego llama a las funciones
 * que actualizan la página web.
 */
async function fetchDataAndRenderDashboard(filters = {}) {
    try {
        showLoadingMessage('Cargando datos del dashboard...');
        
        // Usar el nuevo apiService
        const data = await apiService.getDashboardDataWithFilters(filters);

        // Verificar que los datos tienen la estructura esperada
        if (!data.cards || !data.charts) {
            throw new Error('Los datos recibidos no tienen la estructura esperada');
        }

        // Actualizar las tarjetas con los datos recibidos
        updateCards(data.cards);
        
        // Crear/actualizar gráficos con los datos recibidos
        updateAllCharts(data.charts);
        
        hideLoadingMessage();
        
        console.log('✅ Dashboard actualizado correctamente');

    } catch (error) {
        console.error('❌ Error al obtener los datos desde la API:', error);
        hideLoadingMessage();
        showErrorMessage(`Error al cargar los datos: ${error.message}`);
    }
}

/**
 * Actualiza los números en las tarjetas del HTML.
 * @param {object} cardsData El objeto "cards" que viene del JSON de la API.
 */
function updateCards(cardsData) {
    // Tarjetas de aprendices
    updateElementIfExists('total-aprendices', cardsData.total_aprendices);
    updateElementIfExists('activos', cardsData.activos);
    updateElementIfExists('femeninos', cardsData.femeninos);
    updateElementIfExists('masculinos', cardsData.masculinos);
    updateElementIfExists('no-binarios', cardsData.no_binarios);
    
    // Nuevas tarjetas de grupos
    updateElementIfExists('total-grupos', cardsData.total_grupos);
    updateElementIfExists('grupos-virtuales', cardsData.grupos_virtuales);
    updateElementIfExists('grupos-presenciales', cardsData.grupos_presenciales);
    
    console.log('📊 Tarjetas actualizadas:', cardsData);
}

/**
 * Función genérica para crear o actualizar gráficos Chart.js
 * @param {Object} chartInstance - La variable global del gráfico (ej. chartNivel)
 * @param {string} canvasId - El id del elemento canvas (ej. 'grafico-nivel')
 * @param {string} chartType - El tipo de gráfico (ej. 'bar', 'doughnut', 'pie')
 * @param {Array} data - El array de datos que viene de la API
 * @param {string} labelKey - El nombre de la clave para las etiquetas
 * @param {string} valueKey - El nombre de la clave para los valores
 * @param {string} chartLabel - La etiqueta principal para el conjunto de datos
 * @returns {Object} La nueva instancia del gráfico
 */
function createOrUpdateChart(chartInstance, canvasId, chartType, data, labelKey, valueKey, chartLabel) {
    try {
        // Verificar que tenemos datos
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.warn(`⚠️ No hay datos para el gráfico ${canvasId}`);
            return null;
        }

        // Destruir gráfico anterior si existe
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Procesar los datos de entrada
        const labels = data.map(item => item[labelKey] || 'Sin datos');
        const values = data.map(item => item[valueKey] || 0);

        console.log(`� Creando gráfico ${canvasId}:`, { labels, values });

        // Obtener el contexto del canvas
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`❌ No se encontró el canvas con id: ${canvasId}`);
            return null;
        }

        const ctx = canvas.getContext('2d');

        // Configurar colores según el tipo de gráfico
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ];

        const backgroundColors = colors.slice(0, data.length);
        const borderColors = backgroundColors.map(color => color);

        // Configuración del gráfico
        const config = {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: chartLabel,
                    data: values,
                    backgroundColor: chartType === 'bar' ? 'rgba(54, 162, 235, 0.6)' : backgroundColors,
                    borderColor: chartType === 'bar' ? 'rgba(54, 162, 235, 1)' : borderColors,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: chartLabel,
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: {
                            bottom: 20
                        }
                    },
                    legend: {
                        display: chartType !== 'bar',
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: chartType === 'bar' ? {
                    x: {
                        ticks: {
                            maxRotation: 45,
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 11
                            }
                        }
                    }
                } : {}
            }
        };

        // Crear nueva instancia del gráfico
        const newChart = new Chart(ctx, config);
        
        console.log(`✅ Gráfico ${canvasId} creado exitosamente`);
        return newChart;

    } catch (error) {
        console.error(`❌ Error al crear gráfico ${canvasId}:`, error);
        return null;
    }
}

/**
 * Actualiza todos los gráficos del dashboard
 * @param {object} chartsData Los datos de gráficos de la API
 */
function updateAllCharts(chartsData) {
    try {
        console.log('📈 Actualizando todos los gráficos...');
        console.log('Datos recibidos:', chartsData);

        // Gráfico de Nivel (Doughnut)
        if (chartsData.distribucion_nivel) {
            chartNivel = createOrUpdateChart(
                chartNivel,
                'grafico-nivel',
                'doughnut',
                chartsData.distribucion_nivel,
                'NIVEL_FORMACION',
                'cantidad',
                'Distribución por Nivel de Formación'
            );
        }

        // Gráfico de Modalidad (Pie)
        if (chartsData.distribucion_modalidad) {
            chartModalidad = createOrUpdateChart(
                chartModalidad,
                'grafico-modalidad',
                'pie',
                chartsData.distribucion_modalidad,
                'MODALIDAD_FORMACION',
                'cantidad',
                'Distribución por Modalidad'
            );
        }

        // Gráfico de Programas (Bar)
        if (chartsData.distribucion_programas) {
            chartPrograma = createOrUpdateChart(
                chartPrograma,
                'grafico-programa',
                'bar',
                chartsData.distribucion_programas,
                'NOMBRE_PROGRAMA_FORMACION',
                'cantidad',
                'Distribución por Programa de Formación'
            );
        }

        console.log('✅ Todos los gráficos actualizados');

    } catch (error) {
        console.error('❌ Error al actualizar gráficos:', error);
    }
}

/**
 * Configura los filtros del dashboard si existen en el HTML
 */
function setupFilters() {
    console.log('🔧 Configurando filtros...');
    
    // Buscar elementos de filtro en el HTML
    const modalidadFilter = document.getElementById('filtro-modalidad');
    const programaFilter = document.getElementById('filtro-programa');
    const nivelFilter = document.getElementById('filtro-nivel');
    
    // Configurar eventos de cambio si los elementos existen
    if (modalidadFilter) {
        modalidadFilter.addEventListener('change', function() {
            console.log('📝 Modalidad cambiada a:', this.value);
            applyFilters();
        });
        console.log('✅ Filtro modalidad configurado');
    } else {
        console.warn('⚠️ No se encontró el filtro de modalidad');
    }
    
    if (programaFilter) {
        programaFilter.addEventListener('change', function() {
            console.log('📝 Programa cambiado a:', this.value);
            applyFilters();
        });
        console.log('✅ Filtro programa configurado');
    } else {
        console.warn('⚠️ No se encontró el filtro de programa');
    }
    
    if (nivelFilter) {
        nivelFilter.addEventListener('change', function() {
            console.log('📝 Nivel cambiado a:', this.value);
            applyFilters();
        });
        console.log('✅ Filtro nivel configurado');
    } else {
        console.warn('⚠️ No se encontró el filtro de nivel');
    }
    
    // Cargar opciones de programas dinámicamente
    loadProgramOptions();
}

/**
 * Carga las opciones de programas dinámicamente desde el backend
 */
async function loadProgramOptions() {
    try {
        const data = await apiService.getDashboardData();
        if (data.charts && data.charts.distribucion_programas) {
            const programaSelect = document.getElementById('filtro-programa');
            if (programaSelect) {
                // Limpiar opciones existentes (excepto la primera)
                programaSelect.innerHTML = '<option value="">Todos los programas</option>';
                
                // Agregar opciones basadas en los datos
                data.charts.distribucion_programas.forEach(programa => {
                    const option = document.createElement('option');
                    option.value = programa.NOMBRE_PROGRAMA_FORMACION || programa.programa;
                    option.textContent = programa.NOMBRE_PROGRAMA_FORMACION || programa.programa;
                    programaSelect.appendChild(option);
                });
                
                console.log('✅ Opciones de programa cargadas');
            }
        }
    } catch (error) {
        console.error('❌ Error al cargar opciones de programa:', error);
    }
}

/**
 * Aplica los filtros seleccionados y recarga los datos
 */
async function applyFilters() {
    // Mostrar indicador de carga
    showLoadingMessage('🔍 Aplicando filtros...');
    
    const filters = {
        modalidad: getElementValue('filtro-modalidad'),
        programa: getElementValue('filtro-programa'),
        nivel: getElementValue('filtro-nivel')
    };
    
    // Filtrar valores vacíos
    Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
    });
    
    console.log('🔍 Aplicando filtros:', filters);
    
    // Mostrar qué filtros están activos
    showActiveFilters(filters);
    
    // Recargar datos con filtros
    await fetchDataAndRenderDashboard(filters);
}

/**
 * Muestra qué filtros están actualmente activos
 */
function showActiveFilters(filters) {
    const activeFiltersCount = Object.keys(filters).length;
    
    if (activeFiltersCount > 0) {
        console.log(`📊 ${activeFiltersCount} filtro(s) activo(s):`, filters);
        
        // Opcional: mostrar en la UI los filtros activos
        const filterStatus = document.getElementById('filter-status');
        if (filterStatus) {
            const filterTexts = [];
            if (filters.modalidad) filterTexts.push(`Modalidad: ${filters.modalidad}`);
            if (filters.programa) filterTexts.push(`Programa: ${filters.programa}`);
            if (filters.nivel) filterTexts.push(`Nivel: ${filters.nivel}`);
            
            filterStatus.innerHTML = `
                <div class="alert alert-info alert-sm">
                    <strong>Filtros activos:</strong> ${filterTexts.join(', ')}
                </div>
            `;
        }
    } else {
        console.log('📊 Mostrando todos los datos (sin filtros)');
        
        const filterStatus = document.getElementById('filter-status');
        if (filterStatus) {
            filterStatus.innerHTML = '';
        }
    }
}

/**
 * Funciones auxiliares
 */
function updateElementIfExists(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value || '0';
    }
}

function getElementValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : null;
}

function showLoadingMessage(message) {
    console.log('⏳', message);
    
    // Mostrar spinner en todas las tarjetas
    const cards = [
        'total-aprendices', 'activos', 'femeninos', 'masculinos',
        'total-grupos', 'grupos-virtuales', 'grupos-presenciales'
    ];
    cards.forEach(cardId => {
        const element = document.getElementById(cardId);
        if (element) {
            element.innerHTML = '<i class="ti ti-loader-2 spin"></i>';
            element.style.opacity = '0.6';
        }
    });
    
    // Mostrar mensaje global si existe contenedor
    const loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) {
        loadingContainer.innerHTML = `
            <div class="alert alert-info">
                <i class="ti ti-loader-2 spin me-2"></i> ${message}
            </div>
        `;
        loadingContainer.style.display = 'block';
    }
}

function hideLoadingMessage() {
    console.log('✅ Carga completada');
    
    // Restaurar opacidad de todas las tarjetas
    const cards = [
        'total-aprendices', 'activos', 'femeninos', 'masculinos',
        'total-grupos', 'grupos-virtuales', 'grupos-presenciales'
    ];
    cards.forEach(cardId => {
        const element = document.getElementById(cardId);
        if (element) {
            element.style.opacity = '1';
        }
    });
    
    // Ocultar mensaje global
    const loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) {
        loadingContainer.style.display = 'none';
    }
}

function showErrorMessage(message) {
    console.error('❌', message);
    // Mostrar error en el HTML si existe un contenedor para errores
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${message}
            </div>
        `;
        errorContainer.style.display = 'block';
    } else {
        alert(message);
    }
}