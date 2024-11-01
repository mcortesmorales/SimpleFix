# app/routes.py

from flask import Blueprint, request, jsonify, current_app
import pandas as pd
from flask_cors import cross_origin

file_bp = Blueprint('file', __name__)

# Función para extraer turnos desde "HORARIOS CREADOS.csv"
def extraer_turnos(archivo):
    turnos = []
    turno_actual = {}
    en_turnos = False

    for row in archivo.read().decode('utf-8').splitlines():  # Lee el archivo como texto
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


@file_bp.route('/upload', methods=['POST'])
@cross_origin()
def upload_files():
    if 'horarios_asignados' not in request.files or 'horarios_creados' not in request.files:
        return jsonify({"error": "Ambos archivos 'horarios_asignados' y 'horarios_creados' son necesarios"}), 400

    # Cargar archivos CSV
    horarios_asignados = request.files['horarios_asignados']
    horarios_creados = request.files['horarios_creados']
    
    try:
        # Cargar y procesar "HORARIOS_ASIGNADOS_MODIFICADO.csv"
        df_asignados = pd.read_csv(horarios_asignados)
        
        # Procesar "HORARIOS CREADOS.csv"
        df_turnos = extraer_turnos(horarios_creados)

        # Convertir ambas columnas de códigos a string para evitar conflictos de tipo
        df_asignados['CODIGO HORARIO'] = df_asignados['CODIGO HORARIO'].astype(str)
        df_turnos['codigo_horario'] = df_turnos['codigo_horario'].astype(str)

        # Unificar los datos en un solo DataFrame
        df_unificado = df_asignados.merge(
            df_turnos,
            left_on=['CODIGO HORARIO', 'HORARIO ASIGNADO'],
            right_on=['codigo_horario', 'nombre_horario'],
            how='left'
        ).drop_duplicates(subset=['RUT', 'CODIGO HORARIO'])

    except Exception as e:
        return jsonify({"error": f"Error al procesar archivos CSV: {str(e)}"}), 400

    # Guardar en MongoDB
    try:
        for _, row in df_unificado.iterrows():
            empleado = {
                "RUT": row['RUT'],
                "DV": row['DV'],
                "codigo_horario": row['CODIGO HORARIO'],
                "horario_asignado": row['HORARIO ASIGNADO'],
                "turnos": row['días']  # Incluye todos los días y horarios extraídos
            }
            
            # Insertar cada RUT como un documento único en MongoDB
            current_app.mongo_db.trabajadores.update_one(
                {"RUT": row['RUT']},
                {"$set": empleado},
                upsert=True  # Inserta el documento si no existe
            )

    except Exception as e:
        return jsonify({"error": f"Error al almacenar datos en MongoDB: {str(e)}"}), 500

    return jsonify({"message": "Datos procesados y almacenados correctamente"}), 201

@file_bp.route('/trabajadores', methods=['GET'])
@cross_origin()
def get_trabajadores():
    try:
        # Obtener los primeros 10 documentos de la colección "trabajadores"
        trabajadores = list(current_app.mongo_db.trabajadores.find().limit(10))
        
        # Transformar los documentos a un formato más limpio
        for trabajador in trabajadores:
            trabajador['_id'] = str(trabajador['_id'])  # Convertir ObjectId a string
        
        return jsonify(trabajadores), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener documentos de MongoDB: {str(e)}"}), 500
