import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  month: string;
  unidades: number;
  franqueados: number;
}

interface PerformanceChartProps {
  data: ChartData[];
  loading?: boolean;
}

const PerformanceChart = ({ data, loading = false }: PerformanceChartProps) => {
  if (loading) {
    return (
      <Card sx={{ height: '400px' }}>
        <CardContent sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Crescimento Mensal
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
              {entry.dataKey === 'unidades' ? 'Unidades' : 'Franqueados'}: {entry.value}
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
            Crescimento Mensal
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, backgroundColor: '#1976d2', borderRadius: 1 }} />
              <Typography variant="body2" color="text.secondary">Unidades</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, backgroundColor: '#9c27b0', borderRadius: 1 }} />
              <Typography variant="body2" color="text.secondary">Franqueados</Typography>
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
                fill="#1976d2" 
                radius={[4, 4, 0, 0]}
                name="Unidades"
              />
              <Bar 
                dataKey="franqueados" 
                fill="#9c27b0" 
                radius={[4, 4, 0, 0]}
                name="Franqueados"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;