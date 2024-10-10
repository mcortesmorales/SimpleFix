import React, { useState } from 'react';

const AdminPanel = () => {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);

  // Función para agregar un nuevo usuario
  const handleAddUser = (e) => {
    e.preventDefault();
    if (username.trim() !== '') {
      setUsers([...users, username]);
      setUsername(''); // Limpiar el campo de entrada
    }
  };

  // Función para eliminar un usuario
  const handleDeleteUser = (userToDelete) => {
    setUsers(users.filter(user => user !== userToDelete));
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
