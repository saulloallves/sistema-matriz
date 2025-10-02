import { useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import UnidadesPorModeloModal from '../modals/UnidadesPorModeloModal';

interface ChartData {
  month: string; // Representa o modelo da loja
  unidades: number; // Representa a quantidade
  franqueados: number; // Não usado neste contexto
}

interface PerformanceChartProps {
  data: ChartData[];
  loading?: boolean;
}

const PerformanceChart = ({ data, loading = false }: PerformanceChartProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleBarClick = (entry: any) => {
    if (entry && entry.month) {
      setSelectedModelo(entry.month);
      setModalOpen(true);
    }
  };

  if (loading) {
    return (
      <Card sx={{ height: '400px' }}>
        <CardContent sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Distribuição por Modelo de Loja
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            backgroundColor: '#f5f5f5',
            borderRadius: 2 
          }}>
            <Typography color="text.secondary">
              Carregando dados do gráfico...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          backgroundColor: 'background.paper',
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography 
              key={index}
              variant="body2" 
              sx={{ color: entry.color, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Box sx={{ 
                width: 8, 
                height: 8, 
                backgroundColor: entry.color, 
                borderRadius: '50%' 
              }} />
              Quantidade: {entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '400px' }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Distribuição por Modelo de Loja
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, backgroundColor: '#1976d2', borderRadius: 1 }} />
              <Typography variant="body2" color="text.secondary">Quantidade</Typography>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ flex: 1, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="unidades" 
                radius={[4, 4, 0, 0]}
                name="Quantidade"
                cursor="pointer"
                onClick={(data) => handleBarClick(data)}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={hoveredIndex === index ? '#f59e42' : '#1976d2'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>

      <UnidadesPorModeloModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        modelo={selectedModelo}
      />
    </Card>
  );
};

export default PerformanceChart;