import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { muiTheme } from './theme/muiTheme';
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import UnidadesPage from "./pages/UnidadesPage";
import FranqueadosPage from "./pages/FranqueadosPage";
import NotFound from "./pages/NotFound";
import { Box, Typography } from '@mui/material';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/unidades" element={<UnidadesPage />} />
            <Route path="/franqueados" element={<FranqueadosPage />} />
            <Route path="/franqueados-unidades" element={
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">Página em desenvolvimento</Typography>
              </Box>
            } />
            <Route path="/grupos-whatsapp" element={
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">Página em desenvolvimento</Typography>
              </Box>
            } />
            <Route path="/evento-seguidores" element={
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">Página em desenvolvimento</Typography>
              </Box>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
