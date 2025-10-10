import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { MessageSquare, Building2, Calendar, Hash } from 'lucide-react';
import { WhatsAppGroupWithUnidade, whatsappGroupKindLabels, whatsappGroupKindColors } from '@/types/whatsapp';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WhatsAppGroupViewModalProps {
  open: boolean;
  onClose: () => void;
  group: WhatsAppGroupWithUnidade | null;
}

export const WhatsAppGroupViewModal: React.FC<WhatsAppGroupViewModalProps> = ({
  open,
  onClose,
  group
}) => {
  if (!group) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <MessageSquare size={24} />
            <Typography variant="h6">Detalhes do Grupo WhatsApp</Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Unidade */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Building2 size={20} color="#666" />
              <Typography variant="subtitle2" color="text.secondary">
                Unidade
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="medium">
              {group.unidade_code} - {group.unidade_name}
            </Typography>
          </Box>

          <Divider />

          {/* Tipo de Grupo */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Tipo de Grupo
            </Typography>
            <Chip
              label={whatsappGroupKindLabels[group.kind as keyof typeof whatsappGroupKindLabels]}
              color={whatsappGroupKindColors[group.kind as keyof typeof whatsappGroupKindColors] as any}
              size="medium"
            />
          </Box>

          <Divider />

          {/* ID do Grupo */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Hash size={20} color="#666" />
              <Typography variant="subtitle2" color="text.secondary">
                ID do Grupo WhatsApp
              </Typography>
            </Box>
            <Typography 
              variant="body1" 
              fontWeight="medium"
              sx={{ 
                fontFamily: 'monospace',
                backgroundColor: 'grey.100',
                padding: 1,
                borderRadius: 1,
                wordBreak: 'break-all'
              }}
            >
              {group.group_id}
            </Typography>
          </Box>

          <Divider />

          {/* Data de Criação */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Calendar size={20} color="#666" />
              <Typography variant="subtitle2" color="text.secondary">
                Data de Criação
              </Typography>
            </Box>
            <Typography variant="body1">
              {format(new Date(group.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};