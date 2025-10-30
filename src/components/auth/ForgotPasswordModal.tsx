import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Mail, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal = ({ open, onClose }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor, informe seu email');
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email inválido');
      return;
    }

    setIsSubmitting(true);

    try {
      // Buscar todos os usuários com emails usando a função RPC
      const { data: usersWithEmails, error: searchError } = await supabase
        .rpc('get_users_with_emails');

      if (searchError) {
        console.error('Erro ao buscar usuários:', searchError);
        toast.error('Erro ao buscar usuário');
        setIsSubmitting(false);
        return;
      }

      // Filtrar pelo email informado
      const user = usersWithEmails?.find(
        (u: { email?: string; user_id: string; full_name: string; phone_number: string }) => 
          u.email?.toLowerCase().trim() === email.toLowerCase().trim()
      );

      if (!user) {
        toast.error('Email não encontrado no sistema');
        setIsSubmitting(false);
        return;
      }

      // Chamar a Edge Function de reset de senha
      const { error: resetError } = await supabase.functions.invoke('reset-user-password', {
        body: {
          user_id: user.user_id,
          full_name: user.full_name,
          phone_number: user.phone_number,
          email: user.email,
        },
      });

      if (resetError) {
        console.error('Erro ao resetar senha:', resetError);
        toast.error('Erro ao resetar senha. Tente novamente.');
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      toast.success('Nova senha gerada e enviada!');

      // Fechar o modal após 3 segundos
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error: unknown) {
      console.error('Erro ao processar reset de senha:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao resetar senha';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 0 40px rgba(0,0,0,0.15)',
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #fef5e7 0%, #fdebd0 100%)',
          color: '#8b6f47',
          fontWeight: 700,
          fontSize: '1.5rem',
          padding: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <KeyRound size={28} />
        Esqueci Minha Senha
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ padding: 3 }}>
          {success ? (
            <Alert 
              severity="success" 
              icon={<CheckCircle />}
              sx={{ 
                borderRadius: '12px',
                '& .MuiAlert-message': {
                  width: '100%',
                }
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Senha resetada com sucesso!
              </Typography>
              <Typography variant="body2">
                Uma nova senha foi gerada e enviada para:
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                • WhatsApp (se cadastrado)<br />
                • Email: {email}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Aguarde enquanto fechamos esta janela...
              </Typography>
            </Alert>
          ) : (
            <Box>
              <Alert 
                severity="info" 
                icon={<AlertCircle />}
                sx={{ 
                  mb: 3,
                  borderRadius: '12px',
                }}
              >
                <Typography variant="body2">
                  Digite seu email cadastrado. Uma nova senha será gerada automaticamente 
                  e enviada via WhatsApp e Email.
                </Typography>
              </Alert>

              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 1,
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
                  placeholder="seu.email@exemplo.com"
                  required
                  disabled={isSubmitting}
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={20} color="#f59e42" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: '#f8f9fa',
                      '& fieldset': {
                        border: '1px solid rgba(0,0,0,0.1)',
                      },
                      '&:hover fieldset': {
                        border: '1px solid #f59e42',
                      },
                      '&.Mui-focused fieldset': {
                        border: '2px solid #f59e42',
                      },
                    },
                  }}
                />
              </Box>

              <Alert 
                severity="warning"
                sx={{ 
                  mt: 2,
                  borderRadius: '12px',
                  backgroundColor: '#fff8e1',
                  '& .MuiAlert-icon': {
                    color: '#f59e42',
                  }
                }}
              >
                <Typography variant="body2">
                  <strong>Importante:</strong> Sua senha atual será substituída. 
                  Use a nova senha enviada para fazer login.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ padding: 3, paddingTop: 0 }}>
          {!success && (
            <>
              <Button
                onClick={handleClose}
                disabled={isSubmitting}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#666',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !email}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <KeyRound size={20} />}
                sx={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f59e42 0%, #ffb366 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'none',
                  paddingX: 3,
                  boxShadow: '0 4px 20px rgba(245, 158, 66, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #d17a2a 0%, #f59e42 100%)',
                    boxShadow: '0 6px 25px rgba(245, 158, 66, 0.4)',
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#999',
                    boxShadow: 'none',
                  },
                }}
              >
                {isSubmitting ? 'Resetando...' : 'Resetar Senha'}
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};
