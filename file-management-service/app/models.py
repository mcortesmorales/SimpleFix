import os
from werkzeug.utils import secure_filename
from config import Config
from flask_pymongo import PyMongo
from flask import jsonify

mongo = PyMongo()

def allowed_file(filename):
    """Verifica si el archivo tiene una extensión permitida."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def save_file(file, filename):
    file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(file_path)  # Guarda el archivo usando el nombre normalizado
    return file_path

def get_configurations_model():
    config = mongo.db.config_collection.find_one({}, {"_id": 0})  # No incluir el _id en la respuesta
    if not config:
        return jsonify({
            "defaultInterval": 3,
            "groupIntervals": [],
            "customValues": []
        })
    return jsonify(config)

def save_configurations_model(data):

    if not data:
        return jsonify({"error": "No se proporcionaron datos"}), 400

    # Validar campos requeridos (puedes expandir esta validación)
    required_keys = ["defaultInterval", "groupIntervals", "customValues"]
    if not all(key in data for key in required_keys):
        return jsonify({"error": "Faltan campos requeridos"}), 400

    # Reemplazar la configuración existente
    mongo.db.config_collection.replace_one({}, data, upsert=True)
    return jsonify({"message": "Configuraciones guardadas con éxito"})