from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from datetime import datetime
from config import Config

mongo = PyMongo()

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

mongo.init_app(app)

#middleware antes de las rutas
"""@app.after_request 
def after_request(response): 
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000') 
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization') 
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS') 
    return response"""

@app.route("/insert_logs", methods=['POST'])
def insert_logs():
    try:
        data = request.json
        if not data or not isinstance(data, dict): 
            return jsonify({"error": "Datos inválidos"}), 400
        
        required_fields = ["hola"]#["timestamp", "userName", "event", "details", "state", "module"]
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
        documents = mongo.db.logs.find()
        return jsonify(documents), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def init():
    if mongo.db.logs.count_documents({"details": "log inicial"}) == 0:
        log = {
            "timestamp": datetime.utcnow().isoformat(),
            "userName": "admin",
            "event": "Reparacion Duplicados",
            "details": "log inicial",
            "state": "Exitoso",
            "module": "none"
        }
        mongo.db.logs.insert_one(log)
        print("Log inicial creado exitosamente.")
    else:
        print("Log inicial ya existe.")

if __name__ == '__main__':
    init()
    app.run(debug=True, host='0.0.0.0', port=5002)

