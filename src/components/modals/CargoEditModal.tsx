import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Briefcase, X, Save } from 'lucide-react';
import { CargoLoja } from '@/hooks/useCargosLoja';

const cargoSchema = z.object({
  role: z.string().min(2, 'O nome do cargo deve ter pelo menos 2 caracteres'),
});

type CargoFormData = z.infer<typeof cargoSchema>;

interface CargoEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CargoFormData) => void;
  isLoading: boolean;
  cargo: CargoLoja | null;
}

export const CargoEditModal = ({ open, onClose, onSave, isLoading, cargo }: CargoEditModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CargoFormData>({
    resolver: zodResolver(cargoSchema),
  });

  useEffect(() => {
    if (cargo) {
      reset({ role: cargo.role });
    }
  }, [cargo, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: CargoFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Briefcase size={24} />
          <Typography variant="h6">Editar Cargo</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                margin="dense"
                label="Nome do Cargo"
                type="text"
                fullWidth
                variant="outlined"
                error={!!errors.role}
                helperText={errors.role?.message}
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} variant="outlined">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={16} /> : <Save size={16} />}>
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};