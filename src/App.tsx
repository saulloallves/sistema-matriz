import { Suspense, lazy } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { muiTheme } from './theme/muiTheme';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from "./components/layout/AppLayout";
import { Box, Typography, CircularProgress } from '@mui/material';

// Lazy loading das páginas para melhor code splitting
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const UnidadesPage = lazy(() => import("./pages/UnidadesPage"));
const FranqueadosPage = lazy(() => import("./pages/FranqueadosPage"));
const FranqueadosUnidadesPage = lazy(() => import("./pages/FranqueadosUnidadesPage"));
const ConfiguracoesPage = lazy(() => import("./pages/ConfiguracoesPage"));
const GruposWhatsAppPage = lazy(() => import("./pages/GruposWhatsAppPage"));
const ClientesPage = lazy(() => import("./pages/ClientesPage"));
const ClientesFilhosPage = lazy(() => import("./pages/ClientesFilhosPage"));
const FranqueadosFilhosPage = lazy(() => import("./pages/FranqueadosFilhosPage"));
const ColaboradoresLojaPage = lazy(() => import("./pages/ColaboradoresLojaPage"));
const CargosLojaPage = lazy(() => import("./pages/CargosLojaPage"));
const SenhasPage = lazy(() => import("./pages/SenhasPage"));
const PermissoesPage = lazy(() => import("./pages/PermissoesPage"));
const OnboardingRequestsPage = lazy(() => import("./pages/OnboardingRequestsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Componente de loading centralizado
const PageLoader = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="200px"
    sx={{ py: 4 }}
  >
    <CircularProgress size={40} />
  </Box>
);

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
            <Route path="/auth" element={
              <Suspense fallback={<PageLoader />}>
                <AuthPage />
              </Suspense>
            } />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/unidades" element={<UnidadesPage />} />
                      <Route path="/franqueados" element={<FranqueadosPage />} />
                      <Route path="/franqueados-unidades" element={<FranqueadosUnidadesPage />} />
                      <Route path="/franqueados-filhos" element={<FranqueadosFilhosPage />} />
                      <Route path="/clientes" element={<ClientesPage />} />
                      <Route path="/clientes-filhos" element={<ClientesFilhosPage />} />
                      <Route path="/colaboradores-loja" element={<ColaboradoresLojaPage />} />
                      <Route path="/cargos-loja" element={<CargosLojaPage />} />
                      <Route path="/senhas" element={<SenhasPage />} />
                      <Route path="/permissoes" element={<PermissoesPage />} />
                      <Route path="/onboarding" element={<OnboardingRequestsPage />} />
                      <Route path="/grupos-whatsapp" element={<GruposWhatsAppPage />} />
                      <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                      <Route path="/evento-seguidores" element={
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <Typography color="text.secondary">Página em desenvolvimento</Typography>
                        </Box>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
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