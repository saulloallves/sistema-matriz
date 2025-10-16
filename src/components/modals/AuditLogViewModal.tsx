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
  Paper,
  useTheme,
} from '@mui/material';
import { X, User, Clock, Database, Edit, ArrowRight } from 'lucide-react';
import { AuditLog } from '@/hooks/useAuditLogs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLogViewModalProps {
  open: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

const DataField = ({ field, oldValue, newValue, isChanged }: { field: string; oldValue: any; newValue: any; isChanged: boolean }) => {
  const theme = useTheme();
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return <Typography color="text.secondary" component="em">Nulo</Typography>;
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (typeof value === 'object') return <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(value, null, 2)}</pre>;
    return String(value);
  };

  return (
    <Box sx={{ 
      p: 1.5, 
      backgroundColor: isChanged ? theme.palette.warning.light : 'transparent',
      border: `1px solid ${isChanged ? theme.palette.warning.light : theme.palette.divider}`,
      borderRadius: 1,
      mb: 1
    }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
        {field}
      </Typography>
      {isChanged ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1, opacity: 0.7 }}>{formatValue(oldValue)}</Box>
          <ArrowRight size={16} color={theme.palette.warning.dark} />
          <Box sx={{ flex: 1, fontWeight: 'bold' }}>{formatValue(newValue)}</Box>
        </Box>
      ) : (
        <Box>{formatValue(newValue)}</Box>
      )}
    </Box>
  );
};

export const AuditLogViewModal = ({ open, onClose, log }: AuditLogViewModalProps) => {
  if (!log) return null;

  const oldData = typeof log.old_record_data === 'object' && log.old_record_data !== null ? log.old_record_data : {};
  const newData = typeof log.new_record_data === 'object' && log.new_record_data !== null ? log.new_record_data : {};
  const allKeys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]));

  const getActionChip = () => {
    switch (log.action) {
      case 'INSERT':
        return <Chip label="Criação" color="success" size="small" />;
      case 'UPDATE':
        return <Chip label="Atualização" color="warning" size="small" />;
      case 'DELETE':
        return <Chip label="Exclusão" color="error" size="small" />;
      default:
        return <Chip label={log.action} size="small" />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Detalhes da Auditoria</Typography>
        <IconButton onClick={onClose}><X size={20} /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <User size={18} />
              <Box>
                <Typography variant="caption" color="text.secondary">Usuário</Typography>
                <Typography>{log.user_full_name || 'Sistema'}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Clock size={18} />
              <Box>
                <Typography variant="caption" color="text.secondary">Data e Hora</Typography>
                <Typography>{format(new Date(log.timestamp), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Database size={18} />
              <Box>
                <Typography variant="caption" color="text.secondary">Módulo</Typography>
                <Typography>{log.table_name}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Edit size={18} />
              <Box>
                <Typography variant="caption" color="text.secondary">Ação</Typography>
                <Box>{getActionChip()}</Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Dados Anteriores</Typography>
            <Paper variant="outlined" sx={{ p: 2, minHeight: '300px', backgroundColor: 'grey.50' }}>
              {log.action !== 'INSERT' ? allKeys.map(key => {
                const isChanged = JSON.stringify(oldData[key]) !== JSON.stringify(newData[key]);
                const isRemoved = newData[key] === undefined;
                if (oldData[key] !== undefined) {
                  return <DataField key={key} field={key} oldValue={oldData[key]} newValue={newData[key]} isChanged={isChanged || isRemoved} />;
                }
                return null;
              }) : <Typography color="text.secondary">N/A (Registro novo)</Typography>}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Novos Dados</Typography>
            <Paper variant="outlined" sx={{ p: 2, minHeight: '300px', backgroundColor: 'grey.50' }}>
              {log.action !== 'DELETE' ? allKeys.map(key => {
                const isChanged = JSON.stringify(oldData[key]) !== JSON.stringify(newData[key]);
                const isAdded = oldData[key] === undefined;
                if (newData[key] !== undefined) {
                  return <DataField key={key} field={key} oldValue={oldData[key]} newValue={newData[key]} isChanged={isChanged || isAdded} />;
                }
                return null;
              }) : <Typography color="text.secondary">N/A (Registro excluído)</Typography>}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};