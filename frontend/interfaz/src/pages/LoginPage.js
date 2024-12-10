import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Nuevo estado para el mensaje de éxito
  const { login } = useAuth();
  const [shakeUsername, setShakeUsername] = useState(false); // Estado para el efecto shake
  const [shakePassword, setShakePassword] = useState(false); // Estado para el efecto shake

  const logEvent = async (log) => {
    try {
      await axios.post('http://localhost:5002/insert_logs', log);
    } catch (error) {
      console.error('Error al enviar el log:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = new Date();
    try {
      const response = await axios.post('http://localhost:5000/auth/login', { username, password });
      const { access_token, role } = response.data;
      login(username, access_token, role);

      // Limpiar mensajes de error y establecer el mensaje de éxito
      setErrorMessage('');
      setSuccessMessage('Inicio de sesión exitoso.');
      setShakeUsername(false);
      setShakePassword(false);

      // Enviar log de éxito
      const log = {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        userName: username,
        event: "Inicio de Sesión",
        details: "El usuario " + username + " ha iniciado sesión exitosamente.",
        state: "Exitoso",
        module: "Autenticación"
      };
      await logEvent(log);

      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al iniciar sesión');
      setShakeUsername(true);
      setShakePassword(true);
      console.error(errorMessage);

      // Enviar log de fallo
      const log = {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        userName: username,
        event: "Inicio de Sesión",
        details: "El usuario " + username + " ha fallado al intentar iniciar sesión.",
        state: "Fallido",
        module: "Autenticación"
      };
      await logEvent(log);

      // Limpiar el estado de shake después de 500ms (duración de la animación)
      setTimeout(() => {
        setShakeUsername(false);
        setShakePassword(false);
      }, 500);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow px-5">
        <h2 className="text-center mb-4">Iniciar Sesión</h2>
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Nombre de usuario</label>
            <input
              type="text"
              className={`form-control ${shakeUsername ? 'shake' : ''}`} // Aplicar shake si es necesario
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              className={`form-control ${shakePassword ? 'shake' : ''}`} // Aplicar shake si es necesario
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Iniciar Sesión</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
