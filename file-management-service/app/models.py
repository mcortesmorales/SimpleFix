import os
from werkzeug.utils import secure_filename
from config import Config

def allowed_file(filename):
    """Verifica si el archivo tiene una extensión permitida."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def save_file(file, filename):
    file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(file_path)  # Guarda el archivo usando el nombre normalizado
    return file_path
