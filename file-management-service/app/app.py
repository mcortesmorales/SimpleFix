from flask import Flask
from flask_cors import CORS  # Importar CORS
from config import Config
from models import mongo
from routes import upload_bp

app = Flask(__name__)
app.config.from_object(Config)
# Inicializar CORS
CORS(app)  # Habilitar CORS para toda la aplicación

# Initialize extensions
mongo.init_app(app)
# Register blueprints
app.register_blueprint(upload_bp)
if __name__ == '__main__':
    app.run(debug=True)
    