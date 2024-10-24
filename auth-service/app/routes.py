from flask import Blueprint, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token
from models import create_user, get_user_by_username, get_all_users, delete_user_by_username, bcrypt

auth_bp = Blueprint('auth', __name__)
jwt = JWTManager()

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if get_user_by_username(username):
        return jsonify({'message': 'User already exists!'}), 400

    create_user(username, password)
    return jsonify({'message': 'User created successfully!'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = get_user_by_username(username)
    if user and bcrypt.check_password_hash(user['password'], password):
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200

    return jsonify({'message': 'Invalid credentials!'}), 401

@auth_bp.route('/users', methods=['GET'])
def get_users():
    """Obtiene todos los usuarios del sistema."""
    users = get_all_users()  # Llama a la función del modelo
    return jsonify({'users': users}), 200

@auth_bp.route('/users/<username>', methods=['DELETE'])
def delete_user(username):
    """Elimina un usuario por su nombre de usuario."""
    user = get_user_by_username(username)
    if user:
        delete_user_by_username(username)  # Llama a la función del modelo
        return jsonify({'message': 'User deleted successfully!'}), 200
    return jsonify({'message': 'User not found!'}), 404
