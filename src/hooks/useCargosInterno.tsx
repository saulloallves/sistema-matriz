import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCargosInterno() {
  const { data: cargos = [], isLoading, error } = useQuery({
    queryKey: ['cargos_interno'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cargos_loja')
        .select('*')
        .order('role', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return {
    cargos,
    isLoading,
    error,
  };
}
