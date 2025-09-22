import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Box, Typography, Button } from '@mui/material';
import { Home } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'background.default',
        p: 3
      }}
    >
      <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
        <Typography variant="h1" sx={{ mb: 2, fontSize: '4rem', fontWeight: 'bold', color: 'text.primary' }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ mb: 3, color: 'text.secondary' }}>
          Oops! Página não encontrada
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          A página que você está procurando não existe ou foi movida.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          startIcon={<Home size={20} />}
          sx={{ textTransform: 'none' }}
        >
          Voltar ao Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default NotFound;
