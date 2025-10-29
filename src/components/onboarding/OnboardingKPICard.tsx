import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { LucideIcon } from 'lucide-react';

interface OnboardingKPICardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: string;
  subtitle?: string;
  loading?: boolean;
}

/**
 * Card de KPI para o dashboard de onboarding
 * Exibe uma métrica principal com ícone colorido
 * Layout consistente com FranqueadosPage e UnidadesPage
 */
const OnboardingKPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = '#3b82f6',
  subtitle,
  loading = false 
}: OnboardingKPICardProps) => {
  return (
    <Card 
      sx={{ 
        height: '100px',
        background: 'background.paper',
        border: `1px solid ${color}20`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 20px ${color}15`,
          border: `1px solid ${color}40`
        }
      }}
    >
      <CardContent sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 3,
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '12px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: color
          }}
        >
          <Icon size={24} />
        </Box>
        <Box sx={{ flex: 1 }}>
          {loading ? (
            <>
              <Skeleton width={80} height={32} sx={{ mb: 0.5 }} />
              <Skeleton width={120} height={20} />
            </>
          ) : (
            <>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: color, 
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: '1.75rem'
                }}
              >
                {value.toLocaleString('pt-BR')}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 0.5, 
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </>
          )}
        </Box>
        {/* Elemento decorativo moderno no lado direito */}
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: color,
            borderRadius: '0 12px 12px 0',
            opacity: 0.8
          }}
        />
      </CardContent>
    </Card>
  );
};

export default OnboardingKPICard;
