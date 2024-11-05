import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa'; // Asegúrate de instalar react-icons
import './DupRepairPage.css'; // Asegúrate de tener un archivo CSS separado

const DupRepairPage = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [diagnosisResults, setDiagnosisResults] = useState(null); // Para almacenar resultados del diagnóstico

  // Función para diagnosticar duplicados
  const handleDiagnose = async () => {
    if (!selectedFile) return; // Asegúrate de que hay un archivo seleccionado

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/diagnose/${selectedFile}`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setDiagnosisResults(data); // Almacena los resultados del diagnóstico
        setFileData(data.markedData)
      } else {
        console.error("Error al diagnosticar duplicados:", response.statusText);
      }
    } catch (error) {
      console.error("Error al llamar al endpoint de diagnóstico:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para reparar duplicados
  const handleRepair = async () => {
    if (!selectedFile) return; // Asegúrate de que hay un archivo seleccionado

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/repair/${selectedFile}`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // Mensaje de éxito
        fetchFiles(); // Para mostrar el archivo reparado
      } else {
        console.error("Error al reparar duplicados:", response.statusText);
      }
    } catch (error) {
      console.error("Error al llamar al endpoint de reparación:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

    // Verifica si hay un archivo en los parámetros de búsqueda y lo selecciona
    const fileName = searchParams.get('file');
    if (fileName) {
      setSelectedFile(fileName);
      fetchFileData(fileName);
    }
  }, []);

  // Función para obtener los datos del archivo seleccionado
  const fetchFileData = async (fileName) => {
    setIsLoading(true);
    setFileData([]);

    try {
      const response = await fetch(`http://localhost:5001/files/${fileName}`);
      if (response.ok) {
        const data = await response.json();
        setFileData(data);
      } else {
        console.error("Error al obtener el contenido del archivo:", response.statusText);
      }
    } catch (error) {
      console.error("Error al obtener datos del archivo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Maneja la selección de un archivo y actualiza la URL con el nombre del archivo
  const handleFileClick = (file) => {
    setSelectedFile(file.name);
    setSearchParams({ file: file.name });  // Actualiza los parámetros de búsqueda en la URL
    fetchFileData(file.name);
  };

  // Función para descargar el archivo
  const handleDownload = (fileName, event) => {
    event.stopPropagation(); // Evita que el clic en el botón de descarga active la selección
    window.location.href = `http://localhost:5001/files/${fileName}/download`;
  };

  return (
    <div className="container-fluid p-4 pt-5 my-5">
      <h2 className="text-center mb-4">Herramienta de Reparación de Duplicados</h2>
      <div className="row">
        {/* Lista de archivos en una tarjeta */}
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-header text-center">
              <h5>Lista de Archivos</h5>
            </div>
            <div className="card-body">
              <div className="list-group">
                {files.length > 0 ? (
                  files.map((file, index) => (
                    <div 
                      key={index} 
                      className={`list-group-item d-flex justify-content-between align-items-center ${file.name === selectedFile ? 'active' : ''} file-item`}
                      onClick={() => handleFileClick(file)}
                      style={{ cursor: 'pointer' }} // Cambia el cursor para indicar que es clickeable
                    >
                      <span>{file.name}</span>
                      <button 
                        className="btn btn-outline-secondary btn-sm download-button"
                        onClick={(event) => handleDownload(file.name, event)} // Pasa el evento al manejador
                      >
                        <FaDownload />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center mt-3">
                    <p>Aún no se ha subido ningún archivo.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/file-drop')}>
                      Subir archivo
                    </button>
                  </div>
                )}
              </div>
            </div>
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
                          <tr key={index} className={row.isDuplicate ? 'table-danger' : ''}>
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
                <button className="btn btn-secondary me-2" onClick={handleDiagnose}>Diagnosticar</button>
                <button className="btn btn-primary" onClick={handleRepair}>Reparar</button>
              </div>

              {/* Resultados del diagnóstico */}
              {diagnosisResults && (
                <div className="mt-4">
                  <h6>Resultados del Diagnóstico:</h6>
                  <p>Número de duplicados encontrados: {diagnosisResults.duplicatesCount}</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DupRepairPage;
