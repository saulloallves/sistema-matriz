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

const cargoSchema = z.object({
  role: z.string().min(2, 'O nome do cargo deve ter pelo menos 2 caracteres'),
});

type CargoFormData = z.infer<typeof cargoSchema>;

interface CargoAddModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CargoFormData) => void;
  isLoading: boolean;
}

export const CargoAddModal = ({ open, onClose, onSave, isLoading }: CargoAddModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CargoFormData>({
    resolver: zodResolver(cargoSchema),
    defaultValues: { role: '' },
  });

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
          <Typography variant="h6">Adicionar Novo Cargo</Typography>
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
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};