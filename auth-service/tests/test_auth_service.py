import pytest
from flask import Flask
from flask_jwt_extended import create_access_token


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))
from app import app as auth_app  # Cambia esta línea de acuerdo a la estructura real
from models import mongo, bcrypt

@pytest.fixture
def client():
    # Configura el cliente de pruebas de Flask
    auth_app.config['TESTING'] = True
    auth_app.config['MONGO_DBNAME'] = 'test_db'  # Configura un nombre de base de datos temporal
    auth_app.config['MONGO_URI'] = "mongodb://localhost:27017/test_db"  # URI para la base de datos de pruebas
    client = auth_app.test_client()
    
    # Limpiamos la base de datos de pruebas antes de cada prueba
    with auth_app.app_context():
        mongo.db.users.delete_many({})
    
    yield client

    # Después de cada prueba, también limpiamos la base de datos
    with auth_app.app_context():
        mongo.db.users.delete_many({})

# Helper para crear un token JWT
def create_jwt_token(username):
    with auth_app.app_context():
        return create_access_token(identity=username)

def test_register_user(client):
    # Prueba para registrar un nuevo usuario
    response = client.post('/auth/register', json={
        'username': 'testuser',
        'password': 'testpassword',
        'role': 'Operador'
    })
    assert response.status_code == 201
    assert response.get_json()['message'] == 'User created successfully!'

def test_register_existing_user(client):
    # Intenta registrar un usuario ya existente
    client.post('/auth/register', json={
        'username': 'existinguser',
        'password': 'password',
        'role': 'Operador'
    })
    response = client.post('/auth/register', json={
        'username': 'existinguser',
        'password': 'password',
        'role': 'Operador'
    })
    assert response.status_code == 400
    assert response.get_json()['message'] == 'User already exists!'

def test_login_user(client):
    # Crea un usuario y luego intenta iniciar sesión
    client.post('/auth/register', json={
        'username': 'loginuser',
        'password': 'loginpassword',
        'role': 'Operador'
    })
    response = client.post('/auth/login', json={
        'username': 'loginuser',
        'password': 'loginpassword'
    })
    assert response.status_code == 200
    assert 'access_token' in response.get_json()

def test_get_users(client):
    # Prueba para obtener todos los usuarios
    client.post('/auth/register', json={
        'username': 'user1',
        'password': 'password1',
        'role': 'Operador'
    })
    client.post('/auth/register', json={
        'username': 'user2',
        'password': 'password2',
        'role': 'Operador'
    })
    response = client.get('/auth/users')
    assert response.status_code == 200
    assert len(response.get_json()['users']) == 2

def test_delete_user(client):
    # Prueba para eliminar un usuario existente
    client.post('/auth/register', json={
        'username': 'deleteuser',
        'password': 'password',
        'role': 'Operador'
    })
    response = client.delete('/auth/users/deleteuser')
    assert response.status_code == 200
    assert response.get_json()['message'] == 'User deleted successfully!'

def test_user_info(client):
    # Prueba para obtener la información de usuario
    client.post('/auth/register', json={
        'username': 'infouser',
        'password': 'password',
        'role': 'Operador'
    })
    token = create_jwt_token('infouser')
    response = client.get('/auth/user-info', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    assert response.get_json()['username'] == 'infouser'

def test_change_password(client):
    # Prueba para cambiar la contraseña de un usuario
    client.post('/auth/register', json={
        'username': 'changepassworduser',
        'password': 'oldpassword',
        'role': 'Operador'
    })
    token = create_jwt_token('changepassworduser')
    response = client.post('/auth/change-password', json={
        'currentPassword': 'oldpassword',
        'newPassword': 'newpassword'
    }, headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    assert response.get_json()['message'] == 'Contraseña actualizada correctamente'
