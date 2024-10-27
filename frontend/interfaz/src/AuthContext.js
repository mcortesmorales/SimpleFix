import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga
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
          setUser(response.data.username); // Establece el usuario si el token es válido
          setLoading(false); // Desactiva el estado de carga
        })
        .catch(() => {
          logout(); // Si el token es inválido, cierra la sesión
        });
    } else {
      setLoading(false); // Si no hay token, desactiva el estado de carga
    }
  }, []);

  const login = (username, access_token) => {
    setToken(access_token);
    setUser(username);
    localStorage.setItem('token', access_token);
    navigate('/admin');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isAuthenticated = () => !!token;

  if (loading) {
    return null; // O mostrar un spinner de carga mientras se verifica la autenticación
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
