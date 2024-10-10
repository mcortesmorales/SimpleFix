from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS  # Importa CORS
from app.config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Habilita CORS
CORS(app)

mongo = PyMongo(app)

from app import routes