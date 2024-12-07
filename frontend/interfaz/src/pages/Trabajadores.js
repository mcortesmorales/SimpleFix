import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

const Trabajadores = () => {
    const [trabajadores, setTrabajadores] = useState([]);
    const [rut, setRut] = useState('');
    const [pagina, setPagina] = useState(1);
    const [totalTrabajadores, setTotalTrabajadores] = useState(0);
    const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [mensajeError, setMensajeError] = useState('');
    const trabajadoresPorPagina = 10;

    const cargarTrabajadores = async (paginaActual = 1) => {
        try {
            const response = await axios.get(`http://localhost:5003/trabajadores?page=${paginaActual}&limit=${trabajadoresPorPagina}`);
            setTrabajadores(response.data.trabajadores || []);
            setTotalTrabajadores(response.data.total);
            setPagina(paginaActual);
        } catch (error) {
            console.error("Error al cargar trabajadores:", error);
            setTrabajadores([]);
            setTotalTrabajadores(0);
        }
    };

    useEffect(() => {
        cargarTrabajadores();
    }, []);

    const buscarTrabajador = async (e) => {
        e.preventDefault();
        setMensajeError('');
        try {
            const response = await axios.get(`http://localhost:5003/trabajadores/${rut}`);
            setTrabajadores(response.data || []); // La API devuelve un array
            setTotalTrabajadores(response.data.length || 0);
            setPagina(1);
        } catch (error) {
            console.error("Error al buscar trabajador:", error);
            setTrabajadores([]);
            setTotalTrabajadores(0);
            setMensajeError('Trabajador no encontrado');
        }
    };

    const limpiarBusqueda = () => {
        setRut('');
        setMensajeError('');
        cargarTrabajadores(); // Recargar todos los trabajadores
    };

    const manejarCambioPagina = (numeroPagina) => {
        cargarTrabajadores(numeroPagina);
    };

    const mostrarDetallesTrabajador = (trabajador) => {
        setTrabajadorSeleccionado(trabajador);
        setShowModal(true);
    };

    const totalPaginas = Math.ceil(totalTrabajadores / trabajadoresPorPagina);

    return (
        <div className="container mt-5">
            <h1 className="mb-4 mt-5 pt-5 text-center">Lista de Trabajadores</h1>
            <form onSubmit={buscarTrabajador} className="mb-4 d-flex">
                <input
                    type="text"
                    className="form-control me-2"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    placeholder="Buscar por RUT"
                />
                <button type="submit" className="btn btn-primary me-2">Buscar</button>
                <button type="button" className="btn btn-secondary" onClick={limpiarBusqueda}>
                    Limpiar
                </button>
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
                <Button
                    className="pagination-button"
                    onClick={() => manejarCambioPagina(pagina - 1)}
                    disabled={pagina === 1}
                >
                    Anterior
                </Button>
                <span className="mx-3">Página {pagina} de {totalPaginas}</span>
                <Button
                    className="pagination-button"
                    onClick={() => manejarCambioPagina(pagina + 1)}
                    disabled={pagina === totalPaginas}
                >
                    Siguiente
                </Button>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton style={{ backgroundColor: '#007bff', color: 'white' }}>
                    <Modal.Title className="w-100 text-center">Detalles del Trabajador</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {trabajadorSeleccionado ? (
                        <div>
                            <div className="mb-3">
                                <h5 className="text-primary">Información General</h5>
                                <p><strong>RUT:</strong> {trabajadorSeleccionado.RUT}</p>
                                <p><strong>DV:</strong> {trabajadorSeleccionado.DV}</p>
                                <p><strong>Horario Asignado:</strong> {trabajadorSeleccionado.horario_asignado}</p>
                            </div>
                            <div>
                                <h5 className="text-primary">Turnos</h5>
                                {trabajadorSeleccionado.turnos && trabajadorSeleccionado.turnos.length > 0 ? (
                                    <ul className="list-group">
                                        {trabajadorSeleccionado.turnos.map((turno, index) => (
                                            <li key={index} className="list-group-item">
                                                <strong>{turno.dia}:</strong> Entrada: {turno.hora_entrada}, Salida: {turno.hora_salida}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted">No se encontraron turnos asignados.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-muted">No se encontró información del trabajador seleccionado.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowModal(false)}
                        className="w-100">
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>


        </div>
    );
};

export default Trabajadores;
