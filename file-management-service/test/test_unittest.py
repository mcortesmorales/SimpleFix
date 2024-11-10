import sys
import os
import unittest
from io import BytesIO

# Añadir el directorio 'app' al sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))

# Ahora se puede importar 'app' sin problemas
from app import app

class UploadFileTestCase(unittest.TestCase):
    def setUp(self):
        # Configurar la aplicación para pruebas
        self.app = app.test_client()
        self.app.testing = True  # Activar el modo de pruebas

    def test_upload_file_success(self):
        # Simula la carga de un archivo .txt
        data = {
            'file': (BytesIO(b"dummy content"), 'testfile.txt')
        }
        response = self.app.post('/upload', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Archivo subido y guardado correctamente', response.json['message'])

    def test_upload_file_no_file(self):
        # Test para cuando no se sube archivo
        response = self.app.post('/upload', data={}, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 400)
        self.assertIn('No se encontró ningún archivo', response.json['message'])

    def test_file_type_not_allowed(self):
        # Test para subir un archivo que no sea .txt
        data = {
            'file': (BytesIO(b"dummy content"), 'testfile.csv')
        }
        response = self.app.post('/upload', data=data, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 400)
        self.assertIn('Por favor, sube un archivo .txt', response.json['message'])

    def test_delete_file_success(self):
        # Suponiendo que has subido un archivo antes
        data = {
            'file': (BytesIO(b"dummy content"), 'testfile.txt')
        }
        self.app.post('/upload', data=data, content_type='multipart/form-data')
        
        # Luego eliminamos el archivo
        response = self.app.delete('/files/testfile.txt')
        self.assertEqual(response.status_code, 200)
        self.assertIn('Archivo eliminado correctamente', response.json['message'])

    def test_delete_file_not_found(self):
        # Intentar eliminar un archivo que no existe
        response = self.app.delete('/files/nonexistentfile.txt')
        self.assertEqual(response.status_code, 404)
        self.assertIn('Archivo no encontrado', response.json['message'])

if __name__ == '__main__':
    unittest.main()
