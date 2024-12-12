from flask import Blueprint, request, jsonify, current_app
import pandas as pd
from flask_cors import cross_origin
from bson import ObjectId
from io import StringIO

file_bp = Blueprint('file', __name__)

# Función para extraer los turnos desde el CSV "HORARIOS CREADOS.csv"
def extraer_turnos(file):
    """
    Procesa el archivo CSV con información de horarios y lo convierte en un DataFrame.

    Args:
        file (FileStorage): El archivo "HORARIOS CREADOS.csv" cargado en Flask.

    Returns:
        pd.DataFrame: DataFrame con los horarios procesados, donde los días y horas están agrupados.
    """
    # Leer el contenido del archivo en memoria
    file_content = file.stream.read().decode('utf-8')
    raw_data = file_content.splitlines()

    horarios = []
    codigo_horario = None
    nombre_horario = None
    turnos_agrupados = []

    for line in raw_data:
        line = line.strip()
        if line.startswith("Codigo horario  :"):
            # Procesar nueva sección de horario
            parts = line.split(";")
            codigo_horario = parts[1].strip()
            nombre_horario = parts[3].strip()

            # Si hay turnos acumulados, guardar el horario anterior
            if turnos_agrupados:
                horarios.append({
                    "codigo_horario": codigo_horario_anterior,
                    "nombre_horario": nombre_horario_anterior,
                    "días": turnos_agrupados
                })
                turnos_agrupados = []

            # Actualizar los valores actuales
            codigo_horario_anterior = codigo_horario
            nombre_horario_anterior = nombre_horario

            if len(parts) > 14:  # Procesar el primer turno de la misma línea
                dia = parts[14].strip()
                hora_entrada = parts[15].strip()
                hora_salida = parts[16].strip()

                turnos_agrupados.append({
                    "dia": dia,
                    "hora_entrada": hora_entrada,
                    "hora_salida": hora_salida
                })

        elif any(day in line for day in ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"]):
            # Procesar turnos adicionales en las líneas siguientes
            parts = line.split(";")
            dia = parts[19].strip()
            hora_entrada = parts[20].strip()
            hora_salida = parts[21].strip()

            turnos_agrupados.append({
                "dia": dia,
                "hora_entrada": hora_entrada,
                "hora_salida": hora_salida
            })

    # Agregar el último grupo procesado
    if turnos_agrupados:
        horarios.append({
            "codigo_horario": codigo_horario,
            "nombre_horario": nombre_horario,
            "días": turnos_agrupados
        })

    # Convertir a DataFrame
    df_horarios = pd.DataFrame(horarios)
    return df_horarios


# Cargar y procesar el archivo "HORARIOS_ASIGNADOS_MODIFICADO.csv"
def cargar_horarios_asignados(archivo_csv):
    """
    Carga y procesa el archivo CSV "HORARIOS_ASIGNADOS_MODIFICADO.csv".

    Args:
        archivo_csv (str): Ruta al archivo "HORARIOS_ASIGNADOS_MODIFICADO.csv".

    Returns:
        pd.DataFrame: DataFrame con los horarios asignados.
    """
    df_asignados = pd.read_csv(archivo_csv)
    return df_asignados

# Crear el DataFrame unificado, sin eliminar duplicados de RUT + CODIGO HORARIO
def unir_datos(turnos_df, asignados_df):
    """
    Une los DataFrames de turnos y asignaciones, manejando trabajadores con un solo horario y eliminando duplicados.

    Args:
        turnos_df (pd.DataFrame): DataFrame con los horarios de turnos.
        asignados_df (pd.DataFrame): DataFrame con los horarios asignados.

    Returns:
        pd.DataFrame: DataFrame unificado.
    """
    # Asegurarnos de que las columnas necesarias están en formato string
    turnos_df['codigo_horario'] = turnos_df['codigo_horario'].astype(str)
    asignados_df['CODIGO HORARIO'] = asignados_df['CODIGO HORARIO'].astype(str)
    
    # Realizar la unión entre los DataFrames solo usando CODIGO HORARIO
    df_unido = asignados_df.merge(
        turnos_df,
        left_on=['CODIGO HORARIO'],
        right_on=['codigo_horario'],
        how='left'
    )
    
    # Detectar filas sin unión (donde los turnos no se asignaron correctamente)
    missing_data = df_unido[df_unido['codigo_horario'].isna()]
    
    if not missing_data.empty:
        print(f"Advertencia: Hay {len(missing_data)} filas sin unión. Revisa los datos para inconsistencias.")
        print(missing_data[['CODIGO HORARIO']].drop_duplicates())

    # Eliminar duplicados basados en RUT y CODIGO HORARIO, conservando solo la primera ocurrencia
    df_unido = df_unido.drop_duplicates(subset=['RUT', 'CODIGO HORARIO'])
    
    # Eliminar las columnas adicionales de la unión para simplificar el resultado
    df_unido.drop(['codigo_horario', 'nombre_horario'], axis=1, inplace=True)
    
    # Rellenar valores faltantes en 'días' y otros campos si es necesario
    df_unido['días'] = df_unido['días'].fillna("[]")
    
    
    return df_unido

# Endpoint para subir los archivos
@file_bp.route('/upload', methods=['POST'])
def upload_files():
    if 'horarios_asignados' not in request.files or 'horarios_creados' not in request.files:
        return jsonify({"error": "Ambos archivos 'horarios_asignados' y 'horarios_creados' son necesarios"}), 400

    # Cargar archivos CSV
    horarios_asignados = request.files['horarios_asignados']
    horarios_creados = request.files['horarios_creados']

    # Limpiar la colección de trabajadores antes de la nueva carga
    try:
        current_app.mongo_db.trabajadores.delete_many({})  # Elimina todos los documentos
    except Exception as e:
        return jsonify({"error": f"Error al limpiar la base de datos: {str(e)}"}), 500

    # Extraer y unir datos
    turnos_df = extraer_turnos(horarios_creados)
    asignados_df = cargar_horarios_asignados(horarios_asignados)
    df_unificado = unir_datos(turnos_df, asignados_df)

    # Convertir DataFrame a diccionarios para MongoDB con la estructura deseada
    trabajadores_data = []
    for index, row in df_unificado.iterrows():
        trabajador_documento = {
            "RUT": row['RUT'],
            "DV": row['DV'],
            "codigo_horario": row['CODIGO HORARIO'],
            "horario_asignado": row['HORARIO ASIGNADO'],
            "turnos": row['días']  # Incluye todos los días y horarios extraídos
        }
        trabajadores_data.append(trabajador_documento)

    # Insertar en la colección 'trabajadores' de MongoDB
    try:
        current_app.mongo_db.trabajadores.insert_many(trabajadores_data)
        return jsonify({"message": "Datos subidos correctamente a MongoDB"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Endpoint para contar los trabajadores únicos en base a RUT + CODIGO HORARIO
@file_bp.route('/trabajadores2/count', methods=['GET'])
def contar_trabajadores():
    try:
        # Obtener el conteo de combinaciones únicas de RUT y CODIGO HORARIO
        total_trabajadores = current_app.mongo_db.trabajadores.count_documents({})
        
        return jsonify({"total_trabajadores": total_trabajadores}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@file_bp.route('/trabajadores2', methods=['GET'])
def obtener_trabajadores2():
    try:
        # Obtener todos los trabajadores desde MongoDB
        trabajadores = list(current_app.mongo_db.trabajadores.find({}, {"_id": 0}))
        return jsonify(trabajadores), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@file_bp.route('/trabajadores', methods=['GET'])
def obtener_trabajadores():
    try:
        # Obtener los parámetros de paginación
        page = int(request.args.get('page', 1))  # Página actual
        limit = int(request.args.get('limit', 10))  # Límites por página

        # Calcular el número total de trabajadores
        total_trabajadores = current_app.mongo_db.trabajadores.count_documents({})

        # Calcular los trabajadores a devolver
        trabajadores = list(current_app.mongo_db.trabajadores.find({}, {"_id": 0})
                            .skip((page - 1) * limit)
                            .limit(limit))

        return jsonify({"trabajadores": trabajadores, "total": total_trabajadores}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@file_bp.route('/trabajadores/<string:rut>', methods=['GET'])
def obtener_trabajadores_por_rut(rut):
    # Busca todos los registros que coincidan con el RUT
    trabajadores = current_app.mongo_db.trabajadores.find({'RUT': rut})
    
    # Convierte el cursor en una lista de documentos y transforma '_id' para cada uno
    trabajadores_list = []
    for trabajador in trabajadores:
        trabajador['_id'] = str(trabajador['_id'])  # Convierte '_id' a cadena
        trabajadores_list.append(trabajador)
    
    if trabajadores_list:
        return jsonify(trabajadores_list), 200
    else:
        return jsonify({'mensaje': 'Trabajador no encontrado'}), 404

@file_bp.route('/trabajadores/horario2', methods=['GET'])
def obtener_trabajadores_por_horario2():
    try:
        # Obtener el parámetro del horario asignado desde los argumentos de la solicitud
        horario_asignado = request.args.get('horario_asignado', None)
        
        if not horario_asignado:
            return jsonify({"error": "El parámetro 'horario_asignado' es obligatorio"}), 400

        # Buscar trabajadores que tengan el horario asignado especificado
        trabajadores = list(current_app.mongo_db.trabajadores.find({'horario_asignado': horario_asignado}, {"_id": 0}))
        
        if trabajadores:
            return jsonify(trabajadores), 200
        else:
            return jsonify({'mensaje': 'No se encontraron trabajadores con el horario asignado especificado'}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@file_bp.route('/horarios_asignados', methods=['GET'])
def obtener_horarios_asignados():
    try:
        # Obtener una lista única de horarios asignados desde MongoDB
        horarios_asignados = current_app.mongo_db.trabajadores.distinct('horario_asignado')
        
        if horarios_asignados:
            return jsonify({"horarios_asignados": horarios_asignados}), 200
        else:
            return jsonify({"mensaje": "No se encontraron horarios asignados"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@file_bp.route('/trabajadores/horario', methods=['GET'])
def obtener_trabajadores_por_horario():
    try:
        # Obtener el parámetro del horario asignado desde los argumentos de la solicitud
        horario_asignado = request.args.get('horario_asignado', None)
        
        if not horario_asignado:
            return jsonify({"error": "El parámetro 'horario_asignado' es obligatorio"}), 400

        # Obtener los parámetros de paginación
        page = int(request.args.get('page', 1))  # Página actual
        limit = int(request.args.get('limit', 10))  # Límites por página

        # Calcular el número total de trabajadores con el horario asignado especificado
        total_trabajadores = current_app.mongo_db.trabajadores.count_documents({'horario_asignado': horario_asignado})

        # Calcular los trabajadores a devolver
        trabajadores = list(current_app.mongo_db.trabajadores.find({'horario_asignado': horario_asignado}, {"_id": 0})
                            .skip((page - 1) * limit)
                            .limit(limit))

        if trabajadores:
            return jsonify({
                "trabajadores": trabajadores,
                "total": total_trabajadores,
                "page": page,
                "limit": limit
            }), 200
        else:
            return jsonify({'mensaje': 'No se encontraron trabajadores con el horario asignado especificado'}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500



