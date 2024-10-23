from flask import Blueprint, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token
from models import create_user, get_user_by_username, bcrypt

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