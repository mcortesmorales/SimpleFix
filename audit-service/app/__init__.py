from flask import Flask
from pymongo import MongoClient

app = Flask(__name__)

# Conexión a MongoDB
client = MongoClient('mongodb://audit-db:27017/')
db = client['auditdb']

from app.routes import audit_bp
app.register_blueprint(audit_bp)
