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

  const handleBarClick = (modelo: string) => {
    console.log('Clicou no modelo:', modelo);
    setSelectedModelo(modelo);
    setModalOpen(true);
  };

  // Componente customizado para a barra clicável
  const CustomBar = (props: any) => {
    const { fill, x, y, width, height, payload } = props;
    
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={4}
        ry={4}
        cursor="pointer"
        onClick={() => handleBarClick(payload.month)}
        onMouseEnter={() => setHoveredIndex(props.index)}
        onMouseLeave={() => setHoveredIndex(null)}
      />
    );
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
              <Box sx={{ width: 12, height: 12, backgroundColor: '#E3A024', borderRadius: 1 }} />
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
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245, 158, 66, 0.1)' }} />
              <Bar 
                dataKey="unidades" 
                name="Quantidade"
                shape={(props: any) => (
                  <CustomBar 
                    {...props} 
                    fill={hoveredIndex === props.index ? '#f59e42' : '#E3A024'}
                  />
                )}
              />
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