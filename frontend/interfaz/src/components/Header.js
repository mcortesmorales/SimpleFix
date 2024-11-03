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
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          SimpleFix
        </Typography>
        <div>
          <Link to="/" style={{ color: 'white', marginRight: 16 }}>Inicio</Link>
          <Link to="/subir" style={{ color: 'white', marginRight: 16 }}>Subir Archivos</Link>
          <Link to="/visualizacion" style={{ color: 'white', marginRight: 16 }}>Visualización</Link>
          {user?.role === 'Administrador' && (
            <Link to="/admin" style={{ color: 'white', marginRight: 16 }}>Panel de Administración</Link>
          )}
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
