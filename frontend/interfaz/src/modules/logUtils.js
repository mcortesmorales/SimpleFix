// logUtils.js

import axios from 'axios';

export const logsGen = async ({ event = '', detail = '', state = 'Exitoso', module = '' }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error("Token no encontrado. El usuario debe estar autenticado para registrar logs.");
    return;
  }

  try {
    // Función para obtener la información del usuario
    const fetchUserInfo = async () => {
      const response = await axios.get('http://localhost:5000/auth/user-info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 200) {
        return response.data; // Suponiendo que el cuerpo tiene los datos del usuario
      } else {
        throw new Error(`Error al obtener información del usuario: ${response.statusText}`);
      }
    };

    // Obtener la información del usuario
    const userInfo = await fetchUserInfo();
    if (!userInfo || !userInfo.username || !userInfo.role) {
      console.error("Faltan datos clave en la información del usuario.");
      return;
    }

    // Construir datos para el log
    const now = new Date();
    const log = {
      date: now.toISOString().split('T')[0], // Obtiene la fecha en formato YYYY-MM-DD
      time: now.toTimeString().split(' ')[0], // Obtiene la hora en formato HH:mm:ss
      userName: userInfo.username,
      event: event,
      details: detail,
      state: state,
      module: module
    };

    // Enviar el log al backend de auditoria
    const saveResponse = await axios.post('http://localhost:5002/insert_logs', log,{headers: {"Content-Type": "application/json",},}
    );
    if (saveResponse.status === 201) {
      console.log('Log guardado exitosamente:', saveResponse.data);
    } else {
      console.error(`Error al guardar el log: ${saveResponse.statusText}`);
    }
  } catch (error) {
    console.error('Error en setInfoInLogs:', error.message);
  }
};
