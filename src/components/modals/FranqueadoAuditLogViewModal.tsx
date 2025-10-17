import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  Grid,
} from '@mui/material';
import { X, User, Clock, Edit, Fingerprint, Monitor, FileText } from 'lucide-react';
import { FranqueadoAuditLog } from '@/hooks/useFranqueadosAuditLogs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FranqueadoAuditLogViewModalProps {
  open: boolean;
  onClose: () => void;
  log: FranqueadoAuditLog | null;
}

export const FranqueadoAuditLogViewModal = ({ open, onClose, log }: FranqueadoAuditLogViewModalProps) => {
  if (!log) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Detalhes do Log de Ação</Typography>
        <IconButton onClick={onClose}><X size={20} /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <User size={18} />
              <Box>
                <Typography variant="caption" color="text.secondary">Usuário</Typography>
                <Typography>{log.user_full_name || 'Sistema'}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Clock size={18} />
              <Box>
                <Typography variant="caption" color="text.secondary">Data e Hora</Typography>
                <Typography>{format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Edit size={18} />
              <Box>
                <Typography variant="caption" color="text.secondary">Ação Realizada</Typography>
                <Typography variant="body1" fontWeight="medium">{log.action}</Typography>
              </Box>
            </Box>
          </Grid>
          {log.franqueado_id && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <User size={18} />
                <Box>
                  <Typography variant="caption" color="text.secondary">ID do Franqueado</Typography>
                  <Typography>{log.franqueado_id}</Typography>
                </Box>
              </Box>
            </Grid>
          )}
          {log.accessed_fields && log.accessed_fields.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <FileText size={18} style={{ marginTop: '4px' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Campos Acessados/Modificados</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                    {log.accessed_fields.map((field, index) => (
                      <Chip key={index} label={field} size="small" />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Grid>
          )}
          {log.ip_address && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Fingerprint size={18} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Endereço IP</Typography>
                  <Typography>{log.ip_address}</Typography>
                </Box>
              </Box>
            </Grid>
          )}
          {log.user_agent && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Monitor size={18} />
                <Box>
                  <Typography variant="caption" color="text.secondary">User Agent</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{log.user_agent}</Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};