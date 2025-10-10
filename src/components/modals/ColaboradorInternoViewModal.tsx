import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import { ColaboradorInterno } from '@/hooks/useColaboradoresInterno';
import { formatCPF, formatPhone, formatCurrency, formatDate } from '@/utils/formatters';

interface Props {
  open: boolean;
  onClose: () => void;
  colaborador: ColaboradorInterno | null;
  onEdit: () => void;
}

export default function ColaboradorInternoViewModal({ open, onClose, colaborador, onEdit }: Props) {
  if (!colaborador) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{colaborador.employee_name}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" color="primary">Informações Pessoais</Typography>
        <Typography>CPF: {formatCPF(colaborador.cpf)}</Typography>
        <Typography>Email: {colaborador.email}</Typography>
        <Typography>Telefone: {formatPhone(colaborador.phone)}</Typography>
        <Typography>Data de Nascimento: {formatDate(colaborador.birth_date)}</Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" color="primary">Informações Profissionais</Typography>
        <Typography>Data de Admissão: {formatDate(colaborador.admission_date)}</Typography>
        <Typography>Salário: {formatCurrency(colaborador.salary)}</Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" color="primary">Benefícios</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          <Chip label={`Vale Refeição: ${colaborador.meal_voucher_active ? 'Sim' : 'Não'}`} 
                color={colaborador.meal_voucher_active ? 'success' : 'default'} size="small" />
          <Chip label={`Vale Transporte: ${colaborador.transport_voucher_active ? 'Sim' : 'Não'}`} 
                color={colaborador.transport_voucher_active ? 'success' : 'default'} size="small" />
          <Chip label={`Plano de Saúde: ${colaborador.health_plan ? 'Sim' : 'Não'}`} 
                color={colaborador.health_plan ? 'success' : 'default'} size="small" />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
        <Button onClick={onEdit} variant="contained">Editar</Button>
      </DialogActions>
    </Dialog>
  );
}
