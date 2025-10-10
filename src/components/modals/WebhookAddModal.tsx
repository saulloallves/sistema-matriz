import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Plus, Webhook } from 'lucide-react';

interface WebhookAddModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (webhook: {
    endpoint_url: string;
    secret: string | null;
    topic: string;
    enabled: boolean;
    nickname: string | null;
  }) => void;
  isLoading?: boolean;
}

const TOPIC_OPTIONS = [
  { value: 'generic', label: 'Generic (Todas as tabelas)' },
  { value: 'franqueados_changed', label: 'Franqueados' },
  { value: 'unidades_changed', label: 'Unidades' },
  { value: 'franqueados_unidades_changed', label: 'Vínculos Franqueado-Unidade' },
  { value: 'profiles_changed', label: 'Perfis de Usuário' },
  { value: 'unidades_grupos_whatsapp_changed', label: 'Grupos WhatsApp' },
];

export const WebhookAddModal: React.FC<WebhookAddModalProps> = ({
  open,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    nickname: '',
    endpoint_url: '',
    secret: '',
    topic: 'generic',
    enabled: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.endpoint_url.trim()) {
      newErrors.endpoint_url = 'URL do endpoint é obrigatória';
    } else if (!/^https?:\/\/.+/.test(formData.endpoint_url)) {
      newErrors.endpoint_url = 'URL deve começar com http:// ou https://';
    }

    if (!formData.topic) {
      newErrors.topic = 'Tópico é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    onSave({
      nickname: formData.nickname.trim() || null,
      endpoint_url: formData.endpoint_url.trim(),
      secret: formData.secret.trim() || null,
      topic: formData.topic,
      enabled: formData.enabled,
    });

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      nickname: '',
      endpoint_url: '',
      secret: '',
      topic: 'generic',
      enabled: true,
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Webhook size={24} />
          Adicionar Webhook
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <TextField
            fullWidth
            label="Apelido (Opcional)"
            placeholder="Ex: Sistema de Vendas, Sistema Financeiro"
            value={formData.nickname}
            onChange={(e) => handleInputChange('nickname', e.target.value)}
            helperText="Nome amigável para identificar este webhook"
            disabled={isLoading}
          />

          <TextField
            fullWidth
            label="URL do Endpoint"
            placeholder="https://exemplo.com/webhook"
            value={formData.endpoint_url}
            onChange={(e) => handleInputChange('endpoint_url', e.target.value)}
            error={!!errors.endpoint_url}
            helperText={errors.endpoint_url || 'URL completa para receber os eventos'}
            disabled={isLoading}
            required
          />

          <FormControl fullWidth required>
            <InputLabel>Tópico</InputLabel>
            <Select
              value={formData.topic}
              label="Tópico"
              onChange={(e) => handleInputChange('topic', e.target.value)}
              disabled={isLoading}
            >
              {TOPIC_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Secret (Opcional)"
            type="password"
            placeholder="Chave secreta para validação"
            value={formData.secret}
            onChange={(e) => handleInputChange('secret', e.target.value)}
            helperText="Usado para assinar as requisições (recomendado para segurança)"
            disabled={isLoading}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.enabled}
                onChange={(e) => handleInputChange('enabled', e.target.checked)}
                disabled={isLoading}
              />
            }
            label="Webhook ativo"
          />

          <Box
            sx={{
              p: 2,
              backgroundColor: 'info.light',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'info.main',
            }}
          >
            <Typography variant="body2" color="info.dark">
              <strong>Formato do Payload:</strong> Os eventos serão enviados como POST com JSON contendo
              'topic' e 'payload' com os dados da tabela alterada.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isLoading}
          startIcon={<Plus size={18} />}
        >
          {isLoading ? 'Salvando...' : 'Adicionar Webhook'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
