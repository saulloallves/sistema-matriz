import { Card, CardContent, Box, Typography, LinearProgress } from '@mui/material';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  percentage?: number;
  loading?: boolean;
  suffix?: string;
}

const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  percentage, 
  loading = false,
  suffix = ''
}: KPICardProps) => {
  return (
    <Card 
      sx={{ 
        height: '140px',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }
      }}
    >
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ fontSize: '0.875rem', fontWeight: 500 }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                fontSize: '2rem',
                color: 'text.primary',
                mt: 0.5 
              }}
            >
              {loading ? '-' : typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '12px',
              backgroundColor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={28} style={{ color }} />
          </Box>
        </Box>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: trend.isPositive ? 'success.main' : 'error.main',
                fontWeight: 600 
              }}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              vs mês anterior
            </Typography>
          </Box>
        )}

        {percentage !== undefined && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={percentage} 
              sx={{ 
                height: 6,
                borderRadius: 3,
                backgroundColor: `${color}20`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                  borderRadius: 3,
                }
              }} 
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;