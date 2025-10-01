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
      
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 3, 
        marginLeft: '120px',
        backgroundColor: 'transparent',
        width: 'calc(100vw - 120px)',
        maxWidth: 'calc(100vw - 120px)',
        overflow: 'hidden',
      }}>
        {/* Logo no canto superior direito */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 2,
        }}>
          <img 
            src={logoHeader} 
            alt="Cresci e Perdi" 
            style={{ 
              height: '40px', 
              width: 'auto',
              mixBlendMode: 'multiply'
            }}
          />
        </Box>
        
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;