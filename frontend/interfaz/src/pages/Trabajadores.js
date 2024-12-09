import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Asegúrate de importar esto para la redirección
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
    const [horariosAsignados, setHorariosAsignados] = useState([]); // Nuevo estado para los horarios
    const [filtroHorario, setFiltroHorario] = useState(''); // Estado para el filtro de horario
    const trabajadoresPorPagina = 10;

    // Función para cargar los trabajadores con paginación y filtro
    const cargarTrabajadores = async (paginaActual = 1, horario_asignado = '') => {
        try {
            let url = `http://localhost:5003/trabajadores/horario?horario_asignado=${horario_asignado}&page=${paginaActual}&limit=${trabajadoresPorPagina}`;
            
            // Si no hay filtro de horario, usamos el endpoint sin el filtro
            if (!horario_asignado) {
                url = `http://localhost:5003/trabajadores?page=${paginaActual}&limit=${trabajadoresPorPagina}`;
            }
    
            const response = await axios.get(url);
            console.log(response.data);  // Agregar un log para ver la respuesta de la API
            const trabajadoresData = response.data.trabajadores || [];
            setTrabajadores(trabajadoresData);
            setTotalTrabajadores(response.data.total || 0); // Total de trabajadores desde la respuesta
            setPagina(paginaActual);
        } catch (error) {
            console.error("Error al cargar trabajadores:", error);
            setTrabajadores([]);  // Asegúrate de que sea un array vacío
            setTotalTrabajadores(0);
        }
    };

    // Cargar los horarios asignados para el filtro
    const cargarHorariosAsignados = async () => {
        try {
            const response = await axios.get('http://localhost:5003/horarios_asignados');
            setHorariosAsignados(response.data.horarios_asignados || []);
        } catch (error) {
            console.error("Error al cargar horarios asignados:", error);
        }
    };

    useEffect(() => {
        cargarTrabajadores();
        cargarHorariosAsignados();
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
        cargarTrabajadores(numeroPagina, filtroHorario);
    };

    const manejarFiltro = () => {
        cargarTrabajadores(1, filtroHorario); // Recargar trabajadores con el filtro seleccionado
    };

    const limpiarFiltro = () => {
        setFiltroHorario('');
        cargarTrabajadores(); // Recargar todos los trabajadores sin filtro
    };

    const mostrarDetallesTrabajador = (trabajador) => {
        setTrabajadorSeleccionado(trabajador);
        setShowModal(true);
    };

    const totalPaginas = Math.ceil(totalTrabajadores / trabajadoresPorPagina);

    return (
        <div className="container mt-5">
            <h1 className="mb-4 mt-5 pt-5 text-center">Lista de Trabajadores</h1>

            {trabajadores.length === 0 && !mensajeError ? (
                <div className="text-center mt-5">
                    <p className="text-muted">Los horarios no han sido cargados.</p>
                    <p>Para cargar los horarios, debe dirigirse a la sección Subir archivo.</p>
                    <Link to="/upload-horario">
                        <Button variant="primary">Ir a Subir Archivo</Button>
                    </Link>
                </div>
            ) : (
                <>
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

                    <div className="mb-4">
                        <h5>Filtrar por Horario Asignado</h5>
                        <input
                            type="text"
                            className="form-control"
                            list="horariosAsignados"
                            value={filtroHorario}
                            onChange={(e) => setFiltroHorario(e.target.value)}
                            placeholder="Buscar horario asignado"
                        />
                        <datalist id="horariosAsignados">
                            {horariosAsignados.map((horario, index) => (
                                <option key={index} value={horario} />
                            ))}
                        </datalist>
                        <Button variant="primary" onClick={manejarFiltro} className="mt-2">Cargar Filtro</Button>
                        <Button variant="secondary" onClick={limpiarFiltro} className="mt-2 ms-2">Limpiar Filtro</Button>
                    </div>

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
                </>
            )}

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
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Trabajadores;
