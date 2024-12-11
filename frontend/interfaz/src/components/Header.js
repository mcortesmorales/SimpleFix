import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { AppBar, Toolbar, Typography, Menu, MenuItem, IconButton, Box } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { logsGen } from '../modules/logUtils';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logsGen({
      event: 'Cierre de Sesion',
      detail: `El usuario ${user.username} ha cerrado sesión.`,
      state: 'Exitoso',
      module: 'Autenticación',
    });
    logout();
    handleClose();
  };

  if (!isAuthenticated()) return null;

  return (
    <AppBar position="fixed">
      <Toolbar>
        {/* Título con funcionalidad de enlace */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'white',
            '&:hover': {
              color: 'lightblue',
              transition: 'color 0.3s ease',
            },
          }}
        >
          SimpleFix
        </Typography>

        <div>
          {/* Filtrar rutas visibles según el rol */}
          {[
            { path: '/', label: 'Inicio' },
            { path: '/visualize-page', label: 'Visualización' },
            { path: '/repair', label: 'Reparar' },
            { path: '/upload-menu', label: 'Subir Archivos' },
            { path: '/get_logs', label: 'Registro de Logs' },
            ...(user?.role === 'Administrador'
              ? [{ path: '/admin', label: 'Panel de Administración' }]
              : []),
          ].map((route, index) => (
            <Link
              key={index}
              to={route.path}
              style={{
                color: 'white',
                marginRight: 16,
                textDecoration: 'none',
                '&:hover': {
                  color: 'lightblue',
                  transition: 'color 0.3s ease',
                },
              }}
            >
              {route.label}
            </Link>
          ))}
        </div>

        {/* Contenedor del nombre de usuario e icono */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: '4px 12px',
            borderRadius: '20px',
            marginLeft: '16px',
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
            <MenuItem onClick={handleClose} component={Link} to="/configuracion">
              Configuración
            </MenuItem>
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
