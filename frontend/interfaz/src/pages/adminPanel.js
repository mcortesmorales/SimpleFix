import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [editPassword, setEditPassword] = useState(false); // Estado para controlar si se puede editar la contraseña

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/users');
        setUsers(response.data.users); // Aseguramos que 'users' tenga el formato esperado desde el backend
      } catch (error) {
        console.error('Error al obtener los usuarios', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!editPassword) {
      setPassword(username);
    }
  }, [username]); // Se actualiza cada vez que cambia el nombre de usuario

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (username.trim() && password.trim() && role.trim()) {
      try {
        await axios.post('http://localhost:5000/auth/register', { username, password, role });
        setUsers([...users, { username, role }]); // Agrega el usuario con el rol
        setUsername('');
        setPassword('');
        setRole('');
        setError('');
      } catch (error) {
        setError(error.response?.data?.message || 'Error al agregar el usuario');
        console.error('Error al agregar usuario', error);
      }
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    try {
      await axios.delete(`http://localhost:5000/auth/users/${userToDelete}`);
      setUsers(users.filter(user => user.username !== userToDelete));
    } catch (error) {
      console.error('Error al eliminar el usuario', error);
    }
  };

  const countAdmins = users.filter(user => user.role === 'Administrador').length;

  return (
    <div className="container my-5 pt-5">
      <h2 className="text-center mb-4">Panel de Administración</h2>

      <div className="card p-4 mb-4 shadow-sm">
        <h4>Agregar Usuario</h4>
        <form onSubmit={handleAddUser}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="username" className="form-label">Nombre de usuario</label>
              <input
                type="text"
                className="form-control"
                id="username"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="password" className="form-label">Contraseña inicial</label>
              <input
                type="text" // Cambiado a "text" para mostrar la contraseña como texto
                className="form-control"
                id="password"
                placeholder="Contraseña"
                value={password}
                disabled={!editPassword}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="editPassword"
                  checked={editPassword}
                  onChange={() => setEditPassword(!editPassword)} // Cambia el estado del checkbox
                />
                <label htmlFor="editPassword" className="form-check-label">
                  Ingreso manual de contraseña
                </label>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="role" className="form-label">Rol</label>
            <select
              className="form-select"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Selecciona un rol</option>
              <option value="Administrador">Administrador</option>
              <option value="Operador">Operador</option>
            </select>
          </div>

          <button type="submit" className="btn btn-success w-100 mt-3">Agregar Usuario</button>
          {error && <p className="text-danger mt-2">{error}</p>}
        </form>
      </div>

      <div className="card p-4 shadow-sm">
        <h4>Usuarios Agregados</h4>
        {users.length === 0 ? (
          <p>No hay usuarios agregados aún.</p>
        ) : (
          <table className="table table-striped mt-3">
            <thead>
              <tr>
                <th>Nombre de Usuario</th>
                <th>Rol</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(user.username)}
                      disabled={user.role === 'Administrador' && countAdmins === 1} // Deshabilitar si es el único administrador
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
