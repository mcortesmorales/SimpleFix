from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # Lógica de autenticación aquí
    return jsonify({"message": "Login exitoso"})
