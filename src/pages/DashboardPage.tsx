import { Box, Typography } from '@mui/material';
import {
  Store,
  Users,
  TrendingUp,
  Target,
} from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import TopUnitsPerformance from '../components/dashboard/TopUnitsPerformance';
import { 
  useDashboardStats, 
  useChartData, 
  useRecentActivity, 
  useTopUnits 
} from '../hooks/useDashboardStats';

const DashboardPage = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: chartData, isLoading: chartLoading } = useChartData();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity();
  const { data: topUnits, isLoading: unitsLoading } = useTopUnits();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ fontWeight: 700, color: 'text.primary' }}
        >
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visão geral em tempo real do seu negócio
        </Typography>
      </Box>

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
          color="#1976d2"
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
          title="Unidades Ativas"
          value={stats?.unidadesAtivas || 0}
          icon={TrendingUp}
          color="#2e7d32"
          loading={statsLoading}
          percentage={stats?.totalUnidades && stats?.unidadesAtivas ? 
            Math.round((stats.unidadesAtivas / stats.totalUnidades) * 100) : 0}
        />
        <KPICard
          title="Taxa de Conversão"
          value={stats?.taxaConversao || 0}
          suffix="%"
          icon={Target}
          color="#ed6c02"
          loading={statsLoading}
          trend={stats?.taxaConversao ? { value: 5.1, isPositive: true } : undefined}
        />
      </Box>

      {/* Main Content Area */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' }, 
        gap: 3, 
        mb: 4 
      }}>
        {/* Activity Feed */}
        <ActivityFeed 
          activities={activities || []} 
          loading={activitiesLoading} 
        />
        
        {/* Performance Chart */}
        <PerformanceChart 
          data={chartData || []} 
          loading={chartLoading} 
        />
      </Box>

      {/* Top Units Performance */}
      <TopUnitsPerformance 
        units={topUnits || []} 
        loading={unitsLoading} 
      />
    </Box>
  );
};

export default DashboardPage;