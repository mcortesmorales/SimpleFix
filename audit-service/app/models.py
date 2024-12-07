from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
import os

mongo = PyMongo()
bcrypt = Bcrypt()

# Configuración de MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client.audit_db
collection = db.audit_logs  # Colección de auditoría



