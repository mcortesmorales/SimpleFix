# app/database.py

from pymongo import MongoClient

def init_db(app):
    mongo_client = MongoClient(app.config["MONGO_URI"])
    return mongo_client["filedb"]  # Nombre de la base de datos
