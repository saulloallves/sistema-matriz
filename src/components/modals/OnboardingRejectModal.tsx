import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import { XCircle } from 'lucide-react';

interface OnboardingRejectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rejectionReason: string) => void;
  requestNumber: string;
}

// Motivos pré-definidos para rejeição
const REJECTION_REASONS = [
  'Documentação incompleta ou ilegível',
  'Dados pessoais inconsistentes ou incorretos',
  'CNPJ inválido ou já cadastrado',
  'Endereço incompleto ou não localizado',
  'Informações da Unidade insuficientes',
  'Outro',
];

/**
 * Modal para rejeitar uma solicitação de onboarding
 * Exige que o usuário selecione um motivo pré-definido ou descreva outro
 */
const OnboardingRejectModal = ({
  open,
  onClose,
  onSubmit,
  requestNumber,
}: OnboardingRejectModalProps) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Validação
    if (!selectedReason) {
      setError('Por favor, selecione um motivo para a rejeição');
      return;
    }

    // Se selecionou "Outro", validar o campo customizado
    if (selectedReason === 'Outro') {
      if (!customReason.trim()) {
        setError('Por favor, descreva o motivo da rejeição');
        return;
      }
      if (customReason.trim().length < 10) {
        setError('O motivo deve ter pelo menos 10 caracteres');
        return;
      }
    }

    // Determinar qual motivo enviar
    const finalReason = selectedReason === 'Outro' ? customReason.trim() : selectedReason;

    // Submeter
    onSubmit(finalReason);
    
    // Limpar form
    setSelectedReason('');
    setCustomReason('');
    setError('');
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    setError('');
    onClose();
  };

  const handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedReason(event.target.value);
    setError('');
    // Limpar campo customizado se não for "Outro"
    if (event.target.value !== 'Outro') {
      setCustomReason('');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'error.main',
            color: 'white',
          }}
        >
          <XCircle size={24} />
        </Box>
        <Box>
          <Typography variant="h6" component="div">
            Rejeitar Cadastro
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Protocolo: {requestNumber}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Esta ação irá marcar o cadastro como rejeitado. O franqueado poderá
          corrigir as informações e submeter novamente.
        </Alert>

        <FormControl component="fieldset" fullWidth error={!!error}>
          <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
            Selecione o motivo da rejeição:
          </FormLabel>
          <RadioGroup
            value={selectedReason}
            onChange={handleReasonChange}
          >
            {REJECTION_REASONS.map((reason) => (
              <FormControlLabel
                key={reason}
                value={reason}
                control={<Radio />}
                label={reason}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {selectedReason === 'Outro' && (
          <TextField
            label="Descreva o motivo"
            placeholder="Descreva detalhadamente o motivo da rejeição..."
            multiline
            rows={4}
            fullWidth
            value={customReason}
            onChange={(e) => {
              setCustomReason(e.target.value);
              setError('');
            }}
            error={!!error && selectedReason === 'Outro'}
            helperText={
              selectedReason === 'Outro' 
                ? `${customReason.length} caracteres (mínimo 10)` 
                : ''
            }
            required
            sx={{ mt: 2 }}
          />
        )}

        {error && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={!selectedReason}
        >
          Rejeitar Cadastro
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OnboardingRejectModal;
