from flask import Flask
from flask_cors import CORS  # Importar CORS
from config import Config
from models import mongo
from models import bcrypt
from routes import auth_bp
from flask_jwt_extended import JWTManager

app = Flask(__name__)
app.config.from_object(Config)
# Inicializar CORS
CORS(app)  # Habilitar CORS para toda la aplicación

# Initialize extensions
mongo.init_app(app)
jwt = JWTManager(app)


def create_initial_user():
    # Datos del usuario inicial
    initial_user = {
        "username": "admin",
        "password": bcrypt.generate_password_hash("123").decode("utf-8"),
        "role": "Administrador"
    }
    # Comprobar si el usuario ya existe
    existing_user = mongo.db.users.find_one({"username": initial_user["username"]})
    if not existing_user:
        # Si el usuario no existe, lo creamos
        mongo.db.users.insert_one(initial_user)
        print("Usuario inicial creado exitosamente.")
    else:
        print("El usuario inicial ya existe.")

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
create_initial_user()
if __name__ == '__main__':
    
    app.run(debug=True)
    