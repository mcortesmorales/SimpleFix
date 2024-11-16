import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

const Trabajadores = () => {
    const [trabajadores, setTrabajadores] = useState([]);
    const [rut, setRut] = useState('');
    const [pagina, setPagina] = useState(1);
    const [totalTrabajadores, setTotalTrabajadores] = useState(0);
    const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState(null);
    const [mensajeError, setMensajeError] = useState('');
    const trabajadoresPorPagina = 10;

    useEffect(() => {
        const cargarTrabajadores = async () => {
            const response = await axios.get(`http://localhost:5003/trabajadores?page=${pagina}&limit=${trabajadoresPorPagina}`);
            setTrabajadores(response.data.trabajadores || []);
            setTotalTrabajadores(response.data.total);
        };
        cargarTrabajadores();
    }, [pagina]);

    const buscarTrabajador = async (e) => {
        e.preventDefault();
        setMensajeError('');
        try {
            const response = await axios.get(`http://localhost:5003/trabajadores/${rut}`);
            setTrabajadores(response.data ? [response.data] : []);
            setTotalTrabajadores(response.data ? 1 : 0);
            setPagina(1);
        } catch (error) {
            console.error("Error al buscar trabajador:", error);
            setTrabajadores([]);
            setTotalTrabajadores(0);
            setMensajeError('Trabajador no encontrado');
        }
    };

    const manejarCambioPagina = (numeroPagina) => {
        setPagina(numeroPagina);
    };

    const mostrarDetallesTrabajador = (trabajador) => {
        setTrabajadorSeleccionado(trabajador);
        const modal = new window.bootstrap.Modal(document.getElementById('trabajadorModal'));
        modal.show();
    };

    const totalPaginas = Math.ceil(totalTrabajadores / trabajadoresPorPagina);

    return (
        <div className="container mt-5">
            <h1 className="mb-4 mt-5 pt-5 text-center">Lista de Trabajadores</h1>
            <form onSubmit={buscarTrabajador} className="mb-4">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        value={rut}
                        onChange={(e) => setRut(e.target.value)}
                        placeholder="Buscar por RUT"
                    />
                    <button type="submit" className="btn btn-primary">Buscar</button>
                </div>
            </form>

            {mensajeError && <div className="alert alert-danger text-center">{mensajeError}</div>}

            <ul className="list-group">
                {trabajadores.map((trabajador) => (
                    <li
                        key={trabajador.RUT}
                        className="list-group-item"
                        onClick={() => mostrarDetallesTrabajador(trabajador)}
                    >
                        <span className="rut-link">
                            {trabajador.RUT}
                        </span>
                    </li>
                ))}
            </ul>

            <div className="mt-4 d-flex justify-content-center align-items-center">
                <button
                    className="btn btn-secondary me-2"
                    onClick={() => manejarCambioPagina(pagina - 1)}
                    disabled={pagina === 1}
                >
                    Anterior
                </button>
                <span className="mx-3">Página {pagina} de {totalPaginas}</span>
                <button
                    className="btn btn-secondary"
                    onClick={() => manejarCambioPagina(pagina + 1)}
                    disabled={pagina === totalPaginas}
                >
                    Siguiente
                </button>
            </div>

            {/* Modal */}
            <div className="modal fade" id="trabajadorModal" tabIndex="-1" aria-labelledby="trabajadorModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="trabajadorModalLabel">Detalles del Trabajador</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {trabajadorSeleccionado && (
                                <div>
                                    <p><strong>RUT:</strong> {trabajadorSeleccionado.RUT}</p>
                                    <p><strong>DV:</strong> {trabajadorSeleccionado.DV}</p>
                                    <h5>Turnos:</h5>
                                    <ul>
                                        {trabajadorSeleccionado.turnos && trabajadorSeleccionado.turnos.length > 0 ? (
                                            trabajadorSeleccionado.turnos.map((turno, index) => (
                                                <li key={index}>
                                                    {turno.dia} - Entrada: {turno.hora_entrada}, Salida: {turno.hora_salida}
                                                </li>
                                            ))
                                        ) : (
                                            <li>No se encontraron turnos.</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Trabajadores;
