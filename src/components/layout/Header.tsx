import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { User, Bell, Settings } from 'lucide-react';
import { useState } from 'react';
import logoHeader from '@/assets/logo-header.png';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        background: '#fff',
        borderRadius: '0 0 10px 10px',
        boxShadow: '0 2px 20px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.05)',
        borderTop: 'none',
        margin: '0 16px',
        marginTop: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img 
            src={logoHeader} 
            alt="Cresci e Perdi" 
            style={{ height: '40px', width: 'auto' }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="medium"
            sx={{ 
              color: '#6a778e',
              width: 40,
              height: 40,
              borderRadius: '10px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(64, 111, 243, 0.1)',
                color: '#406ff3',
              }
            }}
          >
            <Bell size={18} />
          </IconButton>
          
          <IconButton
            size="medium"
            sx={{ 
              color: '#6a778e',
              width: 40,
              height: 40,
              borderRadius: '10px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(64, 111, 243, 0.1)',
                color: '#406ff3',
              }
            }}
          >
            <Settings size={18} />
          </IconButton>
          
          <IconButton
            onClick={handleMenu}
            sx={{ 
              padding: 0,
              marginLeft: 1,
              '&:hover': {
                backgroundColor: 'transparent',
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: '#406ff3',
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              <User size={18} />
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
            PaperProps={{
              sx: {
                borderRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.05)',
                mt: 1,
              }
            }}
          >
            <MenuItem 
              onClick={handleClose}
              sx={{
                borderRadius: '6px',
                margin: '4px 8px',
                '&:hover': {
                  backgroundColor: 'rgba(64, 111, 243, 0.1)',
                }
              }}
            >
              Perfil
            </MenuItem>
            <MenuItem 
              onClick={handleClose}
              sx={{
                borderRadius: '6px',
                margin: '4px 8px',
                '&:hover': {
                  backgroundColor: 'rgba(64, 111, 243, 0.1)',
                }
              }}
            >
              Configurações
            </MenuItem>
            <MenuItem 
              onClick={handleClose}
              sx={{
                borderRadius: '6px',
                margin: '4px 8px',
                '&:hover': {
                  backgroundColor: 'rgba(64, 111, 243, 0.1)',
                }
              }}
            >
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;