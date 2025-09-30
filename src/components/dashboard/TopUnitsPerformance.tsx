import { Card, CardContent, Typography, Box, Chip, Avatar } from '@mui/material';
import { Building, MapPin, TrendingUp, TrendingDown } from 'lucide-react';

interface UnitPerformance {
  id: string;
  name: string;
  city: string;
  state: string;
  model: string;
  phase: string;
  isActive: boolean;
  trend: 'up' | 'down' | 'stable';
  score: number;
}

interface TopUnitsPerformanceProps {
  units: UnitPerformance[];
  loading?: boolean;
}

const TopUnitsPerformance = ({ units, loading = false }: TopUnitsPerformanceProps) => {
  if (loading) {
    return (
      <Card sx={{ height: '300px' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Performance das Unidades
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2, mt: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, height: 80 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, backgroundColor: '#ddd', borderRadius: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ width: '70%', height: 16, backgroundColor: '#ddd', borderRadius: 1, mb: 1 }} />
                    <Box sx={{ width: '50%', height: 12, backgroundColor: '#eee', borderRadius: 1 }} />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  const getPhaseColor = (phase: string) => {
    switch (phase.toLowerCase()) {
      case 'operacao':
        return '#2e7d32';
      case 'implantacao':
        return '#ed6c02';
      default:
        return '#666666';
    }
  };

  const getModelColor = (model: string) => {
    switch (model.toLowerCase()) {
      case 'padrao':
        return '#1976d2';
      case 'intermediaria':
        return '#9c27b0';
      case 'light':
        return '#00acc1';
      default:
        return '#757575';
    }
  };

  return (
    <Card sx={{ minHeight: '300px' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Performance das Unidades
        </Typography>
        
        {units.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '200px',
            color: 'text.secondary'
          }}>
            <Building size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <Typography variant="body2">
              Nenhuma unidade encontrada
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: 2, 
            mt: 2 
          }}>
            {units.slice(0, 4).map((unit) => (
              <Box
                key={unit.id}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundColor: `${getModelColor(unit.model)}15`,
                      color: getModelColor(unit.model),
                    }}
                  >
                    <Building size={24} />
                  </Avatar>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ fontWeight: 600, color: 'text.primary' }}
                        noWrap
                      >
                        {unit.name}
                      </Typography>
                      {unit.trend === 'up' && (
                        <TrendingUp size={16} style={{ color: '#2e7d32' }} />
                      )}
                      {unit.trend === 'down' && (
                        <TrendingDown size={16} style={{ color: '#d32f2f' }} />
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <MapPin size={14} style={{ color: '#666' }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        noWrap
                      >
                        {unit.city}, {unit.state}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        label={unit.model}
                        sx={{
                          backgroundColor: `${getModelColor(unit.model)}15`,
                          color: getModelColor(unit.model),
                          fontSize: '0.75rem',
                          height: 24,
                        }}
                      />
                      <Chip
                        size="small"
                        label={unit.phase}
                        sx={{
                          backgroundColor: `${getPhaseColor(unit.phase)}15`,
                          color: getPhaseColor(unit.phase),
                          fontSize: '0.75rem',
                          height: 24,
                        }}
                      />
                      {unit.isActive && (
                        <Chip
                          size="small"
                          label="Ativa"
                          sx={{
                            backgroundColor: '#2e7d3215',
                            color: '#2e7d32',
                            fontSize: '0.75rem',
                            height: 24,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TopUnitsPerformance;