import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

interface FinancialMetrics {
  totalProlabore: number;
  averageProlabore: number;
  franqueadosWithProlabore: number;
  percentageWithProlabore: number;
}

export const useFinancialMetrics = () => {
  return useQuery({
    queryKey: ['financial-metrics'],
    queryFn: async (): Promise<FinancialMetrics> => {
      const { data: franqueados, error } = await supabase
        .from('franqueados')
        .select('prolabore_value')
        .not('prolabore_value', 'is', null);

      if (error) throw error;

      const franqueadosData = franqueados || [];
      const totalFranqueados = await supabase
        .from('franqueados')
        .select('id', { count: 'exact' });

      if (totalFranqueados.error) throw totalFranqueados.error;

      const totalProlabore = franqueadosData.reduce(
        (sum, f) => sum + (Number(f.prolabore_value) || 0), 
        0
      );

      const averageProlabore = franqueadosData.length > 0 ? 
        totalProlabore / franqueadosData.length : 0;

      return {
        totalProlabore,
        averageProlabore,
        franqueadosWithProlabore: franqueadosData.length,
        percentageWithProlabore: totalFranqueados.count ? 
          Math.round((franqueadosData.length / totalFranqueados.count) * 100) : 0,
      };
    },
  });
};