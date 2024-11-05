import os
from flask import Blueprint, request, jsonify
from models import allowed_file, save_file
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
            entrada_salida = "Entrada" if (row[2] == "01" or row[2] == 1) else "Salida"
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


@upload_bp.route('/diagnose/<filename>', methods=['POST'])
def diagnose_duplicates(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({'message': 'Archivo no encontrado'}), 404

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
        
        # Chequear si es la misma persona y si la diferencia de tiempo es menor a 5 minutos
        if row["rut"] == previous_row["rut"] and row["entrada_salida"] == 1:
            time_difference = row["timestamp"] - previous_row["timestamp"]
            
            if time_difference < timedelta(minutes=5):
                # Marcar como duplicado
                adjusted_rows[-1]["isDuplicate"] = True
                adjusted_rows.append({**row, "isDuplicate": True})
                continue
            
        # Si no es un duplicado, simplemente agregar la fila original
        adjusted_rows.append({**row, "isDuplicate": False})

    marked_data = pd.DataFrame(adjusted_rows).to_dict(orient='records')
    duplicates_count = sum(row.get('isDuplicate', False) for row in marked_data)

    return jsonify({'markedData': marked_data, 'duplicatesCount': duplicates_count}), 200


@upload_bp.route('/repair/<filename>', methods=['POST'])
def repair_duplicates(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({'message': 'Archivo no encontrado'}), 404

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

    # Procesar duplicados y crear una lista de filas ajustadas
    adjusted_rows = []
    for i, row in df.iterrows():
        if i == 0:
            adjusted_rows.append(row)
            continue
        
        previous_row = adjusted_rows[-1]
        
        if row["rut"] == previous_row["rut"] and row["entrada_salida"] == 1:
            time_difference = row["timestamp"] - previous_row["timestamp"]
            
            if time_difference < timedelta(minutes=5):
                # Ajustar el registro: convertir segunda marca de entrada en salida y crear nuevo registro de entrada
                salida_row = row.copy()
                salida_row["entrada_salida"] = 3  # Convertir a salida
                
                entrada_row = row.copy()  # Crear un nuevo registro de entrada con el mismo horario
                
                # Agregar los ajustes
                adjusted_rows.append(salida_row)
                adjusted_rows.append(entrada_row)
                continue
            
        adjusted_rows.append(row)

    # Convertir de nuevo a DataFrame
    adjusted_df = pd.DataFrame(adjusted_rows)

    # Guardar los resultados en un archivo nuevo
    repaired_file_path = os.path.join(UPLOAD_FOLDER, filename)
    adjusted_df.to_csv(repaired_file_path, index=False, header=False)

    return jsonify({'repairedData': adjusted_df.to_dict(orient='records')}), 200   
