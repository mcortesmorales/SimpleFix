from flask import Flask

app = Flask(__name__)

from app.routes import file_bp
app.register_blueprint(file_bp)
