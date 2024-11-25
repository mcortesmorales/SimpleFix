// src/pages/AuditPage.js
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AuditPage.css';

const AuditPage = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        fetch('/api/logs')
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error('Error fetching data:', error))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="container-fluid p-4 pt-5 my-5">
            <h2 className="text-center mb-4">Registro de cambios</h2>
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
                                <th>ID Usuario</th>
                                <th>Fecha y Hora</th>
                                <th>Cambios</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item._id.$oid}</td>
                                        <td>{item.date}</td>
                                        <td>{item.changes}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center">No hay datos disponibles para mostrar.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AuditPage;
