from flask import Flask
from flask_pymongo import PyMongo

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/audit_db"
mongo = PyMongo(app)

collection = mongo.db.audit_logs

def create_app():
    app = Flask(__name__)
    app.config["MONGO_URI"] = "mongodb://localhost:27017/audit_db"
    mongo.init_app(app)

    with app.app_context():
        from routes import audit_bp
        app.register_blueprint(audit_bp, url_prefix='/api')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5002)  # Cambia el puerto según sea necesario
