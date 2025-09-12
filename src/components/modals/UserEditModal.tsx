import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  Tooltip,
  IconButton
} from '@mui/material';
import { Edit2, X, KeyRound } from 'lucide-react';
import { User } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface UserEditModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (id: string, updates: Partial<User>) => void;
  isLoading?: boolean;
}

const UserEditModal = ({ open, onClose, user, onSave, isLoading }: UserEditModalProps) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    status: 'ativo' as 'ativo' | 'inativo',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        status: user.status,
        notes: user.notes || ''
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nome completo é obrigatório';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Telefone é obrigatório';
    } else if (!/^\d{10,11}$/.test(formData.phone_number.replace(/\D/g, ''))) {
      newErrors.phone_number = 'Telefone deve ter 10 ou 11 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) {
      return;
    }

    // Limpar telefone (apenas números)
    const cleanPhone = formData.phone_number.replace(/\D/g, '');
    
    onSave(user.id, {
      full_name: formData.full_name.trim(),
      phone_number: cleanPhone,
      status: formData.status,
      notes: formData.notes.trim() || null
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleResetPassword = async () => {
    if (!user) return;

    setIsResettingPassword(true);
    try {
      const { error } = await supabase.functions.invoke('reset-user-password', {
        body: { 
          user_id: user.user_id,
          full_name: user.full_name,
          phone_number: user.phone_number,
          email: user.email
        }
      });

      if (error) throw error;

      toast.success('Nova senha gerada e enviada via WhatsApp e Email!');
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      toast.error(error.message || 'Erro ao resetar senha do usuário');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
          <Edit2 size={20} />
          Editar Usuário
          <Button
            onClick={handleClose}
            sx={{ ml: 'auto', minWidth: 'auto', p: 1 }}
            disabled={isLoading}
          >
            <X size={20} />
          </Button>
        </DialogTitle>

        <DialogContent dividers sx={{ pb: 3 }}>
          {user && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Email:</strong> {user.email || 'Email não disponível'} (não editável)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Criado em:</strong> {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <TextField
              fullWidth
              label="Nome Completo"
              variant="outlined"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              error={!!errors.full_name}
              helperText={errors.full_name}
              disabled={isLoading}
              required
            />

            <TextField
              fullWidth
              label="Telefone"
              variant="outlined"
              placeholder="(11) 99999-9999"
              value={formatPhone(formData.phone_number)}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              error={!!errors.phone_number}
              helperText={errors.phone_number}
              disabled={isLoading}
              required
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <FormControl fullWidth disabled={isLoading}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="inativo">Inativo</MenuItem>
                </Select>
              </FormControl>
              
              <Tooltip title="Gerar nova senha e enviar via WhatsApp e Email">
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleResetPassword}
                  disabled={isLoading || isResettingPassword}
                  startIcon={isResettingPassword ? <CircularProgress size={16} /> : <KeyRound size={16} />}
                  sx={{ 
                    minWidth: 'auto', 
                    px: 2,
                    height: '56px', // Match TextField height
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isResettingPassword ? 'Gerando...' : 'Reset Senha'}
                </Button>
              </Tooltip>
            </Box>

            <Box /> {/* Empty space */}
          </Box>

          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Observações"
              multiline
              rows={3}
              variant="outlined"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              disabled={isLoading}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={18} /> : <Edit2 size={18} />}
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserEditModal;