import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa';
import './DupRepairPage.css';
import { logsGen } from '../modules/logUtils'
import axios from 'axios';

const DupRepairPage = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [diagnosisResults, setDiagnosisResults] = useState(null); // Para almacenar resultados del diagnóstico
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [defaultInterval, setDefaultInterval] = useState(3); // Intervalo predeterminado
  const [groupIntervals, setGroupIntervals] = useState([]); // Lista de grupos
  const [newGroup, setNewGroup] = useState(""); // Nuevo grupo a agregar
  const [customValues, setCustomValues] = useState([]); // Lista de valores personalizados
  const [newCustomValue, setNewCustomValue] = useState(""); // Nuevo valor personalizado
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null); // Para almacenar los datos del grupo que se está editando
  const [newRut, setNewRut] = useState(""); // Para almacenar el RUT que se está agregando
  const [editingValue, setEditingValue] = useState(null); // Valor actualmente en edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Estado del modal


  // Funciones para manejar la apertura/cierre del modal
  const handleOpenConfigModal = () => setShowConfigModal(true);
  const handleCloseConfigModal = () => setShowConfigModal(false);

  // Función para agregar un grupo
  const handleAddGroup = () => {
    if (newGroup.trim() !== "") {
      // Crear un nuevo objeto para el grupo
      const newGroupObject = {
        id: Date.now(), // ID único basado en el timestamp
        name: newGroup.trim(), // Nombre del grupo
        interval: defaultInterval, // Usar el intervalo por defecto para el nuevo grupo
        active: true, // Por defecto, el grupo estará activo
        ruts: [], // Lista vacía de RUTs (puedes agregar RUTs después)
      };

      // Actualizar el estado con el nuevo grupo
      setGroupIntervals((prev) => [...prev, newGroupObject]);

      // Limpiar el campo de entrada
      setNewGroup("");
    }
  };


  // Función para eliminar un grupo
  const handleRemoveGroup = (group) => {
    setGroupIntervals(groupIntervals.filter((g) => g !== group));
  };

  const handleAddRut = () => {
    if (newRut) {
      setEditingGroup({
        ...editingGroup,
        ruts: [...editingGroup.ruts, newRut],
      });
      setNewRut(""); // Limpiar el campo de entrada
    }
  };

  const handleRemoveRut = (index) => {
    const updatedRuts = editingGroup.ruts.filter((_, i) => i !== index);
    setEditingGroup({
      ...editingGroup,
      ruts: updatedRuts,
    });
  };

  const handleSaveGroupChanges = () => {
    // Aquí puedes hacer la lógica para guardar los cambios del grupo,
    // como actualizar el estado global, hacer una llamada a la API, etc.
    // Por ejemplo:
    setGroupIntervals(groupIntervals.map(group => group.id === editingGroup.id ? editingGroup : group));
    setShowEditGroupModal(false); // Cerrar el modal
  };

  // Función para agregar un valor personalizado
  const handleAddCustomValue = () => {
    if (newCustomValue.trim() !== "") {
      // Generar un nuevo valor personalizado con propiedades por defecto
      const newValue = {
        id: Date.now(), // Generar un ID único (puedes ajustar según tu lógica)
        name: newCustomValue,       // Nombre del valor
        interval: 30,               // Intervalo por defecto (puedes cambiarlo)
        startTime: "08:00",         // Hora de inicio por defecto
        endTime: "09:00",           // Hora de fin por defecto
        active: true                // Estado activo por defecto
      };

      setCustomValues([...customValues, newValue]);
      setNewCustomValue(""); // Limpiar el campo de entrada
    }
  };


  // Función para eliminar un valor personalizado
  const handleRemoveCustomValue = (value) => {
    setCustomValues(customValues.filter((v) => v !== value));
  };

  // Activa o desactiva un valor personalizado
  const handleToggleCustomValue = (id) => {
    setCustomValues(customValues.map((item) =>
      item.id === id ? { ...item, active: !item.active } : item
    ));
  };

  // Abre el modal para editar un valor personalizado
  const handleEditCustomValue = (id) => {
    const valueToEdit = customValues.find((value) => value.id === id);
    setEditingValue({ ...valueToEdit }); // Crear una copia para evitar mutaciones
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingValue(null);
  };

  const handleSaveEdit = () => {
    setCustomValues((prevValues) =>
      prevValues.map((value) =>
        value.id === editingValue.id ? { ...editingValue } : value
      )
    );
    handleCloseEditModal(); // Cerrar el modal después de guardar
  };

  // Define las funciones faltantes
  const handleEditGroup = (groupId) => {
    const group = groupIntervals.find(g => g.id === groupId); // Buscar el grupo por ID
    console.log(groupId);
    console.log(group);
    setEditingGroup(group); // Establecer el grupo para editar
    setShowEditGroupModal(true); // Mostrar el modal de edición
  };

  const handleUpdateInterval = (groupId, newInterval) => {
    setGroupIntervals((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, interval: newInterval } : group
      )
    );
  };

  const handleToggleGroup = (groupId) => {
    setGroupIntervals((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, active: !group.active } : group
      )
    );
  };

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

  const setInfoInLogs = async (fileName) => {
    try {
      // Obtener información del usuario
      const response = await fetch('http://localhost:5000/auth/user-info', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Asegúrate de almacenar el token JWT en localStorage
        }
      });

      if (response.status === 200) {
        const userInfo = response.data;

        // Datos adicionales que quieras incluir en el log
        const logData = {
          fileName: fileName,
          userId: userInfo.username,
          userRole: userInfo.role,
          timestamp: new Date().toISOString()
        };

        // Guardar los datos del log en la base de datos de logs
        const saveResponse = await axios.post('http://localhost:5000/api/insert/logs', logData);
        if (saveResponse.status === 200) {
          console.log('Log saved successfully:', saveResponse.data);
        } else {
          console.error('Failed to save log:', saveResponse.statusText);
        }
      } else {
        console.error('Failed to get user info:', response.statusText);
      }
    } catch (error) {
      console.error('Error in setInfoInLogs:', error);
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

  const handleApplyChanges = () => {
    // Lógica para guardar cambios
    console.log("Cambios aplicados");
    setShowConfigModal(false);
  };

  const handleDiscardChanges = () => {
    // Lógica para descartar cambios
    console.log("Cambios descartados");
    setShowConfigModal(false);
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

              {/* Botón para abrir el modal de configuración */}
              <div className="text-center my-3">
                <button className="btn btn-secondary" onClick={handleOpenConfigModal}>
                  Configurar
                </button>
              </div>
              <div className=' d-flex align-items-center'>

                {showConfigModal && (
                  <div
                    className="modal-overlay"
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro con opacidad
                      zIndex: 1040, // Asegura que el overlay esté por debajo del modal
                    }}
                  ></div>
                )}

                {/* Modal de configuración */}
                {showConfigModal && (
                  <div className="mt-5 pt-5 modal show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-lg" role="document">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Configuraciones</h5>
                          <button type="button" className="btn-close" onClick={handleCloseConfigModal}></button>
                        </div>
                        <div className="modal-body">
                          {/* Intervalo por defecto */}
                          <div className="mb-3">
                            <label className="form-label">
                              Intervalo de tiempo por defecto (minutos)
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary rounded-circle ms-2"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="Este es el intervalo de tiempo en minutos durante el cual dos marcajes consecutivos se consideran duplicados."
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  padding: 0,
                                  textAlign: 'center',
                                  lineHeight: '22px',
                                  fontSize: '12px',
                                }}
                              >
                                ?
                              </button>
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={defaultInterval}
                              onChange={(e) => setDefaultInterval(e.target.value)}
                            />
                          </div>
                          <small className="form-text text-muted">
                            Este intervalo se aplicará a todas las personas que no pertenezcan a un grupo específico.
                          </small>

                          {/* Grupos de personas */}
                          <div className="my-3">
                            <label className="form-label">Intervalos por grupos de personas</label>
                            <ul className="list-group">
                              {groupIntervals.map((group, index) => (
                                <li key={index} className={`list-group-item ${!group.active ? "group-inactive" : ""}`}>
                                  {/* Nombre del grupo */}
                                  <div className="mb-2">
                                    <strong>{group.name}</strong>
                                  </div>

                                  {/* Intervalo solo si el grupo está activo */}

                                  <div className="mb-2">
                                    <span>
                                      Intervalo: <strong>{group.interval} minutos</strong>
                                    </span>
                                  </div>


                                  {/* Controles y botones alineados a la derecha */}
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex ms-auto">
                                      <div className="form-check me-2">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          checked={group.active}
                                          onChange={() => handleToggleGroup(group.id)}
                                        />
                                        <label className="form-check-label">Activo</label>
                                      </div>
                                      <button
                                        type="button"
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => handleEditGroup(group.id)}
                                      >
                                        Editar
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleRemoveGroup(group.id)}
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-2 d-flex">
                              <input
                                type="text"
                                className="form-control"
                                value={newGroup}
                                onChange={(e) => setNewGroup(e.target.value)}
                                placeholder="Agregar nuevo grupo"
                              />
                              <button
                                type="button"
                                className="btn btn-primary ms-2"
                                onClick={handleAddGroup}
                              >
                                Agregar
                              </button>
                            </div>
                          </div>

                          {showEditGroupModal && (
                            <div
                              className="modal-overlay"
                              style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro con opacidad
                                zIndex: 1040, // Asegura que el overlay esté por debajo del modal
                              }}
                            ></div>
                          )}

                          {/* Modal de edición de grupo */}
                          {showEditGroupModal && editingGroup && (
                            <div className="modal show d-block mt-5 pt-5" tabIndex="-1" role="dialog">
                              <div className="modal-dialog modal-lg" role="document">
                                <div className="modal-content">
                                  <div className="modal-header">
                                    <h5 className="modal-title">Editar Grupo: {editingGroup.name}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowEditGroupModal(false)}></button>
                                  </div>
                                  <div className="modal-body">
                                    {/* Editar nombre del grupo */}
                                    <div className="mb-3">
                                      <label className="form-label">Nombre del grupo</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={editingGroup.name}
                                        onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                                      />
                                    </div>

                                    {/* Editar intervalo */}
                                    <div className="mb-3">
                                      <label className="form-label">Intervalo (minutos)</label>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={editingGroup.interval}
                                        onChange={(e) => setEditingGroup({ ...editingGroup, interval: e.target.value })}
                                      />
                                    </div>

                                    {/* Lista de RUTs */}
                                    <div className="mb-3">
                                      <label className="form-label">RUTs asignados</label>
                                      <ul className="list-group">
                                        {editingGroup.ruts.map((rut, index) => (
                                          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                            {rut}
                                            <button
                                              type="button"
                                              className="btn btn-danger btn-sm"
                                              onClick={() => handleRemoveRut(index)}
                                            >
                                              Eliminar
                                            </button>
                                          </li>
                                        ))}
                                      </ul>
                                      <div className="mt-2 d-flex">
                                        <input
                                          type="text"
                                          className="form-control"
                                          value={newRut}
                                          onChange={(e) => setNewRut(e.target.value)}
                                          placeholder="Agregar nuevo RUT"
                                        />
                                        <button
                                          type="button"
                                          className="btn btn-primary ms-2"
                                          onClick={handleAddRut}
                                        >
                                          Agregar
                                        </button>
                                      </div>
                                    </div>
                                    <small className="form-text text-muted">
                                      Se utilizara este intervalo para detectar duplicados a todas las personas que esten en este grupo
                                    </small>



                                  </div>
                                  <div className="modal-footer">
                                    <button
                                      type="button"
                                      className="btn btn-primary"
                                      onClick={handleSaveGroupChanges}
                                    >
                                      Guardar cambios
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-secondary"
                                      onClick={() => setShowEditGroupModal(false)}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Valores personalizados por hora */}
                          <div className="mb-3">
                            <label className="form-label">intervalos por hora</label>
                            <ul className="list-group">
                              {customValues.map((value, index) => (
                                <li
                                  key={index}
                                  className={`list-group-item ${!value.active ? 'group-inactive' : ''} d-flex justify-content-between align-items-center`}
                                >
                                  <div>
                                    {/* Nombre */}
                                    <div className="mb-1">
                                      <strong>{value.name}</strong>
                                    </div>

                                    {/* Intervalo */}
                                    <div className="mb-1">
                                      Intervalo: <strong>{value.interval} minutos</strong>
                                    </div>

                                    {/* Horario */}
                                    <div>
                                      Horario: <strong>{value.startTime}</strong> - <strong>{value.endTime}</strong>
                                    </div>
                                  </div>

                                  {/* Controles */}
                                  <div className="d-flex ms-auto align-items-center">
                                    <div className="form-check me-2">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={value.active}
                                        onChange={() => handleToggleCustomValue(value.id)}
                                      />
                                      <label className="form-check-label">Activo</label>
                                    </div>
                                    <button
                                      type="button"
                                      className="btn btn-warning btn-sm me-2"
                                      onClick={() => handleEditCustomValue(value.id)}
                                      disabled={!value.active}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleRemoveCustomValue(value.id)}
                                      disabled={!value.active}
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>

                            {/* Agregar nuevo valor */}
                            <div className="mt-2 d-flex">
                              <input
                                type="text"
                                className="form-control"
                                value={newCustomValue}
                                onChange={(e) => setNewCustomValue(e.target.value)}
                                placeholder="Nombre del intervalo personalizado"
                              />
                              <button
                                type="button"
                                className="btn btn-primary ms-2"
                                onClick={handleAddCustomValue}
                              >
                                Agregar
                              </button>
                            </div>
                          </div>

                          {isEditModalOpen && (
                            <div
                              className="modal-overlay"
                              style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo oscuro con opacidad
                                zIndex: 1040, // Asegura que el overlay esté por debajo del modal
                              }}
                            ></div>
                          )}

                          {isEditModalOpen && (
                            <div className="modal d-block pt-5 mt-5">
                              <div className="modal-dialog">
                                <div className="modal-content">
                                  <div className="modal-header">
                                    <h5 className="modal-title">Editar Valor Personalizado</h5>
                                    <button
                                      type="button"
                                      className="btn-close"
                                      onClick={handleCloseEditModal}
                                    ></button>
                                  </div>
                                  <div className="modal-body">
                                    <div className="mb-3">
                                      <label className="form-label">Nombre</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={editingValue?.name || ""}
                                        onChange={(e) =>
                                          setEditingValue({ ...editingValue, name: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="mb-3">
                                      <label className="form-label">Intervalo (minutos)</label>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={editingValue?.interval || ""}
                                        onChange={(e) =>
                                          setEditingValue({
                                            ...editingValue,
                                            interval: parseInt(e.target.value, 10) || 0,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="mb-3">
                                      <label className="form-label">Hora de Inicio</label>
                                      <input
                                        type="time"
                                        className="form-control"
                                        value={editingValue?.startTime || ""}
                                        onChange={(e) =>
                                          setEditingValue({ ...editingValue, startTime: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="mb-3">
                                      <label className="form-label">Hora de Fin</label>
                                      <input
                                        type="time"
                                        className="form-control"
                                        value={editingValue?.endTime || ""}
                                        onChange={(e) =>
                                          setEditingValue({ ...editingValue, endTime: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={editingValue?.active || false}
                                        onChange={(e) =>
                                          setEditingValue({ ...editingValue, active: e.target.checked })
                                        }
                                      />
                                      <label className="form-check-label">Activo</label>
                                    </div>
                                  </div>
                                  <div className="modal-footer">
                                    <button
                                      type="button"
                                      className="btn btn-secondary"
                                      onClick={handleCloseEditModal}
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-primary"
                                      onClick={handleSaveEdit}
                                    >
                                      Guardar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleApplyChanges}
                          >
                            Aplicar cambios
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleDiscardChanges}
                          >
                            Descartar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}




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
    </div >
  );
};

export default DupRepairPage;
