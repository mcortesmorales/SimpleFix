import React from 'react';
import { FaCopy } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const RepairPage = () => {
  const navigate = useNavigate();

  // Información de la tarjeta
  const card = { 
    title: "Corregir Duplicados", 
    text: "Utiliza la herramienta para corregir los datos duplicados.", 
    icon: <FaCopy size={35} />, 
    buttonText: "Corregir Ahora", 
    onClick: () => navigate('/dup-repair') // Navega a la herramienta de corrección en /repair-tool
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 p-5">
      <h2 className="text-center mb-5">Herramientas de Reparación</h2>
      <div className="row justify-content-center">
        <div className="col-md-12 col-sm-12 mb-5">
          <div className="card text-center shadow-sm" style={{ position: 'relative' }}>
            <div className="icon-container" style={{
                width: '60px', 
                height: '60px', 
                borderRadius: '26%', 
                backgroundColor: '#007bff', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                position: 'absolute', 
                top: '-30px', 
                left: '50%', 
                transform: 'translateX(-50%)' 
              }}>
              {card.icon}
            </div>
            <div className="card-body mt-4">
              <h5 className="card-title">{card.title}</h5>
              <p className="card-text">{card.text}</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={card.onClick} // Llama a onClick para navegar
              >
                {card.buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairPage;
