import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const FileUploadPage = () => {
    const [selectedFiles, setSelectedFiles] = useState({ horariosAsignados: null, horariosCreados: null });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setSelectedFiles((prevFiles) => ({
            ...prevFiles,
            [name]: files[0],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (!selectedFiles.horariosAsignados || !selectedFiles.horariosCreados) {
            setMessage('Por favor, sube ambos archivos.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('horarios_asignados', selectedFiles.horariosAsignados);
        formData.append('horarios_creados', selectedFiles.horariosCreados);

        try {
            const response = await axios.post('http://localhost:5003/upload', formData);
            setMessage(response.data.message || 'Archivos subidos exitosamente.');
        } catch (error) {
            setMessage('Error al subir los archivos. Intenta nuevamente.');
            console.error(error);
        }

        setLoading(false);
    };

    return (
        <div className="container my-5 pt-5">
            <h2 className="text-center mb-4">Subir Archivos de Horarios</h2>
            <div className="card p-4 mb-4 shadow-sm">
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="horariosAsignados" className="form-label">Archivo Horarios Asignados</label>
                        <input
                            type="file"
                            name="horariosAsignados"
                            id="horariosAsignados"
                            className="form-control"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="horariosCreados" className="form-label">Archivo Horarios Creados</label>
                        <input
                            type="file"
                            name="horariosCreados"
                            id="horariosCreados"
                            className="form-control"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="d-flex justify-content-center">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Subiendo...' : 'Subir Archivos'}
                        </button>
                    </div>
                </form>
            </div>
            {message && (
                <div className={`alert mt-4 ${message.includes('exitosamente') ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default FileUploadPage;
