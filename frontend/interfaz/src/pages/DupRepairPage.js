import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa';
import './DupRepairPage.css';
import { logsGen } from '../modules/logUtils'

const DupRepairPage = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [diagnosisResults, setDiagnosisResults] = useState(null); // Para almacenar resultados del diagnóstico
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleDiagnose = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/diagnose/${selectedFile}`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setDiagnosisResults(data);
  
        // Ordena los datos de diagnóstico por la categoría "isDuplicate" en orden descendente
        const sortedData = [...data.markedData].sort((a, b) => {
          if (a.isDuplicate === b.isDuplicate) return 0;
          return a.isDuplicate ? -1 : 1;
        });
  
        setFileData(sortedData);
      } else {
        console.error("Error al diagnosticar duplicados:", response.statusText);
      }
    } catch (error) {
      console.error("Error al llamar al endpoint de diagnóstico:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleRepair = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/repair/${selectedFile}`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        fetchFiles();
        fetchFileData(selectedFile);
        setDiagnosisResults(null);
        await logsGen(
          { 
            event: 'Modificacion de archivo', 
            detail: 'Se han eliminado '+ data.modificados +' elementos del archivo '+ selectedFile +'.', 
            state: 'Exitoso',
            module: 'Reparacion' 
        });
      } else {
        console.error("Error al reparar duplicados:", response.statusText);
        await logsGen(
          { 
            event: 'Modificacion de archivo', 
            detail: 'Se han intentado eliminar elementos del archivo '+ selectedFile +'.', 
            state: 'Fallido', 
            module: 'Reparacion' 
        });
      }
    } catch (error) {
      console.error("Error al llamar al endpoint de reparación:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    fetchFiles();
    const fileName = searchParams.get('file');
    if (fileName) {
      setSelectedFile(fileName);
      fetchFileData(fileName);
    }
  }, []);

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

  const handleFileClick = (file) => {
    setSelectedFile(file.name);
    setSearchParams({ file: file.name });
    fetchFileData(file.name);
    setDiagnosisResults(null); // Oculta el mensaje al cambiar de archivo
  };

  const handleDownload = (fileName, event) => {
    event.stopPropagation();
    window.location.href = `http://localhost:5001/files/${fileName}/download`;
  };

  // Función para ordenar las filas de la tabla
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...fileData].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFileData(sortedData);
  };

  // Comprueba si la columna "isDuplicate" debe mostrarse
  const showDuplicateColumn = fileData.length > 0 && 'isDuplicate' in fileData[0];

  return (
    <div className="container-fluid p-4 pt-5 my-5">
      <h2 className="text-center mb-4">Herramienta de Reparación de Duplicados</h2>
      <div className="row">
        <div className="col-md-3">
          {/* Lista de archivos */}
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
                      style={{ cursor: 'pointer' }}
                    >
                      <span>{file.name}</span>
                      <button 
                        className="btn btn-outline-secondary btn-sm download-button"
                        onClick={(event) => handleDownload(file.name, event)}
                      >
                        <FaDownload />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center mt-3">
                    <p>Aún no se ha subido ningún archivo.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/upload-reloj')}>
                      Subir archivo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="text-center">Datos de: {selectedFile || "Selecciona un archivo"}</h5>
              
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
                        <th onClick={() => handleSort('entrada_salida')} style={{ cursor: 'pointer' }}>
                          Entrada/Salida {sortConfig.key === 'entrada_salida' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th onClick={() => handleSort('rut')} style={{ cursor: 'pointer' }}>
                          RUT {sortConfig.key === 'rut' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th onClick={() => handleSort('hora')} style={{ cursor: 'pointer' }}>
                          Hora {sortConfig.key === 'hora' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        <th onClick={() => handleSort('fecha')} style={{ cursor: 'pointer' }}>
                          Fecha {sortConfig.key === 'fecha' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                        </th>
                        {showDuplicateColumn && (
                          <th onClick={() => handleSort('isDuplicate')} style={{ cursor: 'pointer' }}>
                            ¿Duplicado? {sortConfig.key === 'isDuplicate' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                          </th>
                        )}
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
                            {showDuplicateColumn && <td>{row.isDuplicate ? "Sí" : "No"}</td>}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={showDuplicateColumn ? 5 : 4} className="text-center">
                            No hay datos disponibles para mostrar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-3 text-center">
                <button 
                  className="btn btn-warning me-2"
                  onClick={handleDiagnose}
                  disabled={!selectedFile || isLoading}
                >
                  Diagnosticar
                </button>
                <button 
                  className="btn btn-success"
                  onClick={handleRepair}
                  disabled={!selectedFile || isLoading}
                >
                  Reparar
                </button>
              </div>

              {diagnosisResults && (
                <div className="alert alert-info mt-4">
                  {diagnosisResults.duplicatesCount > 0 
                    ? `Se encontraron ${diagnosisResults.duplicatesCount} duplicados en el archivo.`
                    : "No se encontraron duplicados en el archivo."}
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
