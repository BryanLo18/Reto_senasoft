# 🚀 Backend del Dashboard de Aprendices

## 📁 Estructura del Proyecto

```
Reto senasoft/
├── BackEnd/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # Aplicación principal FastAPI
│   │   ├── data_processor.py # Procesamiento de datos
│   │   └── config.py         # Configuración de rutas
│   └── data/
│       ├── DatosActualesSistemasCASA.xlsx  # Archivo de datos
│       └── requirements.txt   # Dependencias Python
└── FrontEnd/
    └── (archivos del frontend)
```

## 🛠️ Instalación y Configuración

### 1. Crear entorno virtual (recomendado)
```bash
cd "Reto senasoft"
python -m venv venv
venv\Scripts\activate  # En Windows
# source venv/bin/activate  # En Linux/Mac
```

### 2. Instalar dependencias
```bash
pip install -r BackEnd/data/requirements.txt
```

### 3. Ejecutar el servidor
```bash
# Desde la carpeta raíz "Reto senasoft"
uvicorn BackEnd.app.main:app --reload
```

## 📊 Endpoints disponibles

- **GET /** - Verificar que la API está funcionando
- **GET /api/data** - Obtener datos del dashboard con filtros opcionales
  - `modalidad` (opcional): Filtrar por modalidad
  - `programa` (opcional): Filtrar por programa
  - `nivel` (opcional): Filtrar por nivel

## 🔧 Configuración

El archivo `config.py` contiene toda la configuración de rutas y constantes:
- Rutas automáticas de archivos
- Configuración de CORS
- Verificación de archivos

## 🧪 Probar la API

Una vez ejecutado, la API estará disponible en:
- **Aplicación**: http://localhost:8000
- **Documentación interactiva**: http://localhost:8000/docs
- **Documentación alternativa**: http://localhost:8000/redoc
