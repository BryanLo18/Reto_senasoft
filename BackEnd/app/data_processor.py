import pandas as pd
from typing import Optional

def load_data(file_path: str):
    """
    Carga los datos desde un archivo Excel (.xlsx) y los devuelve como un DataFrame.
    """
    try:
        # VERSIÓN CORRECTA: Usamos pd.read_excel para archivos .xlsx
        df = pd.read_excel(file_path) 
        print("Archivo Excel cargado correctamente.")
        return df
    except FileNotFoundError:
        print(f"Error: El archivo Excel no fue encontrado en la ruta: {file_path}")
        return None
    except Exception as e:
        print(f"Ocurrió un error al leer el archivo Excel: {e}")
        return None


def get_dashboard_data(df: pd.DataFrame, modalidad: Optional[str] = None, programa: Optional[str] = None, nivel: Optional[str] = None):
    """
    Filtra el DataFrame y calcula TODAS las métricas para el dashboard.
    """
    
    # 1. Aplicar filtros
    df_filtrado = df.copy()
    
    if modalidad:
        df_filtrado = df_filtrado[df_filtrado['MODALIDAD_FORMACION'] == modalidad]
    if programa:
        df_filtrado = df_filtrado[df_filtrado['NOMBRE_PROGRAMA_FORMACION'] == programa]
    if nivel:
        df_filtrado = df_filtrado[df_filtrado['NIVEL_FORMACION'] == nivel]

    # 2. Calcular los datos para las tarjetas de APRENDICES
    femeninos = int(df_filtrado['TOTAL_APRENDICES_FEMENINOS'].sum())
    masculinos = int(df_filtrado['TOTAL_APRENDICES_MASCULINOS'].sum())
    no_binarios = int(df_filtrado['TOTAL_APRENDICES_NOBINARIO'].sum())
    total_aprendices = femeninos + masculinos + no_binarios
    aprendices_activos = int(df_filtrado['TOTAL_APRENDICES_ACTIVOS'].sum())
    
    # --- NUEVA SECCIÓN: CALCULAR TARJETAS DE GRUPOS ---
    total_grupos = len(df_filtrado)
    
    # Contamos cuántas filas hay para cada modalidad
    conteo_modalidad = df_filtrado['MODALIDAD_FORMACION'].value_counts()
    grupos_virtuales = int(conteo_modalidad.get('VIRTUAL', 0))
    grupos_presenciales = int(conteo_modalidad.get('PRESENCIAL', 0))
    
    # 3. Calcular los datos para las GRÁFICAS
    dist_programas = df_filtrado.groupby('NOMBRE_PROGRAMA_FORMACION').size().reset_index(name='cantidad').to_dict('records')
    dist_modalidad = df_filtrado.groupby('MODALIDAD_FORMACION').size().reset_index(name='cantidad').to_dict('records')
    dist_nivel = df_filtrado.groupby('NIVEL_FORMACION').size().reset_index(name='cantidad').to_dict('records')

    # 4. Estructurar la respuesta final (con las nuevas tarjetas)
    resultado = {
        "cards": {
            "total_aprendices": total_aprendices,
            "femeninos": femeninos,
            "masculinos": masculinos,
            "no_binarios": no_binarios,
            "activos": aprendices_activos,
            # --- NUEVOS DATOS AÑADIDOS ---
            "total_grupos": total_grupos,
            "grupos_virtuales": grupos_virtuales,
            "grupos_presenciales": grupos_presenciales
        },
        "charts": {
            "distribucion_programas": dist_programas,
            "distribucion_modalidad": dist_modalidad,
            "distribucion_nivel": dist_nivel
        }
    }
    
    return resultado