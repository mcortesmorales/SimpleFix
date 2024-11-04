from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt

mongo = PyMongo()
bcrypt = Bcrypt()

def create_user(username, password,role):
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = {
        'username': username,
        'password': hashed_password,
        'role': role
    }
    mongo.db.users.insert_one(new_user)

def get_user_by_username(username):
    return mongo.db.users.find_one({'username': username})

def get_all_users():
    """Obtiene una lista de todos los usuarios, excluyendo sus contraseñas."""
    # Incluye 'username' y 'role', excluyendo el '_id' y 'password'
    users = mongo.db.users.find({}, {'_id': 0, 'username': 1, 'role': 1})
    return [{'username': user['username'], 'role': user.get('role', 'Operador')} for user in users]

def delete_user_by_username(username):
    """Elimina un usuario dado su nombre de usuario."""
    return mongo.db.users.delete_one({'username': username})

def update_password(username, new_password):
    """Actualiza la contraseña de un usuario dado su nombre de usuario."""
    hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    result = mongo.db.users.update_one(
        {'username': username},
        {'$set': {'password': hashed_password}}
    )
    return result.matched_count > 0  # Devuelve True si se actualizó correctamente
