import { Box, Container } from '@mui/material';
import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';
import Header from './Header';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#fafafa' }}>
          <Container maxWidth="xl" disableGutters>
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;