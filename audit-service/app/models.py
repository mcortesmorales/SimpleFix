from flask_pymongo import PyMongo
import os

mongo = PyMongo()

def init_db(app):
    app.config["MONGO_URI"] = "mongodb://localhost:27017/audit_db"
    mongo.init_app(app)
    return mongo.db.audit_logs




