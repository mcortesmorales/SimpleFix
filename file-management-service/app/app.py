from flask import Flask
from flask_cors import CORS
from config import Config
from routes import upload_bp

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)  # Habilita CORS para todas las rutas

# Registrar el blueprint de las rutas
app.register_blueprint(upload_bp)

if __name__ == '__main__':
    app.run(debug=True)
