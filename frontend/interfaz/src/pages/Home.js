import React from 'react';
import { FaEye, FaUpload, FaWrench, FaUserShield } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../AuthContext'; // Importa el contexto de autenticación
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { user } = useAuth(); // Obtiene la información del usuario, incluyendo su rol
  const navigate = useNavigate();

  const cards = [
    { 
      title: "Visualizar Marcajes", 
      text: "Accede a un resumen detallado de los marcajes y posibles errores.", 
      icon: <FaEye size={35} />, 
      buttonText: "Ver" 
    },
    { 
      title: "Subir Archivos", 
      text: "Cargar los archivos para su corrección y análisis.", 
      icon: <FaUpload size={35} />, 
      buttonText: "Subir Archivos", 
      onClick: () => navigate('/upload-menu') // Navega a la ruta /file-drop
    },
    { 
      title: "Corregir Errores", 
      text: "Utiliza la herramienta para corregir los errores de marcaje en los datos.", 
      icon: <FaWrench size={35} />, 
      buttonText: "Corregir Ahora", 
      onClick: () => navigate('/repair')
    },
  ];

  // Agrega la tarjeta de administración solo si el usuario es administrador
  if (user?.role === 'Administrador') {
    cards.push({
      title: "Panel de Administración",
      text: "Accede al panel de administración para gestionar usuarios y permisos.",
      icon: <FaUserShield size={35} />,
      buttonText: "Ir al Panel",
      onClick: () => navigate('/admin'), // Navega al panel de administración
    });
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 p-5 mt-5">
      <h2 className="text-center mb-5 mt-4">Bienvenido a la Página de Inicio</h2>
      <div className="row justify-content-center">
        {cards.map((card, index) => (
          <div key={index} className="col-md-4 col-sm-12 mb-5">
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
                  onClick={card.onClick} // Llama a onClick si existe
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

export default HomePage;
