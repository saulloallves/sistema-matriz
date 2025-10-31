import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import { X, MessageSquare, Mail, Send, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { ComunicacaoLog } from '@/hooks/useComunicacaoLogs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ComunicacaoLogViewModalProps {
  open: boolean;
  onClose: () => void;
  log: ComunicacaoLog | null;
}

export const ComunicacaoLogViewModal = ({ open, onClose, log }: ComunicacaoLogViewModalProps) => {
  if (!log) return null;

  const getStatusIcon = () => {
    switch (log.status) {
      case 'enviado':
        return <CheckCircle size={20} />;
      case 'erro':
        return <AlertCircle size={20} />;
      case 'pendente':
        return <Clock size={20} />;
      default:
        return <Send size={20} />;
    }
  };

  const getStatusColor = () => {
    switch (log.status) {
      case 'enviado':
        return 'success';
      case 'erro':
        return 'error';
      case 'pendente':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getCanalIcon = () => {
    switch (log.canal) {
      case 'whatsapp':
        return <MessageSquare size={20} />;
      case 'email':
        return <Mail size={20} />;
      default:
        return <Send size={20} />;
    }
  };

  const getCanalLabel = () => {
    switch (log.canal) {
      case 'whatsapp':
        return 'WhatsApp';
      case 'email':
        return 'E-mail';
      case 'sms':
        return 'SMS';
      default:
        return log.canal;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          mb: 3,
          background: 'linear-gradient(135deg, #ffbe44ff, #ef9b00ff)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getCanalIcon()}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Detalhes da Comunicação
          </Typography>
        </Box>
        <Button onClick={onClose} sx={{ color: 'white', minWidth: 'auto', p: 0.5 }}>
          <X size={20} />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Informações Principais */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={getCanalIcon()}
              label={getCanalLabel()}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={getStatusIcon()}
              label={log.status.toUpperCase()}
              color={getStatusColor()}
            />
            <Chip
              label={log.event_type || 'N/A'}
              variant="outlined"
            />
          </Box>

          <Divider />

          {/* Data e Hora + Destinatário */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary">
                Data/Hora
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary">
                Destinatário
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {log.destinatario}
              </Typography>
            </Box>
          </Box>

          {/* Assunto (apenas para email) */}
          {log.assunto && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Assunto
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {log.assunto}
              </Typography>
            </Box>
          )}

          {/* Conteúdo */}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Conteúdo da Mensagem
            </Typography>
            <Box
              sx={{
                mt: 1,
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                maxHeight: 300,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {log.conteudo}
              </Typography>
            </Box>
          </Box>

          {/* External ID */}
          {log.external_id && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                ID Externo
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {log.external_id}
              </Typography>
            </Box>
          )}

          {/* Metadata */}
          {log.metadata && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Metadata (JSON)
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                <pre style={{ margin: 0, fontSize: '12px' }}>
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
