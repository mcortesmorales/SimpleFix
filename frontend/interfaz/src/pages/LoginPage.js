import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const [shakeUsername, setShakeUsername] = useState(false); // Estado para el efecto shake
  const [shakePassword, setShakePassword] = useState(false); // Estado para el efecto shake

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/auth/login', { username, password });
      const { access_token, role } = response.data;
      login(username, access_token, role);
      setErrorMessage('');
      setShakeUsername(false);
      setShakePassword(false);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al iniciar sesión');
      setShakeUsername(true);
      setShakePassword(true);
      console.error(errorMessage);
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
