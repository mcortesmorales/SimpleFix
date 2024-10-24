import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-light py-3">
      <nav className="container d-flex justify-content-between">
        <h1 className="h4">SimpleFix</h1>
        <div>
          <Link to="/" className="btn btn-link">Home</Link>
          <Link to="/subir" className="btn btn-link">Subir Archivos</Link>
          <Link to="/visualizacion" className="btn btn-link">Visualización</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
