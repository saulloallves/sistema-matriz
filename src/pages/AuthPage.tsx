import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import logoPrincipal from '@/assets/logo-principal.png';

const AuthPage = () => {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Se já estiver logado, redireciona para o dashboard
  useEffect(() => {
    if (user && !loading) {
      // Usar setTimeout para evitar warnings do React sobre updates durante render
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: '#eaeef6'
        }}
      >
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    setIsSubmitting(true);
    await signIn(email, password);
    setIsSubmitting(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#eaeef6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          borderRadius: '20px',
          boxShadow: '0 0 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #406ff3 0%, #5a7ef4 100%)',
            padding: 4,
            textAlign: 'center',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
            <img 
              src={logoPrincipal} 
              alt="Cresci e Perdi" 
              style={{ height: '80px', width: 'auto' }}
            />
          </Box>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#fff', 
              fontWeight: 700,
              marginBottom: 1,
            }}
          >
            Sistema de Gerenciamento
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)',
              fontSize: '1rem',
            }}
          >
            Acesse sua conta para continuar
          </Typography>
        </Box>

        <CardContent sx={{ padding: 4 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ marginBottom: 3 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  marginBottom: 1,
                  color: '#666',
                  fontWeight: 500,
                }}
              >
                Email
              </Typography>
              <TextField
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} color="#406ff3" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#f8f9fa',
                    border: 'none',
                    '& fieldset': {
                      border: '1px solid rgba(0,0,0,0.1)',
                    },
                    '&:hover fieldset': {
                      border: '1px solid #406ff3',
                    },
                    '&.Mui-focused fieldset': {
                      border: '2px solid #406ff3',
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ marginBottom: 4 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  marginBottom: 1,
                  color: '#666',
                  fontWeight: 500,
                }}
              >
                Senha
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color="#406ff3" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        sx={{ color: '#666' }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#f8f9fa',
                    border: 'none',
                    '& fieldset': {
                      border: '1px solid rgba(0,0,0,0.1)',
                    },
                    '&:hover fieldset': {
                      border: '1px solid #406ff3',
                    },
                    '&.Mui-focused fieldset': {
                      border: '2px solid #406ff3',
                    },
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting || !email || !password}
              sx={{
                height: 56,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #406ff3 0%, #5a7ef4 100%)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 4px 20px rgba(64, 111, 243, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #355bb8 0%, #4a6ad1 100%)',
                  boxShadow: '0 6px 25px rgba(64, 111, 243, 0.4)',
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#999',
                  boxShadow: 'none',
                },
              }}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <Divider sx={{ margin: '24px 0', color: '#ddd' }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Sistema de Franquias
            </Typography>
          </Divider>

          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center',
              color: '#666',
              fontSize: '0.875rem',
            }}
          >
            Acesso restrito a usuários autorizados
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthPage;