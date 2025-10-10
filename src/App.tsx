import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { muiTheme } from './theme/muiTheme';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import UnidadesPage from "./pages/UnidadesPage";
import FranqueadosPage from "./pages/FranqueadosPage";
import FranqueadosUnidadesPage from "./pages/FranqueadosUnidadesPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import GruposWhatsAppPage from "./pages/GruposWhatsAppPage";
import ClientesPage from "./pages/ClientesPage";
import ClientesFilhosPage from "./pages/ClientesFilhosPage";
import FranqueadosFilhosPage from "./pages/FranqueadosFilhosPage";
import ColaboradoresInternoPage from "./pages/ColaboradoresInternoPage";
import ColaboradoresLojaPage from "./pages/ColaboradoresLojaPage";
import CargosLojaPage from "./pages/CargosLojaPage";
import SenhasPage from "./pages/SenhasPage";
import PermissoesPage from "./pages/PermissoesPage";
import AuthPage from "./pages/AuthPage";
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
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/unidades" element={<UnidadesPage />} />
                    <Route path="/franqueados" element={<FranqueadosPage />} />
                    <Route path="/franqueados-unidades" element={<FranqueadosUnidadesPage />} />
                    <Route path="/franqueados-filhos" element={<FranqueadosFilhosPage />} />
                    <Route path="/clientes" element={<ClientesPage />} />
                    <Route path="/clientes-filhos" element={<ClientesFilhosPage />} />
                    <Route path="/colaboradores-interno" element={<ColaboradoresInternoPage />} />
                    <Route path="/colaboradores-loja" element={<ColaboradoresLojaPage />} />
                    <Route path="/cargos-loja" element={<CargosLojaPage />} />
                    <Route path="/senhas" element={<SenhasPage />} />
                    <Route path="/permissoes" element={<PermissoesPage />} />
                    <Route path="/grupos-whatsapp" element={<GruposWhatsAppPage />} />
                    <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                    <Route path="/evento-seguidores" element={
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">Página em desenvolvimento</Typography>
                      </Box>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
