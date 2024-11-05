import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/'); // Redirige a la ruta raíz
  };

  return (
    <div className="container text-center my-5 py-5">
      <h1 className="display-1">404</h1>
      <h2>Página no encontrada</h2>
      <p className="lead">Lo sentimos, pero la página que estás buscando no existe.</p>
      <button className="btn btn-primary btn-lg" onClick={handleGoHome}>
        Volver a Inicio
      </button>
    </div>
  );
};

export default NotFoundPage;
