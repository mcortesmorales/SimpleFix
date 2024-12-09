from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from models import mongo

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/audit_db"

mongo.init_app(app)
CORS(app)

@app.route("/insert_logs", methods=['POST'])
def insert_logs():
    try:
        data = request.json
        if not data or not isinstance(data, dict): 
            return jsonify({"error": "datos invalidos"}), 400  # Cambiado a 400 para indicar un error del cliente
        result = mongo.db.logs.insert_one(data)
        return jsonify({"inserted_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_logs", methods=['GET'])
def get_logs():
    try:
        documents = list(mongo.db.logs.find())
        return jsonify(documents), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def init():
    log = {
        "timestamp": datetime.now().isoformat(),
        "userName": "admin",
        "event": "Reparacion Duplicados",
        "details": "log inicial",
        "state": "Exitoso",
        "module": "none"
    }
    if log:
        mongo.db.logs.insert_one(log)
        print("log inicial creado exitosamente.")
    else:
        print("El log inicial fallo.")

CORS(app, origins=["http://localhost:3000"])

init()
if __name__ == '__main__':
    app.run(debug=True, port=5002)
  # Cambia el puerto según sea necesario
