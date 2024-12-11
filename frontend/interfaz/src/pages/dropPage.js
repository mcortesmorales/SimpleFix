import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FileDrop from '../components/FileDrop';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { logsGen } from '../modules/logUtils'

const DropPage = () => {
  const [fileList, setFileList] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Crea la instancia de navigate

  const fetchFileList = async () => {
    try {
      const response = await axios.get('http://localhost:5001/files');
      setFileList(response.data.files); // Asegúrate de que 'files' tenga el formato esperado
    } catch (error) {
      console.error('Error al obtener la lista de archivos:', error);
      setError('Error al obtener la lista de archivos');
    }
  };

  useEffect(() => {
    fetchFileList();
  }, []);

  const handleViewFile = (fileName) => {
    console.log(`Ver archivo: ${fileName}`);
  };

  const handleEditFile = (fileName) => {
    console.log(`Editar archivo: ${fileName}`);
  };

  const handleDeleteFile = async (fileName) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el archivo ${fileName}?`)) {
      try {
        await axios.delete(`http://localhost:5001/files/${fileName}`);
        alert('Archivo eliminado correctamente');
        fetchFileList(); // Refresca la lista después de eliminar
        await logsGen(
          { 
            event: 'Eliminacion de archivo', 
            detail: 'Se ha eliminado el archivo '+ fileName +'.', 
            state: 'Exitoso', 
            module: 'Subir archivos' 
        });
      } catch (error) {
        console.error('Error al eliminar el archivo:', error);
        alert('Error al eliminar el archivo');
      }
    }
  };

  // Nueva función para manejar la navegación a la página de reparación
  const handleRepairFile = (fileName) => {
    navigate(`/dup-repair?file=${encodeURIComponent(fileName)}`); // Cambia la ruta según sea necesario
  };

  return (
    <div className="container my-5 pt-5">
      <h2 className="text-center mb-4">Subir Archivo</h2>
      <div className="card p-4 mb-4 shadow-sm">
        <FileDrop fetchFileList={fetchFileList} />
      </div>

      <div className="card p-4 shadow-sm">
        <h4>Archivos Guardados</h4>
        {error && <p className="text-danger">{error}</p>}
        {fileList.length === 0 ? (
          <p>No hay archivos guardados.</p>
        ) : (
          <table className="table table-striped mt-3">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha de ultima modificación</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fileList.map((file, index) => (
                <tr key={index}>
                  <td>{file.name}</td>
                  <td>{new Date(file.date * 1000).toLocaleString()}</td>
                  <td className="text-end">
                    <button className="btn btn-info btn-sm me-2" onClick={() => handleViewFile(file.name)}>Ver</button>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleRepairFile(file.name)}>Ir a reparar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteFile(file.name)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DropPage;
