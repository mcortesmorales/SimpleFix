import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      axios
        .get('http://localhost:5000/auth/user-info', {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
        .then(response => {
          // Asegúrate de que `response.data` incluya tanto `username` como `role`
          setUser({ username: response.data.username, role: response.data.role });
        })
        .catch(() => {
          logout(); // Si el token es inválido, cierra la sesión
        })
        .finally(() => {
          setLoading(false); // Asegúrate de que loading se establezca en false
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (username, access_token, role) => {
    setToken(access_token);
    setUser({ username, role });
    localStorage.setItem('token', access_token);
    navigate('/');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login'); // Redirigir al login después de cerrar sesión
  };

  const isAuthenticated = () => !!token;

  if (loading) {
    return (
      <h2>
        Cargando . . .
      </h2> // O muestra un spinner mientras se carga la información de autenticación
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
