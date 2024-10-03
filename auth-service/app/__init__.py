from flask import Flask
from pymongo import MongoClient

app = Flask(__name__)

# Conexión a MongoDB
client = MongoClient('mongodb://auth-db:27017/')
db = client['authdb']

from app.routes import auth_bp
app.register_blueprint(auth_bp)
