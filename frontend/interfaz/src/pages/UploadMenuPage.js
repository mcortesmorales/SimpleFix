import React from 'react';
import { FaClock, FaCalendarAlt } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const UploadMenuPage = () => {
  const navigate = useNavigate();

  // Información de las tarjetas
  const cards = [
    {
      title: "Subir Archivo de Reloj",
      text: "Carga aquí los datos provenientes del reloj de asistencia.",
      icon: <FaClock size={35} />,
      buttonText: "Subir Archivo",
      onClick: () => navigate('/upload-reloj'), // Navega a la página de carga de reloj
    },
    {
      title: "Subir Archivo de Horario",
      text: "Carga aquí los datos de los horarios de los empleados.",
      icon: <FaCalendarAlt size={35} />,
      buttonText: "Subir Archivo",
      onClick: () => navigate('/upload-horario'), // Navega a la página de carga de horario
    },
  ];

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 p-5">
      <h2 className="text-center mb-5">Herramientas de Carga</h2>
      <div className="row justify-content-center">
        {cards.map((card, index) => (
          <div key={index} className="col-md-6 col-sm-12 mb-5">
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
        ))}
      </div>
    </div>
  );
};

export default UploadMenuPage;
