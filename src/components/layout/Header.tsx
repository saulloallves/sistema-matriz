import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { AccountCircle, Notifications, Settings } from '@mui/icons-material';
import { useState } from 'react';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        backgroundColor: '#fff',
        color: '#333',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, color: '#333' }}
        >
          Sistema de Gerenciamento
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="large"
            color="inherit"
            sx={{ color: '#666' }}
          >
            <Notifications />
          </IconButton>
          
          <IconButton
            size="large"
            color="inherit"
            sx={{ color: '#666' }}
          >
            <Settings />
          </IconButton>
          
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
            sx={{ color: '#666' }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Perfil</MenuItem>
            <MenuItem onClick={handleClose}>Configurações</MenuItem>
            <MenuItem onClick={handleClose}>Sair</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;