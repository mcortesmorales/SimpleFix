// src/pages/SettingsPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { logsGen } from '../modules/logUtils'

const SettingsPage = () => {
  const { token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Las nuevas contraseñas no coinciden');
      await logsGen(
        { 
          event: "Cambio de contraseña", 
          detail: "Se intento realizar un cambio en la contraseña del usuario.",
          state: 'Fallido', 
          module: "Gestion de usuario" 
      });
      return;
    }

    try {
        console.log(currentPassword);
        console.log(newPassword);
      await axios.post(
        'http://localhost:5000/auth/change-password',
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMessage('¡Contraseña cambiada exitosamente!');
      setErrorMessage('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      await logsGen(
        { 
          event: "Cambio de contraseña", 
          detail: "Se realizo un cambio de contraseña por parte del usuario.",
          state: 'Exitoso', 
          module: "Gestion de usuario" 
      });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al cambiar la contraseña');
      setSuccessMessage('');
      await logsGen(
        { 
          event: "Cambio de contraseña",  
          detail: "Se intento realizar un cambio en la contraseña del usuario.",
          state: 'Fallido', 
          module: "Gestion de usuario" 
      });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow px-5">
        <h2 className="text-center mb-4">Configuración de Cuenta</h2>
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        <form onSubmit={handlePasswordChange}>
          <div className="mb-3">
            <label htmlFor="currentPassword" className="form-label">Contraseña Actual</label>
            <input
              type="password"
              className="form-control"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
            <input
              type="password"
              className="form-control"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmNewPassword" className="form-label">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              className="form-control"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Cambiar Contraseña</button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
