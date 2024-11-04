from flask import Blueprint, request, jsonify, current_app
import pandas as pd
from flask_cors import cross_origin
from bson import ObjectId

file_bp = Blueprint('file', __name__)

# Función para extraer los turnos desde el CSV "HORARIOS CREADOS.csv"
def extraer_turnos(file):
    turnos = []
    turno_actual = {}
    en_turnos = False

    for row in file.read().decode('utf-8').splitlines():
        row = row.strip()
        
        if row.startswith("Codigo horario  :"):
            if turno_actual:
                turnos.append(turno_actual)
                turno_actual = {}
            
            parts = row.split(';')
            turno_actual['codigo_horario'] = parts[1].strip()
            turno_actual['nombre_horario'] = parts[3].strip()
            turno_actual['días'] = []
            en_turnos = True
        
        elif en_turnos and len(row) > 0:
            partes_dia = row.split(';')
            if len(partes_dia) >= 6:
                dia_info = {
                    'dia': partes_dia[19].strip(),
                    'hora_entrada': partes_dia[20].strip(),
                    'hora_salida': partes_dia[21].strip(),
                }
                if dia_info['dia'] and dia_info['hora_entrada'] and dia_info['hora_salida']:
                    turno_actual['días'].append(dia_info)
        
        elif en_turnos and row.startswith("MINISTERIO DE SALUD;"):
            en_turnos = False

    if turno_actual:
        turnos.append(turno_actual)

    return pd.DataFrame(turnos)

# Cargar y procesar el archivo "HORARIOS_ASIGNADOS_MODIFICADO.csv"
def cargar_horarios_asignados(file):
    return pd.read_csv(file)

# Crear el DataFrame unificado, sin eliminar duplicados de RUT + CODIGO HORARIO
def unir_datos(turnos_df, asignados_df):
    # Convertir ambas columnas de códigos a string
    turnos_df['codigo_horario'] = turnos_df['codigo_horario'].astype(str)
    asignados_df['CODIGO HORARIO'] = asignados_df['CODIGO HORARIO'].astype(str)
    
    # Realizar la unión
    df_unido = asignados_df.merge(turnos_df, left_on=['CODIGO HORARIO', 'HORARIO ASIGNADO'],
                                  right_on=['codigo_horario', 'nombre_horario'], how='left')
    
    # Eliminar duplicados basados en RUT y CODIGO HORARIO, conservando solo la primera ocurrencia
    df_unido = df_unido.drop_duplicates(subset=['RUT', 'CODIGO HORARIO'])
    
    # Eliminar las columnas adicionales de la unión para simplificar el resultado
    df_unido.drop(['codigo_horario', 'nombre_horario'], axis=1, inplace=True)
    
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
def obtener_trabajador_por_rut(rut):
    trabajador = current_app.mongo_db.trabajadores.find_one({'RUT': rut})
    
    if trabajador:
        # Convierte el campo '_id' a cadena para que sea JSON serializable
        trabajador['_id'] = str(trabajador['_id'])  
        return jsonify(trabajador), 200
    else:
        return jsonify({'mensaje': 'Trabajador no encontrado'}), 404