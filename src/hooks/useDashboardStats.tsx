import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

interface DashboardStats {
  totalUnidades: number;
  totalFranqueados: number;
  unidadesAtivas: number;
  novasUnidadesMes: number;
  taxaConversao: number;
  franqueadosComUnidades: number;
}

interface ChartData {
  month: string;
  unidades: number;
  franqueados: number;
}

interface Activity {
  id: string;
  type: 'franqueado' | 'unidade' | 'sistema' | 'performance';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'info';
}

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

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [unidadesResponse, franqueadosResponse] = await Promise.all([
        supabase.from('unidades').select('*'),
        supabase.from('franqueados').select('*'),
      ]);

      if (unidadesResponse.error) throw unidadesResponse.error;
      if (franqueadosResponse.error) throw franqueadosResponse.error;

      const unidades = unidadesResponse.data || [];
      const franqueados = franqueadosResponse.data || [];

      const unidadesAtivas = unidades.filter(u => u.purchases_active || u.sales_active).length;
      
      // Calcular unidades criadas no último mês (simulado)
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const novasUnidadesMes = unidades.filter(u => 
        new Date(u.created_at) >= oneMonthAgo
      ).length;

      // Taxa de conversão simulada baseada na relação entre unidades ativas e total
      const taxaConversao = unidades.length > 0 ? 
        Math.round((unidadesAtivas / unidades.length) * 100) : 0;

      return {
        totalUnidades: unidades.length,
        totalFranqueados: franqueados.length,
        unidadesAtivas,
        novasUnidadesMes,
        taxaConversao,
        franqueadosComUnidades: franqueados.length,
      };
    },
  });
};

export const useChartData = () => {
  return useQuery({
    queryKey: ['chart-data'],
    queryFn: async (): Promise<ChartData[]> => {
      // Mock data for now - in a real app, this would come from actual time-series data
      const mockData: ChartData[] = [
        { month: 'Jan', unidades: 45, franqueados: 32 },
        { month: 'Fev', unidades: 52, franqueados: 38 },
        { month: 'Mar', unidades: 61, franqueados: 45 },
        { month: 'Abr', unidades: 68, franqueados: 51 },
        { month: 'Mai', unidades: 75, franqueados: 58 },
        { month: 'Jun', unidades: 82, franqueados: 65 },
      ];
      
      return mockData;
    },
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async (): Promise<Activity[]> => {
      // Get recent franqueados and unidades for activities
      const [franqueadosResponse, unidadesResponse] = await Promise.all([
        supabase.from('franqueados').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('unidades').select('*').order('updated_at', { ascending: false }).limit(5),
      ]);

      const activities: Activity[] = [];

      // Add recent franqueados
      if (franqueadosResponse.data) {
        franqueadosResponse.data.forEach((franqueado, index) => {
          activities.push({
            id: `franqueado-${franqueado.id}`,
            type: 'franqueado',
            title: `Novo franqueado: ${franqueado.full_name}`,
            description: `Cadastrado como ${franqueado.owner_type}`,
            timestamp: new Date(franqueado.created_at),
            status: 'success',
          });
        });
      }

      // Add recent unidades updates
      if (unidadesResponse.data) {
        unidadesResponse.data.slice(0, 3).forEach((unidade) => {
          activities.push({
            id: `unidade-${unidade.id}`,
            type: 'unidade',
            title: `Unidade atualizada: ${unidade.group_name}`,
            description: `${unidade.city}, ${unidade.state} - Fase: ${unidade.store_phase}`,
            timestamp: new Date(unidade.updated_at),
            status: 'info',
          });
        });
      }

      // Sort by timestamp and return latest 8
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 8);
    },
  });
};

export const useTopUnits = () => {
  return useQuery({
    queryKey: ['top-units'],
    queryFn: async (): Promise<UnitPerformance[]> => {
      const { data: unidades, error } = await supabase
        .from('unidades')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(8);

      if (error) throw error;

      return (unidades || []).map((unidade, index): UnitPerformance => ({
        id: unidade.id,
        name: unidade.group_name,
        city: unidade.city || 'Cidade não informada',
        state: unidade.state || 'UF',
        model: unidade.store_model,
        phase: unidade.store_phase,
        isActive: unidade.is_active,
        trend: index % 3 === 0 ? 'up' : index % 3 === 1 ? 'down' : 'stable', // Mock trend
        score: Math.random() * 100, // Mock score
      }));
    },
  });
};