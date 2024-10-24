import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  // Función para obtener los usuarios desde el backend al cargar el componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/users');
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error al obtener los usuarios', error);
      }
    };
    
    fetchUsers();
  }, []);

  // Función para agregar un nuevo usuario
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (username.trim() !== '') {
      try {
        const response = await axios.post('http://localhost:5000/auth/register', { username, password: username });
        setUsers([...users, username]); // Actualiza la lista de usuarios
        setUsername(''); // Limpiar el campo de entrada
        setError('');
      } catch (error) {
        setError(error.response?.data?.message || 'Error al agregar el usuario');
        console.error('Error al agregar usuario', error);
      }
    }
  };

  // Función para eliminar un usuario
  const handleDeleteUser = async (userToDelete) => {
    try {
      await axios.delete(`http://localhost:5000/auth/users/${userToDelete}`);
      setUsers(users.filter(user => user !== userToDelete)); // Elimina el usuario del estado local
    } catch (error) {
      console.error('Error al eliminar el usuario', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Panel de Administración</h2>

      {/* Formulario para agregar usuario */}
      <div className="card p-4 mb-4 shadow-sm">
        <h4>Agregar Usuario</h4>
        <form onSubmit={handleAddUser}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Nombre de usuario</label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100">Agregar Usuario</button>
          {error && <p className="text-danger mt-2">{error}</p>}
        </form>
      </div>

      {/* Lista de usuarios */}
      <div className="card p-4 shadow-sm">
        <h4>Usuarios Agregados</h4>
        {users.length === 0 ? (
          <p>No hay usuarios agregados aún.</p>
        ) : (
          <ul className="list-group">
            {users.map((user, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                {user}
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => handleDeleteUser(user)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
