import os

class Config:
    UPLOAD_FOLDER = '/uploads'
    ALLOWED_EXTENSIONS = {'txt'}
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_secret_key_here'
    MONGO_URI = os.environ.get('MONGO_URI') or 'mongodb://filemanagement-db:27017/filemdb'

