import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { useGeographicalDistribution } from '../../hooks/useDashboardStats';
import { Building } from 'lucide-react';

const GeographicalDistributionChart = () => {
  const { data: distribution, isLoading } = useGeographicalDistribution();

  if (isLoading) {
    return (
      <Card sx={{ height: '400px' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Distribuição Geográfica
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#f5f5f5', borderRadius: 2 }}>
            <Typography color="text.secondary">Carregando dados...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Get top 5 states
  const topData = (distribution || []).slice(0, 5);

  return (
    <Card sx={{ height: '400px' }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Distribuição Geográfica
        </Typography>
        
        {topData.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            color: 'text.secondary'
          }}>
            <Building size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <Typography variant="body2">
              Nenhum dado geográfico disponível
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, width: '100%', mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="state" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  width={40}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(227, 160, 36, 0.1)' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#E3A024" barSize={20} radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="count" position="right" style={{ fill: '#333', fontSize: 12 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default GeographicalDistributionChart;