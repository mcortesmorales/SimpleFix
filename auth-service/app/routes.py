from flask import Blueprint, request, jsonify
from .models import UserModel

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/users', methods=['POST'])
def create_user():
    user_data = request.json
    UserModel.create_user(user_data)
    return jsonify({"message": "Usuario creado exitosamente"}), 201

@user_bp.route('/users/<email>', methods=['GET'])
def get_user(email):
    user = UserModel.get_user_by_email(email)
    if user:
        return jsonify(user), 200
    return jsonify({"message": "Usuario no encontrado"}), 404

@user_bp.route('/users/<email>', methods=['PUT'])
def update_user(email):
    update_data = request.json
    result = UserModel.update_user(email, update_data)
    if result.matched_count > 0:
        return jsonify({"message": "Usuario actualizado exitosamente"}), 200
    return jsonify({"message": "Usuario no encontrado"}), 404