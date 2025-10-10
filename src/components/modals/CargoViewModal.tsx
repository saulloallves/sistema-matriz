import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { Briefcase, X } from 'lucide-react';
import { CargoLoja } from '@/hooks/useCargosLoja';

interface CargoViewModalProps {
  open: boolean;
  onClose: () => void;
  cargo: CargoLoja | null;
}

export const CargoViewModal = ({ open, onClose, cargo }: CargoViewModalProps) => {
  if (!cargo) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Briefcase size={24} />
          <Typography variant="h6">Detalhes do Cargo</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mt: 2 }}>
          <strong>Nome do Cargo:</strong> {cargo.role}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="contained">Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};