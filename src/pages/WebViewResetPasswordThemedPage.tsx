import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  InputAdornment,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { Mail, KeyRound, CheckCircle } from 'lucide-react';
import Logo from '@/assets/logo-principal.png';
import toast, { Toaster } from 'react-hot-toast';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: 'linear-gradient(135deg, #FFF5E6 0%, #FFE1BF 50%, #FFD199 100%)',
      paper: 'rgba(255,255,255,0.9)',
    },
    primary: {
      main: '#f59e42',
    },
  },
  shape: { borderRadius: 16 },
  typography: { fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'radial-gradient(1200px 800px at 10% 10%, #2A2A2A 0%, #121212 60%)',
      paper: 'rgba(30,30,30,0.9)',
    },
    primary: {
      main: '#f59e42',
    },
  },
  shape: { borderRadius: 16 },
  typography: { fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' },
});

interface WebViewResetPasswordThemedPageProps {
  themeMode: 'light' | 'dark';
}

export default function WebViewResetPasswordThemedPage({ themeMode }: WebViewResetPasswordThemedPageProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor, informe seu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email inválido');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: resetError } = await supabase.functions.invoke('reset-user-password', {
        body: { email },
      });

      if (resetError) {
        console.error('Erro ao resetar senha:', resetError);
        toast.error(resetError.message || 'Erro ao resetar senha. Tente novamente.');
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      toast.success('Nova senha gerada e enviada!');
    } catch (error: unknown) {
      console.error('Erro ao processar reset de senha:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={selectedTheme}>
      <CssBaseline />
      <Toaster position="top-center" />
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: { xs: 2, md: 4 },
          overflow: 'hidden',
        }}
      >
        {/* Decorative blur blobs */}
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Box sx={{ position: 'absolute', width: 280, height: 280, filter: 'blur(90px)', background: '#f59e42', opacity: 0.25, top: -40, right: -40, borderRadius: '50%' }} />
          <Box sx={{ position: 'absolute', width: 220, height: 220, filter: 'blur(90px)', background: '#FF6B6B', opacity: 0.15, bottom: -30, left: -30, borderRadius: '50%' }} />
        </Box>
        <Paper
          elevation={3}
          sx={{
            backdropFilter: 'saturate(160%) blur(6px)',
            border: '1px solid',
            borderColor: 'divider',
            padding: { xs: 3, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 480,
            width: '100%',
            borderRadius: 4,
            boxShadow: '0 10px 30px rgba(0,0,0,0.10)'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box component="img" src={Logo} alt="Logo" sx={{ width: 120, height: 'auto' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
              <KeyRound size={24} />
              <Typography variant="overline" sx={{ letterSpacing: 1.2, fontWeight: 700 }}>ACESSO SEGURO</Typography>
            </Box>
          </Box>
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Resetar Senha
          </Typography>

          {success ? (
            <Alert 
              severity="success" 
              icon={<CheckCircle />}
              sx={{ mt: 2, width: '100%', borderRadius: '12px' }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Senha resetada com sucesso!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Uma nova senha foi enviada para o seu WhatsApp e E-mail cadastrados.
              </Typography>
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Informe seu e-mail cadastrado para receber uma nova senha gerada automaticamente.
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Endereço de e-mail"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  aria-label="Endereço de e-mail"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={20} color={selectedTheme.palette.primary.main} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    letterSpacing: 0.2,
                    transition: 'all .2s ease',
                    boxShadow: '0 6px 16px rgba(245,158,66,0.35)',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 10px 20px rgba(245,158,66,0.45)' },
                  }}
                  disabled={isSubmitting || !email}
                >
                  {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Enviar Nova Senha'}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
