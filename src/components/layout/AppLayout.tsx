import { Box } from '@mui/material';
import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';

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