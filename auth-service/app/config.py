import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_secret_key_here'
    MONGO_URI = os.environ.get('MONGO_URI') or 'mongodb://localhost:27017/user_db'