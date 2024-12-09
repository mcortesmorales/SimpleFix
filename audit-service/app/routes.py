from flask import Blueprint, request, jsonify, render_template
from flask import current_app

audit_bp = Blueprint('audit', __name__)

@audit_bp.route("/insert_logs", methods=['POST'])
def insert_logs():
    try:
        data = request.json
        if not data or not isinstance(data, dict): 
            return jsonify({"error": "datos invalidos"}),
        result = current_app.mongo.db.audit_logs.insert_one(data)
        return jsonify({"inserted_i": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@audit_bp.route("/get_logs", methods=['GET'])
def get_logs():
    try:
        documents = list(current_app.mongo.db.audit_logs.find())
        return jsonify(documents), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


"""
# Inicializa la base de datos si no existe 
def init_db(): 
    if 'audit_logs' not in db.list_collection_names(): 
        db.create_collection("audit_logs")
        db.logs.insert_one()

#obtiene los datos necesarios de la base de datos de logs
@audit_bp.route('/logs', methods=['GET'])
def get_changes():
    data = collection.find() 
    return dumps(data)

@audit_bp.route('insert/logs', methods=['POST'])
def insert_changes():
    new_data = request.json 
    result = collection.insert_one(new_data) 
    return jsonify({'inserted_id': str(result.inserted_id)})


#ruta para realizar pruebas e insertar datos (por si acaso)
@audit_bp.route('/api/changes', methods=['POST'])
def add_change():
    #se define un nuevo elemento a insertar con campos
    new_change = {
        "user_id": "456",
        "datetime": datetime.now().isoformat(),
        "change": "Added a new feature"
    }
    #se añade el elemento como documento en la coleccion
    collection.insert_one(new_change)
    return jsonify({"message": "Change added successfully"}), 201



@audit_bp.route('/audit', methods=['POST'])
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

@audit_bp.route('/audit', methods=['GET'])
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
"""
