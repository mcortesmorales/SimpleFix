from flask import Blueprint, jsonify

audit_bp = Blueprint('audit', __name__)

@audit_bp.route('/logs', methods=['GET'])
def get_logs():
    # Lógica para obtener los logs de auditoría
    return jsonify({"message": "Logs de auditoría"})
