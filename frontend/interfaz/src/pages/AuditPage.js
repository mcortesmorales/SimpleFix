import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AuditPage.css';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(
            'http://localhost:5002/get_logs',
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          ); // Ajusta la URL según tu endpoint
        setLogs(response.data.logs); // Asegúrate de que 'logs' sea el formato esperado desde el backend
      } catch (error) {
        setError('Error al obtener los logs.');
        console.error('Error al obtener los logs', error);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="container my-5 pt-5">
      <h2 className="text-center mb-4">Registro de Logs</h2>
      {error && <p className="text-danger text-center">{error}</p>}
      {logs.length === 0 ? (
        <p className="text-center">No hay logs disponibles.</p>
      ) : (
        <div className="card p-4 shadow-sm">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Nombre de Usuario</th>
                <th>Evento</th>
                <th>Detalles</th>
                <th>Estado</th>
                <th>Módulo</th>
              </tr>
            </thead>
            <tbody>
            {logs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.date}</td>
                    <td>{log.time}</td>
                    <td>{log.userName}</td>
                    <td>{log.event}</td>
                    <td>{log.details}</td>
                    <td>{log.state}</td>
                    <td>{log.module}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LogsPage;