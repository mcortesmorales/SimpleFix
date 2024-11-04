import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const DupRepairPage = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Función para obtener la lista de archivos desde el backend
  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:5001/files');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      } else {
        console.error("Error al obtener archivos:", response.statusText);
      }
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
    }
  };

  // Llama a `fetchFiles` una vez cuando el componente se monta
  useEffect(() => {
    fetchFiles();
  }, []);

  // Maneja la selección de un archivo y obtiene sus datos
  const handleFileClick = async (file) => {
    setSelectedFile(file.name);
    setIsLoading(true);  // Activa el estado de carga
    setFileData([]);  // Limpia los datos previos mientras carga el nuevo archivo

    try {
      const response = await fetch(`http://localhost:5001/files/${file.name}`);
      if (response.ok) {
        const data = await response.json();
        setFileData(data); // Carga los datos específicos del archivo
      } else {
        console.error("Error al obtener el contenido del archivo:", response.statusText);
      }
    } catch (error) {
      console.error("Error al obtener datos del archivo:", error);
    } finally {
      setIsLoading(false);  // Desactiva el estado de carga una vez que termina
    }
  };

  return (
    <div className="container-fluid p-4 pt-5 my-5">
      <h2 className="text-center mb-4">Herramienta de Reparación de Duplicados</h2>
      <div className="row">
        {/* Lista de archivos a la izquierda */}
        <div className="col-md-3">
          <div className="list-group">
            {files.map((file, index) => (
              <button 
                key={index} 
                className={`list-group-item list-group-item-action ${file.name === selectedFile ? 'active' : ''}`}
                onClick={() => handleFileClick(file)}
              >
                {file.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Contenedor para la tabla de datos y los botones */}
        <div className="col-md-9">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="text-center">Datos de: {selectedFile || "Selecciona un archivo"}</h5>
              
              {/* Indicador de carga o tabla de datos */}
              {isLoading ? (
                <div className="text-center my-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2">Cargando datos...</p>
                </div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'scroll' }}>
                  <table className="table table-striped mt-3">
                    <thead>
                      <tr>
                        <th>Entrada/Salida</th>
                        <th>RUT</th>
                        <th>Hora</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fileData.length > 0 ? (
                        fileData.map((row, index) => (
                          <tr key={index}>
                            <td>{row.entrada_salida}</td>
                            <td>{row.rut}</td>
                            <td>{row.hora}</td>
                            <td>{row.fecha}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center">Selecciona un archivo para ver sus datos.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Botones de Diagnosticar y Reparar */}
              <div className="text-center mt-3">
                <button className="btn btn-secondary me-2">Diagnosticar</button>
                <button className="btn btn-primary">Reparar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DupRepairPage;
