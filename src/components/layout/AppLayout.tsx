import { Box } from '@mui/material';
import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';
import logoHeader from '@/assets/logo-header.png';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#eaeef6',
      position: 'relative'
    }}>
      <AppSidebar />
      
      {/* Logo fixo no canto superior direito */}
      <Box sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 1000,
        backgroundColor: '#fff',
        padding: '8px 16px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <img 
          src={logoHeader} 
          alt="Cresci e Perdi" 
          style={{ height: '32px', width: 'auto' }}
        />
      </Box>
      
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 3, 
        marginLeft: '120px', // Espaço para a sidebar flutuante
        backgroundColor: 'transparent',
        width: 'calc(100vw - 120px)', // Limita a largura total
        maxWidth: 'calc(100vw - 120px)',
        overflow: 'hidden', // Evita overflow
      }}>
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;