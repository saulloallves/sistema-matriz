import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Breadcrumbs,
} from '@mui/material';
import { X, MapPin, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GeolocationData } from '../../hooks/useDashboardStats';
import { getRegiaoPorUF } from '../../utils/brazilRegions';

interface GeolocationDetailModalProps {
  open: boolean;
  onClose: () => void;
  estadoData: GeolocationData | null;
}

// Cores para o gráfico de cidades
const CITY_COLORS = ['#E3A024', '#2196f3', '#4caf50', '#9c27b0', '#ff9800', '#e91e63'];

const GeolocationDetailModal = ({ open, onClose, estadoData }: GeolocationDetailModalProps) => {
  if (!estadoData) return null;

  // Preparar dados para o gráfico de cidades (top 6)
  const cityChartData = estadoData.cidades.slice(0, 6).map((cidade, index) => ({
    name: cidade.cidade.length > 15 ? cidade.cidade.substring(0, 15) + '...' : cidade.cidade,
    fullName: cidade.cidade,
    value: cidade.quantidade,
    color: CITY_COLORS[index % CITY_COLORS.length],
  }));

  // Todas as unidades do estado
  const todasUnidades = estadoData.cidades.flatMap(cidade => cidade.unidades);

  // Calcular estatísticas
  const totalCidades = estadoData.cidades.length;
  const totalUnidades = estadoData.quantidade;
  const unidadesAtivas = todasUnidades.filter(u => u.is_active).length;

  // Agrupar por fase
  const porFase = todasUnidades.reduce((acc, u) => {
    acc[u.store_phase] = (acc[u.store_phase] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Agrupar por modelo
  const porModelo = todasUnidades.reduce((acc, u) => {
    acc[u.store_model] = (acc[u.store_model] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{
          backgroundColor: 'background.paper',
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {data.fullName}
          </Typography>
          <Typography variant="body2" sx={{ color: data.color }}>
            {data.value} {data.value === 1 ? 'unidade' : 'unidades'}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Função para obter cor da fase
  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      'implantacao': '#2196f3',
      'operacao': '#4caf50',
      'expansao': '#E3A024',
      'reforma': '#ff9800',
    };
    return colors[phase.toLowerCase()] || '#757575';
  };

  // Função para obter cor do modelo
  const getModelColor = (model: string) => {
    const colors: Record<string, string> = {
      'express': '#2196f3',
      'smart': '#4caf50',
      'complete': '#E3A024',
      'premium': '#9c27b0',
    };
    return colors[model.toLowerCase()] || '#757575';
  };

  // Obter região do estado
  const regiao = getRegiaoPorUF(estadoData.uf);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      TransitionProps={{
        timeout: 400,
      }}
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh',
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 1,
        pb: 1,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        {/* Header com botão fechar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MapPin size={30} color="#E3A024" />
            <Box>
              <Typography variant="h6">
                {estadoData.estado} ({estadoData.uf})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {totalUnidades} unidades em {totalCidades} {totalCidades === 1 ? 'cidade' : 'cidades'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={25} />
          </IconButton>
        </Box>

        {/* Breadcrumb */}
        {regiao && (
          <Breadcrumbs sx={{ pl: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Todas as Regiões
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {regiao}
            </Typography>
            <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>
              {estadoData.estado}
            </Typography>
          </Breadcrumbs>
        )}
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Cards de Estatísticas */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 2, 
          mb: 3 
        }}>
          <Paper sx={{ 
            p: 2,
            mt: 3, 
            borderLeft: '4px solid #E3A024',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(227, 160, 36, 0.2)',
            }
          }}>
            <Typography variant="caption" color="text.secondary">Total de Unidades</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{totalUnidades}</Typography>
          </Paper>
          <Paper sx={{ 
            p: 2,
            mt: 3, 
            borderLeft: '4px solid #4caf50',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
            }
          }}>
            <Typography variant="caption" color="text.secondary">Unidades Ativas</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{unidadesAtivas}</Typography>
          </Paper>
          <Paper sx={{ 
            p: 2,
            mt: 3, 
            borderLeft: '4px solid #2196f3',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
            }
          }}>
            <Typography variant="caption" color="text.secondary">Cidades</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{totalCidades}</Typography>
          </Paper>
        </Box>

        {/* Gráfico de Distribuição por Cidade */}
        <Paper sx={{ 
          p: 2, 
          mb: 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Building2 size={20} />
            Top {cityChartData.length} Cidades
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cityChartData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(227, 160, 36, 0.1)' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {cityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Lista de Todas as Unidades */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Todas as Unidades ({totalUnidades})
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Unidade</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cidade</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Modelo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fase</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Endereço</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {todasUnidades.map((unidade) => (
                <TableRow 
                  key={unidade.id} 
                  hover
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(227, 160, 36, 0.08)',
                    }
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {unidade.group_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        #{unidade.group_code}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{unidade.city}</TableCell>
                  <TableCell>
                    <Chip 
                      label={unidade.store_model} 
                      size="small"
                      sx={{ 
                        backgroundColor: getModelColor(unidade.store_model),
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.7rem'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={unidade.store_phase} 
                      size="small"
                      sx={{ 
                        backgroundColor: getPhaseColor(unidade.store_phase),
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.7rem'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ maxWidth: 200, display: 'block' }}>
                      {unidade.address}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={unidade.is_active ? 'Ativa' : 'Inativa'} 
                      size="small"
                      color={unidade.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default GeolocationDetailModal;
