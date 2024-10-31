import React, { useState } from 'react';
import axios from 'axios';

const FileUploadPage = () => {
    const [horariosAsignados, setHorariosAsignados] = useState(null);
    const [horariosCreados, setHorariosCreados] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'horariosAsignados') {
            setHorariosAsignados(files[0]);
        } else if (name === 'horariosCreados') {
            setHorariosCreados(files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (!horariosAsignados || !horariosCreados) {
            setMessage('Por favor, sube ambos archivos.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('horarios_asignados', horariosAsignados);
        formData.append('horarios_creados', horariosCreados);

        try {
            const response = await axios.post('http://localhost:5001/upload', formData);
            setMessage(response.data.message || 'Archivos subidos exitosamente.');
        } catch (error) {
            setMessage('Error al subir los archivos. Intenta nuevamente.');
        }
        
        setLoading(false);
    };

    return (
        <div className="container mt-4">
            <h2>Subir Archivos de Horarios</h2>
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
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Subiendo...' : 'Subir Archivos'}
                </button>
            </form>
            {message && (
                <div className={`alert mt-4 ${message.includes('exitosamente') ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default FileUploadPage;
