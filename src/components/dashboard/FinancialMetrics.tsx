import { Card, CardContent, Typography, Box } from '@mui/material';
import { DollarSign, Percent, TrendingUp, Users } from 'lucide-react';
import { useFinancialMetrics } from '../../hooks/useFinancialMetrics';

const FinancialMetrics = () => {
  const { data: metrics, isLoading } = useFinancialMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Métricas Financeiras
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, height: 80 }}>
                <Box sx={{ width: '70%', height: 16, backgroundColor: '#ddd', borderRadius: 1, mb: 1 }} />
                <Box sx={{ width: '50%', height: 20, backgroundColor: '#ddd', borderRadius: 1 }} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Métricas Financeiras (Pró-labore)
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 2, 
          mt: 1 
        }}>
          <Box sx={{ 
            p: 2, 
            backgroundColor: '#e3f2fd', 
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <DollarSign size={20} style={{ color: '#1976d2' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
              R$ {metrics?.totalProlabore.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Mensal
            </Typography>
          </Box>

          <Box sx={{ 
            p: 2, 
            backgroundColor: '#f3e5f5', 
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <TrendingUp size={20} style={{ color: '#9c27b0' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#9c27b0' }}>
              R$ {metrics?.averageProlabore.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Média por Franqueado
            </Typography>
          </Box>

          <Box sx={{ 
            p: 2, 
            backgroundColor: '#e8f5e8', 
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Users size={20} style={{ color: '#2e7d32' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
              {metrics?.franqueadosWithProlabore || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Recebem Pró-labore
            </Typography>
          </Box>

          <Box sx={{ 
            p: 2, 
            backgroundColor: '#fff3e0', 
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Percent size={20} style={{ color: '#ed6c02' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#ed6c02' }}>
              {metrics?.percentageWithProlabore || 0}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Taxa de Pró-labore
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FinancialMetrics;