import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  Store,
  User,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUnidades: number;
  totalFranqueados: number;
  unidadesAtivas: number;
  franqueadosComUnidades: number;
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUnidades: 0,
    totalFranqueados: 0,
    unidadesAtivas: 0,
    franqueadosComUnidades: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      const [unidadesResponse, franqueadosResponse] = await Promise.all([
        supabase.from('unidades').select('*'),
        supabase.from('franqueados').select('*'),
      ]);

      if (unidadesResponse.error) throw unidadesResponse.error;
      if (franqueadosResponse.error) throw franqueadosResponse.error;

      const unidades = unidadesResponse.data || [];
      const franqueados = franqueadosResponse.data || [];

      const unidadesAtivas = unidades.filter(u => u.purchases_active || u.sales_active).length;

      setStats({
        totalUnidades: unidades.length,
        totalFranqueados: franqueados.length,
        unidadesAtivas,
        franqueadosComUnidades: franqueados.length,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    percentage 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    color: string;
    percentage?: number;
  }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {loading ? '-' : value.toLocaleString()}
            </Typography>
            {percentage !== undefined && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {percentage}% do total
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={percentage} 
                  sx={{ 
                    mt: 0.5,
                    backgroundColor: `${color}20`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: color,
                    }
                  }} 
                />
              </Box>
            )}
          </Box>
          <Icon size={40} style={{ color, opacity: 0.7 }} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Visão geral do sistema de gerenciamento
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <StatCard
          title="Total de Unidades"
          value={stats.totalUnidades}
          icon={Store}
          color="#1976d2"
          percentage={100}
        />
        
          <StatCard
            title="Total de Franqueados"
            value={stats.totalFranqueados}
            icon={User}
            color="#9c27b0"
            percentage={100}
          />
        
        <StatCard
          title="Unidades Ativas"
          value={stats.unidadesAtivas}
          icon={TrendingUp}
          color="#2e7d32"
          percentage={stats.totalUnidades > 0 ? Math.round((stats.unidadesAtivas / stats.totalUnidades) * 100) : 0}
        />
        
          <StatCard
            title="Relacionamentos"
            value={stats.franqueadosComUnidades}
            icon={BarChart3}
            color="#ed6c02"
            percentage={stats.totalFranqueados > 0 ? Math.round((stats.franqueadosComUnidades / stats.totalFranqueados) * 100) : 0}
          />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resumo Operacional
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Sistema integrado com Supabase<br/>
              • Gerenciamento completo de unidades e franqueados<br/>
              • Interface responsiva com Material-UI<br/>
              • Validações de dados em tempo real
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Próximas Funcionalidades
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Relatórios avançados<br/>
              • Gráficos de performance<br/>
              • Exportação de dados<br/>
              • Sistema de notificações
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPage;