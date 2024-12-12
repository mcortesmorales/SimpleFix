import os
from flask import Blueprint, request, jsonify
from models import allowed_file, save_file, save_configurations_model, get_configurations_model
from config import Config
import csv
from flask import send_file
import pandas as pd
from datetime import datetime, timedelta

upload_bp = Blueprint('upload_bp', __name__)

# Suponiendo que tienes un directorio donde se guardan los archivos
UPLOAD_FOLDER = Config.UPLOAD_FOLDER  # Cambia esta ruta al directorio donde guardas los archivos

def normalize_filename(filename):
    # Normaliza el nombre del archivo reemplazando espacios por guiones bajos
    return filename.replace(' ', '_')

@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No se encontró ningún archivo'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No se ha seleccionado ningún archivo'}), 400

    if file and allowed_file(file.filename):
        # Normaliza el nombre del archivo
        normalized_filename = normalize_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, normalized_filename)

        # Verifica si el encabezado de sobrescritura está presente
        overwrite = request.headers.get('Overwrite', 'false').lower() == 'true'

        if os.path.exists(file_path) and not overwrite:
            # Si el archivo existe y no hay solicitud de sobrescritura, retorna el 409
            return jsonify({'message': 'El archivo ya existe. ¿Desea sobrescribirlo?', 'overwrite': True}), 409

        # Guarda (o sobrescribe) el archivo ___________________________ esto se esta guardando en una carpeta junto con el codigo, ta como raaaaro
        save_file(file, normalized_filename)
        return jsonify({'message': 'Archivo subido y guardado correctamente', 'file_path': file_path}), 200
    else:
        return jsonify({'message': 'Por favor, sube un archivo .txt'}), 400



@upload_bp.route('/files', methods=['GET'])
def list_files():
    try:
        files_info = []
        for filename in os.listdir(UPLOAD_FOLDER):  # Itera sobre los archivos en el directorio
            if allowed_file(filename):  # Filtra solo archivos permitidos
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                # Obtiene la fecha de modificación
                modification_time = os.path.getmtime(file_path)
                # Convierte la fecha a un formato legible
                files_info.append({
                    'name': filename,
                    'date': modification_time  # Guarda el timestamp
                })
        return jsonify({'files': files_info}), 200  # Envía la lista de archivos con información
    except Exception as e:
        return jsonify({'message': 'Error al listar los archivos', 'error': str(e)}), 500


@upload_bp.route('/files/<filename>', methods=['DELETE'])
def delete_file(filename):
    try:
        # Verifica si el archivo es permitido
        if not allowed_file(filename):
            return jsonify({'message': 'Tipo de archivo no permitido'}), 400

        file_path = os.path.join(UPLOAD_FOLDER, filename)

        # Verifica si el archivo existe
        if os.path.exists(file_path):
            os.remove(file_path)  # Elimina el archivo
            return jsonify({'message': 'Archivo eliminado correctamente'}), 200
        else:
            return jsonify({'message': 'Archivo no encontrado'}), 404
    except Exception as e:
        return jsonify({'message': 'Error al eliminar el archivo', 'error': str(e)}), 500

@upload_bp.route('/files/<filename>', methods=['GET'])
def get_file_data(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    
    if not os.path.exists(file_path):
        return jsonify({'message': 'Archivo no encontrado'}), 404

    marcajes = []
    with open(file_path, 'r') as file:
        reader = csv.reader(file)
        for row in reader:
            # Extrae las columnas relevantes
            entrada_salida = "Entrada" if (row[2] == "01") else "Salida"
            rut = row[3]
            hora = row[5]
            minutos = row[6]
            mes = row[7]
            dia = row[8]
            año = row[9]

            marcajes.append({
                'entrada_salida': entrada_salida,
                'rut': rut,
                'hora': f"{hora}:{minutos}",
                'fecha': f"{dia}/{mes}/{año}"
            })
    
    return jsonify(marcajes), 200


@upload_bp.route('/files/<filename>/download', methods=['GET'])
def download_file(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(file_path):
        return jsonify({'message': 'Archivo no encontrado'}), 404

    # Enviar el archivo para descarga
    return send_file(file_path, as_attachment=True), 200


def get_interval_for_rut(config_json,rut, timestamp):
    config = config_json if isinstance(config_json, dict) else config_json.get_json()

    # Prioridad 1: Group Intervals
    for group in config["groupIntervals"]:
        if group["active"] and rut in group["ruts"]:
            return timedelta(minutes=int(group["interval"]))

    # Prioridad 2: Custom Values
    for custom in config["customValues"]:
        if custom["active"]:
            start_time = datetime.strptime(custom["startTime"], "%H:%M").time()
            end_time = datetime.strptime(custom["endTime"], "%H:%M").time()
            if start_time <= timestamp.time() <= end_time:
                return timedelta(minutes=custom["interval"])

    # Prioridad 3: Default Interval
    return timedelta(minutes=int(config["defaultInterval"]))




@upload_bp.route('/diagnose/<filename>', methods=['POST'])
def diagnose_duplicates(filename):

    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({'message': 'Archivo no encontrado'}), 404

    config = get_configurations_model()

    # Leer el archivo y asignar nombres a las columnas
    df = pd.read_csv(file_path, header=None, names=[
        "id", "col2", "entrada_salida", "rut", "col5", "hora", "minuto", "mes", "dia", "anio",
        "col10", "col11", "col12", "col13", "col14", "col15", "col16", "col17", "col18"
    ])
    
    # Convertir a timestamp para facilitar la comparación
    df["timestamp"] = df.apply(lambda row: datetime(
        row["anio"], row["mes"], row["dia"], row["hora"], row["minuto"]
    ), axis=1)

    # Ordenar por RUT y timestamp
    df.sort_values(by=["rut", "timestamp"], inplace=True)
    df = df.reset_index(drop=True)
    
    # Procesar duplicados
    adjusted_rows = []
    for i, row in df.iterrows():
        if i == 0:
            adjusted_rows.append({**row, "isDuplicate": False})
            continue
        
        previous_row = adjusted_rows[-1]
        
        # Chequear si es la misma persona y si la diferencia de tiempo es menor a 3 minutos
        if row["rut"] == previous_row["rut"] and row["entrada_salida"] == 1:
            time_difference = row["timestamp"] - previous_row["timestamp"]
            interval = get_interval_for_rut(config,row["rut"], row["timestamp"])
            # Buscar una salida entre las dos entradas
            salida_found = any(
                df.iloc[j]["entrada_salida"] == 3 and df.iloc[j]["rut"] == row["rut"]
                for j in range(i - 1, i)  # Chequear solo entre la fila anterior y la actual
            )
            
            if time_difference < interval and not salida_found:
                # Marcar como duplicado si no se encontró una salida
                adjusted_rows.append({**row, "isDuplicate": True})
                continue
            
        # Si no es un duplicado, simplemente agregar la fila original
        adjusted_rows.append({**row, "isDuplicate": False})

    # Convertir a formato solicitado por el frontend
    marcajes = []
    for row in adjusted_rows:
        entrada_salida = "Entrada" if row["entrada_salida"] == 1 else "Salida"
        rut = row["rut"]
        hora = f"{int(row['hora']):02}:{int(row['minuto']):02}"
        fecha = f"{int(row['dia']):02}/{int(row['mes']):02}/{row['anio']}"
        is_duplicate = row["isDuplicate"]

        marcajes.append({
            'entrada_salida': entrada_salida,
            'rut': rut,
            'hora': hora,
            'fecha': fecha,
            'isDuplicate': is_duplicate
        })

    # Contar duplicados
    duplicates_count = sum(1 for row in marcajes if row['isDuplicate'])

    return jsonify({'markedData': marcajes, 'duplicatesCount': duplicates_count}), 200



#aca puede que si la persona trate de reparar un archivo ya reparado agregue cosas demas porque no ordena como ordena en el diagnose
@upload_bp.route('/repair/<filename>', methods=['POST'])
def repair_duplicates(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({'message': 'Archivo no encontrado'}), 404

    config = get_configurations_model()

    # Leer el archivo con formato original
    df = pd.read_csv(file_path, header=None, names=[
        "id", "col2", "entrada_salida", "rut", "col5", "hora", "minuto", "mes", "dia", "anio",
        "col10", "col11", "col12", "col13", "col14", "col15", "col16", "col17", "col18"
    ], dtype=str)  # Leer todo como string para preservar el formato

    # Convertir a timestamp para facilitar la comparación
    df["timestamp"] = df.apply(lambda row: datetime(
        int(row["anio"]), int(row["mes"]), int(row["dia"]), int(row["hora"]), int(row["minuto"])
    ), axis=1)

    # Ordenar por RUT y timestamp
    df.sort_values(by=["rut", "timestamp"], inplace=True)
    df = df.reset_index(drop=True)

    # Contador de modificados
    modificados = 0

    # Procesar duplicados y crear una lista de filas ajustadas
    adjusted_rows = []
    for i, row in df.iterrows():
        if i == 0:
            adjusted_rows.append(row)
            continue

        previous_row = adjusted_rows[-1]

        if row["rut"] == previous_row["rut"] and row["entrada_salida"] == '01':
            time_difference = row["timestamp"] - previous_row["timestamp"]
            interval = get_interval_for_rut(config,row["rut"], row["timestamp"])
            # Buscar una salida intermedia entre las dos entradas
            salida_found = any(
                df.iloc[j]["entrada_salida"] == '03' and df.iloc[j]["rut"] == row["rut"]
                for j in range(i - 1, i)
            )

            # Solo si no hay salida intermedia y la diferencia de tiempo es menor a 3 minutos
            if time_difference < interval and not salida_found:
                # Ajustar el registro: convertir la segunda marca de entrada en salida y crear un nuevo registro de entrada
                salida_row = row.copy()
                salida_row["entrada_salida"] = "3"  # Convertir a salida

                entrada_row = row.copy()  # Crear un nuevo registro de entrada con el mismo horario

                # Agregar los ajustes
                adjusted_rows.append(salida_row)
                adjusted_rows.append(entrada_row)
                modificados += 1  # Incrementar el contador
                continue

        adjusted_rows.append(row)

    # Convertir de nuevo a DataFrame y ordenar por timestamp
    adjusted_df = pd.DataFrame(adjusted_rows)
    adjusted_df.sort_values(by=["timestamp", "entrada_salida"], ascending=[True, False], inplace=True)

    # Eliminar la columna de timestamp
    adjusted_df.drop(columns=["timestamp"], inplace=True)

    # Convertir las columnas numéricas a su formato original
    adjusted_df["id"] = adjusted_df["id"].apply(lambda x: x.zfill(3))
    adjusted_df["hora"] = adjusted_df["hora"].apply(lambda x: x.zfill(2))
    adjusted_df["minuto"] = adjusted_df["minuto"].apply(lambda x: x.zfill(2))
    adjusted_df["mes"] = adjusted_df["mes"].apply(lambda x: x.zfill(2))
    adjusted_df["dia"] = adjusted_df["dia"].apply(lambda x: x.zfill(2))
    adjusted_df["anio"] = adjusted_df["anio"].apply(lambda x: x.zfill(2))

    # Guardar los resultados en un archivo nuevo con formato original
    repaired_file_path = os.path.join(UPLOAD_FOLDER, filename)
    adjusted_df.to_csv(repaired_file_path, index=False, header=False, float_format="%.2f")

    # Incluir el número de modificados en la respuesta
    return jsonify({'repairedData': adjusted_df.to_dict(orient='records'), 'modificados': modificados}), 200


@upload_bp.route('/time-condition', methods=['POST'])
def create_time_condition():
    data = request.json
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    interval = data.get("interval")

    if not (start_time and end_time and interval is not None):
        return jsonify({"error": "Información incompleta"}), 400

    condition_id = db.time_conditions.insert_one({
        "start_time": start_time,
        "end_time": end_time,
        "interval": interval
    }).inserted_id

    return jsonify({"message": "Condición de tiempo creada", "id": str(condition_id)}), 201

# Obtener todas las condiciones de tiempo
@upload_bp.route('/time-conditions', methods=['GET'])
def get_time_conditions():
    conditions = list(db.time_conditions.find({}, {"_id": 1, "start_time": 1, "end_time": 1, "interval": 1}))
    for condition in conditions:
        condition["_id"] = str(condition["_id"])
    return jsonify(conditions), 200

# crear o actualizar grupo
@upload_bp.route('/group', methods=['POST'])
def create_or_update_group():
    """Crea o actualiza un grupo con un intervalo predeterminado y lista de miembros"""
    data = request.json
    group = data.get("group")
    default_interval = data.get("default_interval")
    members = data.get("members", [])

    if not group or default_interval is None or not isinstance(members, list):
        return jsonify({"error": "Información incompleta o inválida"}), 400

    db.group_intervals.update_one(
        {"group": group},
        {"$set": {"default_interval": default_interval, "members": members}},
        upsert=True
    )
    return jsonify({"message": f"Grupo '{group}' guardado con intervalo {default_interval} y {len(members)} miembros."}), 200

#obtener todos los grupos
@upload_bp.route('/groups', methods=['GET'])
def get_groups():
    """Obtiene todos los grupos con su intervalo predeterminado y lista de miembros"""
    groups = list(db.group_intervals.find({}, {"_id": 0}))
    return jsonify(groups), 200


@upload_bp.route("/configurations", methods=["GET"])
def get_configurations():
    return get_configurations_model()

@upload_bp.route("/configurations", methods=["POST"])
def save_configurations():
    data = request.json
    return save_configurations_model(data)