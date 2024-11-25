from flask import Flask, request, jsonify
from pymongo import MongoClient
from routes import audit_bp

app = Flask(__name__)

app.register_blueprint(audit_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True, port=5002)  # Cambia el puerto según sea necesario
