import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  IconButton, 
  Box, 
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Unidade {
  id: string;
  group_name: string;
  group_code: number;
  city: string | null;
  state: string | null;
  store_phase: string;
  is_active: boolean;
}

interface UnidadesPorModeloModalProps {
  open: boolean;
  onClose: () => void;
  modelo: string | null;
}

const UnidadesPorModeloModal = ({ open, onClose, modelo }: UnidadesPorModeloModalProps) => {
  const { data: unidades, isLoading } = useQuery({
    queryKey: ['unidades-por-modelo', modelo],
    queryFn: async (): Promise<Unidade[]> => {
      if (!modelo) return [];
      
      const { data, error } = await supabase
        .from('unidades')
        .select('id, group_name, group_code, city, state, store_phase, is_active')
        .eq('store_model', modelo)
        .order('group_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!modelo && open,
  });

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      'implantacao': '#ff9800',
      'operacao': '#4caf50',
      'pre_operacao': '#2196f3',
      'standby': '#9e9e9e',
    };
    return colors[phase] || '#9e9e9e';
  };

  const getPhaseLabel = (phase: string) => {
    const labels: Record<string, string> = {
      'implantacao': 'Implantação',
      'operacao': 'Operação',
      'pre_operacao': 'Pré-Operação',
      'standby': 'Standby',
    };
    return labels[phase] || phase;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '80vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2,
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Unidades - {modelo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unidades?.length || 0} {unidades?.length === 1 ? 'unidade encontrada' : 'unidades encontradas'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 300,
          }}>
            <CircularProgress />
          </Box>
        ) : unidades && unidades.length > 0 ? (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Nome da Unidade</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Localização</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fase</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unidades.map((unidade) => (
                  <TableRow 
                    key={unidade.id}
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer',
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        #{unidade.group_code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {unidade.group_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {unidade.city && unidade.state 
                          ? `${unidade.city} - ${unidade.state}`
                          : 'Não informado'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getPhaseLabel(unidade.store_phase)}
                        size="small"
                        sx={{ 
                          backgroundColor: getPhaseColor(unidade.store_phase),
                          color: '#fff',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={unidade.is_active ? 'Ativa' : 'Inativa'}
                        size="small"
                        color={unidade.is_active ? 'success' : 'default'}
                        sx={{ fontWeight: 500, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 300,
          }}>
            <Typography color="text.secondary">
              Nenhuma unidade encontrada para este modelo
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UnidadesPorModeloModal;
