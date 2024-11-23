from flask import Flask, request, jsonify
from pymongo import MongoClient
from datetime import datetime
import os

app = Flask(__name__)

# Configuración de MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client.audit_db
audit_logs = db.audit_logs  # Colección de auditoría

@app.route('/audit', methods=['POST'])
def record_audit():
    data = request.get_json()
    if not data:
        return jsonify({"message": "No se envió ningún dato"}), 400

    # Validar que contenga los campos obligatorios
    required_fields = ["user_id", "action", "file_name", "details"]
    for field in required_fields:
        if field not in data:
            return jsonify({"message": f"Falta el campo obligatorio: {field}"}), 400

    # Agregar timestamp
    data["timestamp"] = datetime.utcnow()

    # Insertar el registro en MongoDB
    audit_logs.insert_one(data)
    return jsonify({"message": "Registro de auditoría guardado correctamente"}), 201

@app.route('/audit', methods=['GET'])
def list_audits():
    # Permitir filtros (por usuario, acción o archivo)
    user_id = request.args.get("user_id")
    action = request.args.get("action")
    file_name = request.args.get("file_name")

    query = {}
    if user_id:
        query["user_id"] = user_id
    if action:
        query["action"] = action
    if file_name:
        query["file_name"] = file_name

    logs = list(audit_logs.find(query, {"_id": 0}))  # Excluir el ID de MongoDB en la respuesta
    return jsonify(logs), 200

if __name__ == '__main__':
    app.run(debug=True, port=5002)  # Cambia el puerto según sea necesario
