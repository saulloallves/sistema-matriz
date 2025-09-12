import { Box, Container } from '@mui/material';
import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';
import Header from './Header';

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
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: '120px', // Espaço para a sidebar flutuante
      }}>
        <Header />
        <Box component="main" sx={{ 
          flexGrow: 1, 
          padding: '24px 16px', 
          backgroundColor: 'transparent'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;