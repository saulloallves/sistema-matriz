import { Box, Grid, Stack } from '@mui/material';
import {
  Store,
  Users,
  Target,
  Building,
} from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import TopUnitsPerformance from '../components/dashboard/TopUnitsPerformance';
import FinancialMetrics from '../components/dashboard/FinancialMetrics';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { 
  useDashboardStats, 
  useUnidadesDistribution, 
  useRecentActivity, 
  useTopUnits 
} from '../hooks/useDashboardStats';

const DashboardPage = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: chartData, isLoading: chartLoading } = useUnidadesDistribution();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity();
  const { data: topUnits, isLoading: unitsLoading } = useTopUnits();

  return (
    <Box sx={{ p: 3 }}>
      {/* Novo Cabeçalho com Saudação e Acesso Rápido */}
      <DashboardHeader />

      {/* KPI Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 3, 
        mb: 4 
      }}>
        <KPICard
          title="Total de Unidades"
          value={stats?.totalUnidades || 0}
          icon={Store}
          color="#E3A024"
          loading={statsLoading}
          trend={stats?.totalUnidades ? { value: 12.5, isPositive: true } : undefined}
        />
        <KPICard
          title="Franqueados"
          value={stats?.totalFranqueados || 0}
          icon={Users}
          color="#9c27b0"
          loading={statsLoading}
          trend={stats?.totalFranqueados ? { value: 8.2, isPositive: true } : undefined}
        />
        <KPICard
          title="Franqueados com Unidades"
          value={stats?.unidadesAtivas || 0}
          icon={Building}
          color="#2e7d32"
          loading={statsLoading}
          percentage={stats?.totalFranqueados && stats?.unidadesAtivas ? 
            Math.round((stats.unidadesAtivas / stats.totalFranqueados) * 100) : 0}
        />
        <KPICard
          title="Taxa de Vinculação"
          value={stats?.taxaConversao || 0}
          suffix="%"
          icon={Target}
          color="#ed6c02"
          loading={statsLoading}
          trend={stats?.taxaConversao ? { value: 5.1, isPositive: true } : undefined}
        />
      </Box>

      {/* Novo Layout em Grid */}
      <Grid container spacing={3}>
        {/* Coluna da Esquerda */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            <PerformanceChart 
              data={chartData || []} 
              loading={chartLoading} 
            />
            <TopUnitsPerformance 
              units={topUnits || []} 
              loading={unitsLoading} 
            />
          </Stack>
        </Grid>

        {/* Coluna da Direita */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            <FinancialMetrics />
            <ActivityFeed 
              activities={activities || []} 
              loading={activitiesLoading} 
            />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;