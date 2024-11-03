// src/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  // Si el usuario no está autenticado, redirige a la página de login
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  // Si se han especificado roles permitidos y el rol del usuario no está en ellos, redirige
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  // Renderiza el componente hijo si el usuario está autenticado y tiene un rol permitido
  return children;
};

export default PrivateRoute;
