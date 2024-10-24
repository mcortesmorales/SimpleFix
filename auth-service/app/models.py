from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt

mongo = PyMongo()
bcrypt = Bcrypt()

def create_user(username, password):
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    mongo.db.users.insert_one({'username': username, 'password': hashed_password})

def get_user_by_username(username):
    return mongo.db.users.find_one({'username': username})

def get_all_users():
    """Obtiene una lista de todos los usuarios, excluyendo sus contraseñas."""
    users = mongo.db.users.find({}, {'_id': 0, 'username': 1})
    return [user['username'] for user in users]

def delete_user_by_username(username):
    """Elimina un usuario dado su nombre de usuario."""
    return mongo.db.users.delete_one({'username': username})
