from flask import Blueprint, jsonify

file_bp = Blueprint('file_management', __name__)

@file_bp.route('/upload', methods=['POST'])
def upload_file():
    # Lógica para procesar archivos con Pandas
    return jsonify({"message": "Archivo subido exitosamente"})
