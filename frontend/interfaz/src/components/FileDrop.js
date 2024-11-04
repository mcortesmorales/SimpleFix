import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './FileDrop.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const FileDrop = ({ fetchFileList }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const fileType = file.type;
      const fileName = file.name;

      // Validar que el archivo tenga la extensión .txt
      if (fileName.endsWith('.txt') && fileType === 'text/plain') {
        setSelectedFile(file);
      } else {
        alert('Por favor, sube un archivo .txt');
      }
    }
  }, []);

  const uploadFile = async (formData, overwrite = false) => {
    try {
      const response = await axios.post('http://localhost:5001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(overwrite ? { 'Overwrite': 'true' } : {})  // Agregar encabezado solo si se desea sobrescribir
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await uploadFile(formData);

      alert(response.data.message || 'Archivo subido correctamente!');

      setSelectedFile(null);  // Limpiar el archivo después de subirlo
      fetchFileList(); // Refrescar la lista de archivos
    } catch (error) {
      if (error.response?.status === 409 && error.response?.data?.overwrite) {
        const shouldOverwrite = window.confirm(error.response.data.message);
        if (shouldOverwrite) {
          // Si el usuario confirma, intenta sobrescribir
          try {
            const overwriteResponse = await uploadFile(formData, true);
            alert(overwriteResponse.data.message || 'Archivo sobrescrito correctamente');
          } catch (overwriteError) {
            alert(overwriteError.response?.data?.message || 'Error al sobrescribir el archivo');
          }
        } else {
          alert('El archivo no fue sobrescrito.');
        }
      } else {
        alert(error.response?.data?.message || 'Error al subir el archivo');
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'] // Asegúrate de que los tipos MIME sean correctos
    }
  });

  return (
    <div className="text-center">
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <p className="text-muted">Arrastra un archivo .txt o haz clic para seleccionarlo</p>
      </div>

      {selectedFile && (
        <div className="mt-3">
          <p className="file-info">Archivo seleccionado: {selectedFile.name}</p>
          <button 
            className="btn btn-primary upload-button" 
            onClick={handleUpload}
          >
            Subir Archivo
          </button>
        </div>
      )}
    </div>
  );
};

export default FileDrop;
