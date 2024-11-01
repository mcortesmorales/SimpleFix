import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileDrop.css';

const FileDrop = () => {
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file.type === 'text/csv') {
      alert('Archivo subido correctamente');
    } else {
      alert('Por favor, sube un archivo .csv');
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: '.csv'
  });

  return (
    <div {...getRootProps({ className: 'dropzone' })}>
      <input {...getInputProps()} />
      <p>Click para subir el archivo csv</p>
    </div>
  );
};

export default FileDrop;