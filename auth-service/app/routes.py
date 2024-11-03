from flask import Blueprint, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import create_user, get_user_by_username, get_all_users, delete_user_by_username, bcrypt, update_password
from datetime import timedelta
from functools import wraps

auth_bp = Blueprint('auth', __name__)
jwt = JWTManager()


def role_required(role):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            username = get_jwt_identity()
            user = get_user_by_username(username)
            if user and user['role'] == role:
                return fn(*args, **kwargs)
            return jsonify({'message': 'Acceso denegado: Permisos insuficientes'}), 403
        return wrapper
    return decorator



@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    if get_user_by_username(username):
        return jsonify({'message': 'User already exists!'}), 400

    create_user(username, password,role)
    return jsonify({'message': 'User created successfully!'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = get_user_by_username(username)
    if user and bcrypt.check_password_hash(user['password'], password):
        access_token = create_access_token(identity=username,expires_delta=timedelta(hours=1))
        return jsonify(access_token=access_token, role=user['role']), 200

    return jsonify({'message': 'Nombre de usuario o contraseña incorrectos!'}), 401


@auth_bp.route('/users', methods=['GET'])
def get_users():
    
    users = get_all_users()
    return jsonify({'users': users}), 200

@auth_bp.route('/users/<username>', methods=['DELETE'])
def delete_user(username):
    user = get_user_by_username(username)
    if user:
        delete_user_by_username(username)
        return jsonify({'message': 'User deleted successfully!'}), 200
    return jsonify({'message': 'User not found!'}), 404

@auth_bp.route('/user-info', methods=['GET'])
@jwt_required()
def user_info():
    # Extrae el nombre de usuario del token
    username = get_jwt_identity()
    user = get_user_by_username(username)
    if user:
        return jsonify({'username': user['username'],'role':user['role']}), 200
    return jsonify({'message': 'User not found!'}), 404

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    # Obtiene el nombre de usuario desde el token JWT
    username = get_jwt_identity()
    user = get_user_by_username(username)

    # Verifica que el usuario exista y que la contraseña actual sea correcta
    if user and bcrypt.check_password_hash(user['password'], current_password):
        # Llama a la función update_password para actualizar la contraseña
        if update_password(username, new_password):
            return jsonify({'message': 'Contraseña actualizada correctamente'}), 200
        else:
            return jsonify({'message': 'No se pudo actualizar la contraseña'}), 500
    else:
        return jsonify({'message': 'Contraseña actual incorrecta'}), 400