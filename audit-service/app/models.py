from flask_pymongo import PyMongo

mongo = PyMongo()


def get_logs():
    # Accede a la colección 'logs'
    logs_collection = mongo.db.logs
    
    # Obtiene todos los documentos de la colección y selecciona solo los campos necesarios
    logs = logs_collection.find({}, {
        '_id': 0,
        'timestamp': 1,
        'userName': 1,
        'event': 1,
        'details': 1,
        'state': 1,
        'module': 1
    })

    # Procesa los documentos para convertir ObjectId a string y mantener los campos esperados
    processed_logs = [
        {
            'timestamp': log.get('timestamp', 'N/A'),
            'userName': log.get('userName', 'N/A'),
            'event': log.get('event', 'Unknown'),
            'details': log.get('details', 'N/A'),  # Valor por defecto si falta el campo
            'state': log.get('state', 'Unknown'),
            'module': log.get('module', 'Unknown')
        }
        for log in logs
    ]

    return processed_logs




