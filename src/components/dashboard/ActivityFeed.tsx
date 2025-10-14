import { Card, CardContent, Typography, Box, Avatar, Chip } from '@mui/material';
import { User, Building, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Activity {
  id: string;
  type: 'franqueado' | 'unidade' | 'sistema' | 'performance';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'info';
}

interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
}

const ActivityFeed = ({ activities, loading = false }: ActivityFeedProps) => {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'franqueado':
        return User;
      case 'unidade':
        return Building;
      case 'performance':
        return TrendingUp;
      default:
        return AlertCircle;
    }
  };

  const getColor = (status: Activity['status']) => {
    switch (status) {
      case 'success':
        return '#2e7d32';
      case 'warning':
        return '#ed6c02';
      case 'info':
        return '#E3A024';
      default:
        return '#666666';
    }
  };

  if (loading) {
    return (
      <Card sx={{ height: '400px' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Atividades Recentes
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                <Box sx={{ width: 40, height: 40, backgroundColor: '#ddd', borderRadius: '50%' }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ width: '60%', height: 16, backgroundColor: '#ddd', borderRadius: 1, mb: 1 }} />
                  <Box sx={{ width: '80%', height: 12, backgroundColor: '#eee', borderRadius: 1 }} />
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '400px', overflow: 'hidden' }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Atividades Recentes
        </Typography>
        
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          mt: 2,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: 3,
          },
        }}>
          {activities.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary'
            }}>
              <AlertCircle size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
              <Typography variant="body2">
                Nenhuma atividade recente
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activities.map((activity) => {
                const IconComponent = getIcon(activity.type);
                const color = getColor(activity.status);
                
                return (
                  <Box
                    key={activity.id}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      p: 2,
                      mr: 1,
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: `${color}15`,
                      }}
                    >
                      <IconComponent size={20} style={{ color }} />
                    </Avatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ fontWeight: 600, color: 'text.primary' }}
                        noWrap
                      >
                        {activity.title}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.3,
                          mt: 0.5
                        }}
                      >
                        {activity.description}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ display: 'block', mt: 1 }}
                      >
                        {format(activity.timestamp, "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </Typography>
                    </Box>

                    {activity.status && (
                      <Chip
                        size="small"
                        label={activity.status === 'success' ? 'Sucesso' : 
                               activity.status === 'warning' ? 'Atenção' : 'Info'}
                        sx={{
                          backgroundColor: `${color}15`,
                          color: color,
                          height: 24,
                          fontSize: '0.75rem'
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;