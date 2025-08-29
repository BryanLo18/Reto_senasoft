# --- 1. IMPORTACIONES DE LIBRERÍAS ---
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import Optional

# Importamos las funciones de nuestro módulo de procesamiento
from .data_processor import load_data, get_dashboard_data
# Importamos la configuración
from .config import API_CONFIG, CORS_ORIGINS, EXCEL_FILE_PATH, verify_data_file


# --- 2. INICIALIZACIÓN DE LA APLICACIÓN FASTAPI ---
app = FastAPI(
    title="API del Dashboard de Aprendices",
    description="API para servir los datos necesarios para el dashboard interactivo.",
    version="1.0.0"
)


# --- 3. CONFIGURACIÓN DE CORS (PERMISOS DE CONEXIÓN) ---
# Permite que el frontend (en otro puerto) pueda comunicarse con este backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- 4. CARGA DE DATOS AL INICIAR LA APLICACIÓN ---
# La API lee el archivo una sola vez al arrancar para ser más eficiente.
try:
    # Verificar que el archivo existe antes de cargarlo
    verify_data_file()
    # Usar la ruta configurada
    df_aprendices = load_data(EXCEL_FILE_PATH)
    print(f"✅ Archivo cargado exitosamente desde: {EXCEL_FILE_PATH}")
except Exception as e:
    print(f"❌ Error crítico al cargar los datos: {e}")
    df_aprendices = pd.DataFrame()



# --- 5. DEFINICIÓN DE ENDPOINTS (RUTAS DE LA API) ---

@app.get("/")
def read_root():
    """Endpoint raíz para verificar que la API está viva."""
    return {"status": "API del Dashboard funcionando correctamente"}


@app.get("/api/data")
def get_filtered_data(  # Nombre claro sin conflicto
    modalidad: Optional[str] = Query(None, description="Filtrar por modalidad de formación"),
    programa: Optional[str] = Query(None, description="Filtrar por nombre del programa de formación"),
    nivel: Optional[str] = Query(None, description="Filtrar por nivel de formación")
):
    """
    Endpoint principal que calcula y devuelve todos los datos para el dashboard.
    Acepta filtros opcionales para recalcular los datos dinámicamente.
    """
    if df_aprendices is None or df_aprendices.empty:
        return {"error": "Los datos no están cargados. Revisa la ruta del archivo y los errores en la consola."}

    # Usamos la función importada con su nuevo nombre "process_data"
    dashboard_data = get_dashboard_data(df_aprendices, modalidad, programa, nivel)
    
    return dashboard_data
# --- INSTRUCCIONES PARA EJECUTAR ---
# En la terminal, desde la carpeta "Reto senasoft", usa el comando:
# uvicorn BackEnd.app.main:app --reload