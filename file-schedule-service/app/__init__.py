# app/__init__.py

from flask import Flask
from flask_cors import CORS
from app.database import init_db
from flask_pymongo import PyMongo

# Inicializar la aplicación Flask
app = Flask(__name__)

# Configuración de MongoDB desde docker-compose
app.config["MONGO_URI"] = "mongodb://fileschedule-db:27017/filescheduledb"
app.config['MAX_CONTENT_LENGTH'] = 300 * 1024 * 1024  # 200 MB
# Inicializar la base de datos y almacenar en configuración de la aplicación
app.mongo_db = init_db(app)

# Verificar la conexión a MongoDB
try:
    app.mongo_db.list_collection_names()  # Esto intenta obtener la lista de colecciones
    print("Conexión a MongoDB establecida correctamente")
except Exception as e:
    print(f"Error de conexión a MongoDB: {str(e)}")

# Registrar el blueprint para las rutas de gestión de archivos
from app.routes import file_bp
app.register_blueprint(file_bp)

# Habilitar CORS
CORS(app, origins=["http://localhost:3000"])

mongo = PyMongo(app)