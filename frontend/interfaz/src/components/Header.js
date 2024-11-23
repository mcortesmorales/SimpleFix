import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { AppBar, Toolbar, Typography, Menu, MenuItem, IconButton, Box } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!isAuthenticated()) return null;

  return (
    <AppBar position="fixed">
      <Toolbar>
        {/* Título SimpleFix con estilo y funcionalidad de enlace */}
        <Typography
          variant="h6"
          component={Link} // Cambiado a Link para redirigir
          to="/" // Ruta a la que redirige
          sx={{
            flexGrow: 1,
            textDecoration: 'none', // Eliminar subrayado
            color: 'white', // Color del texto
            '&:hover': {
              color: 'lightblue', // Color al pasar el ratón
              transition: 'color 0.3s ease' // Transición suave
            }
          }}
        >
          SimpleFix
        </Typography>
        
        <div>
          {/* Estilo para los enlaces */}
          {['/', '/visualizacion', '/repair', '/admin','/trabajadores','/upload-menu'].map((path, index) => (
            <Link
              key={index}
              to={path}
              style={{
                color: 'white',
                marginRight: 16,
                textDecoration: 'none', // Eliminar subrayado
                '&:hover': {
                  color: 'lightblue', // Color al pasar el ratón
                  transition: 'color 0.3s ease' // Transición suave
                }
              }}
            >
              {path === '/' ? 'Inicio' : path === '/upload-menu' ? 'Subir Archivos' : path === '/visualizacion' ? 'Visualización' : path === '/repair' ? 'Reparar' : path === '/admin' ? 'Panel de administración': path === '/trabajadores' ? 'Ver Trabajadores' : null}
            </Link>
          ))}
        </div>
        
        {/* Contenedor del nombre de usuario e icono con estilo distintivo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: '4px 12px',
            borderRadius: '20px',
            marginLeft: '16px'
          }}
        >
          <Typography variant="subtitle1" style={{ color: 'white', marginRight: 4 }}>
            {user.username}
          </Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            onClick={handleMenu}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose} component={Link} to="/configuracion">Configuración</MenuItem>
            <MenuItem onClick={() => { logout(); handleClose(); }}>Cerrar sesión</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
