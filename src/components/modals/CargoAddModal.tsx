import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { Briefcase, X, Save } from 'lucide-react';
import { storeRoleEnumOptions } from '@/hooks/useCargosLoja';

const cargoSchema = z.object({
  role: z.enum(storeRoleEnumOptions as [string, ...string[]], {
    errorMap: () => ({ message: 'Selecione um cargo válido' }),
  }),
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
    defaultValues: { role: '' as any },
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
          <Box sx={{ pt: 1 }}>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel>Nome do Cargo</InputLabel>
                  <Select
                    {...field}
                    label="Nome do Cargo"
                  >
                    {storeRoleEnumOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Box>
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