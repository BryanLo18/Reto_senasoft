"""
Configuración de rutas y constantes para el proyecto
"""
import os
from pathlib import Path

# Obtener la ruta base del proyecto
BASE_DIR = Path(__file__).parent.parent  # BackEnd/
PROJECT_ROOT = BASE_DIR.parent  # Reto senasoft/

# Rutas de datos
DATA_DIR = BASE_DIR / "data"
EXCEL_FILE = DATA_DIR / "DatosActualesSistemasCASA.xlsx"

# Rutas relativas para usar en el código
EXCEL_FILE_PATH = str(EXCEL_FILE)

# Verificar que el archivo existe
def verify_data_file():
    """Verifica que el archivo de datos existe"""
    if not EXCEL_FILE.exists():
        raise FileNotFoundError(f"No se encontró el archivo de datos en: {EXCEL_FILE_PATH}")
    return True

# Configuración de la API
API_CONFIG = {
    "title": "API del Dashboard de Aprendices",
    "description": "API para servir los datos necesarios para el dashboard interactivo.",
    "version": "1.0.0"
}

# Configuración de CORS
CORS_ORIGINS = [
    "http://localhost",
    "http://127.0.0.1:5500",  # Puerto común para Live Server de VS Code
    "http://localhost:3000",  # Puerto común para React
    "http://localhost:8080",  # Puerto común para Vue
    "*"  # Permite cualquier origen (solo para desarrollo)
]
