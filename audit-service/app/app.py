from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from datetime import datetime
from config import Config
from models import get_all_logs

mongo = PyMongo()

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

mongo.init_app(app)

@app.route("/insert_logs", methods=['POST'])
def insert_logs():
    try:
        data = request.json
        if not data or not isinstance(data, dict): 
            return jsonify({"error": "Datos inválidos"}), 400
        
        required_fields = ["timestamp", "userName", "event", "details", "state", "module"]
        missing_fields = [field for field in required_fields if field not in data]

        if missing_fields:
            return jsonify({"error": f"Faltan los campos: {', '.join(missing_fields)}"}), 400

        result = mongo.db.logs.insert_one(data)
        return jsonify({"inserted_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error":" al intentar la solicitud"}), 500

@app.route("/get_logs", methods=['GET'])
def get_logs():
    try:
        documents = get_all_logs()
        return jsonify({'logs': documents}), 200
    except Exception as e:
        app.logger.error(f"Error al obtener los logs: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)

