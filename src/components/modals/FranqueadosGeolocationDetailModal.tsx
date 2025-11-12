import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Breadcrumbs } from '@mui/material';
import { X, MapPin, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FranqueadoGeolocationData } from '@/hooks/useFranqueadosGeolocation';
import { getRegiaoPorUF } from '@/utils/brazilRegions';

interface FranqueadosGeolocationDetailModalProps {
  open: boolean;
  onClose: () => void;
  estadoData: FranqueadoGeolocationData | null;
}

const CITY_COLORS = ['#E3A024', '#2196f3', '#4caf50', '#9c27b0', '#ff9800', '#e91e63'];

const FranqueadosGeolocationDetailModal = ({ open, onClose, estadoData }: FranqueadosGeolocationDetailModalProps) => {
  if (!estadoData) return null;

  const cityChartData = estadoData.cidades.slice(0, 6).map((cidade, index) => ({
    name: cidade.cidade.length > 15 ? cidade.cidade.substring(0, 15) + '...' : cidade.cidade,
    fullName: cidade.cidade,
    value: cidade.quantidade,
    color: CITY_COLORS[index % CITY_COLORS.length],
  }));

  const todosFranqueados = estadoData.cidades.flatMap(c => c.franqueados);
  const totalFranqueados = estadoData.quantidade;
  const totalCidades = estadoData.cidades.length;
  const franqueadosEmContrato = todosFranqueados.filter(f => f.is_in_contract).length;

  // Agrupar por tipo
  const porTipo = todosFranqueados.reduce((acc, f) => {
    const tipo = (f.owner_type || 'Não informado');
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Tooltip customizado
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ backgroundColor: 'background.paper', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{data.fullName}</Typography>
          <Typography variant="body2" sx={{ color: data.color }}>{data.value} {data.value === 1 ? 'franqueado' : 'franqueados'}</Typography>
        </Box>
      );
    }
    return null;
  };

  const regiao = getRegiaoPorUF(estadoData.uf);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MapPin size={30} color="#E3A024" />
            <Box>
              <Typography variant="h6">{estadoData.estado} ({estadoData.uf})</Typography>
              <Typography variant="body2" color="text.secondary">{totalFranqueados} franqueados em {totalCidades} {totalCidades === 1 ? 'cidade' : 'cidades'}</Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small"><X size={25} /></IconButton>
        </Box>
        {regiao && (
          <Breadcrumbs sx={{ pl: 4 }}>
            <Typography variant="caption" color="text.secondary">Todas as Regiões</Typography>
            <Typography variant="caption" color="text.secondary">{regiao}</Typography>
            <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>{estadoData.estado}</Typography>
          </Breadcrumbs>
        )}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
          <Paper sx={{ p: 2, mt: 3, borderLeft: '4px solid #E3A024' }}>
            <Typography variant="caption" color="text.secondary">Total de Franqueados</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{totalFranqueados}</Typography>
          </Paper>
          <Paper sx={{ p: 2, mt: 3, borderLeft: '4px solid #4caf50' }}>
            <Typography variant="caption" color="text.secondary">Com Contrato</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{franqueadosEmContrato}</Typography>
          </Paper>
          <Paper sx={{ p: 2, mt: 3, borderLeft: '4px solid #2196f3' }}>
            <Typography variant="caption" color="text.secondary">Cidades</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{totalCidades}</Typography>
          </Paper>
        </Box>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Users size={20} /> Top {cityChartData.length} Cidades
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cityChartData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(227, 160, 36, 0.1)' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {cityChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Todos os Franqueados ({totalFranqueados})</Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cidade</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contrato</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Endereço</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {todosFranqueados.map(f => (
                <TableRow key={f.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{f.full_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{f.uf}</Typography>
                  </TableCell>
                  <TableCell>{f.city || '-'}</TableCell>
                  <TableCell>
                    <Chip label={f.owner_type || 'N/I'} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip label={f.is_in_contract ? 'Sim' : 'Não'} size="small" color={f.is_in_contract ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ maxWidth: 220, display: 'block' }}>{f.address || 'Endereço não informado'}</Typography>
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

export default FranqueadosGeolocationDetailModal;
