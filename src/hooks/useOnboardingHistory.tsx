import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { OnboardingRequestHistory } from '../types/onboarding';

/**
 * Hook para buscar o histórico de mudanças de uma solicitação
 * @param requestId - ID da solicitação
 */
export const useOnboardingHistory = (requestId: string) => {
  return useQuery({
    queryKey: ['onboarding-history', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_request_history' as never)
        .select('*')
        .eq('request_id', requestId)
        .order('changed_at', { ascending: false });

      if (error) {
        console.error('Error fetching onboarding history:', error);
        throw error;
      }

      return data as unknown as OnboardingRequestHistory[];
    },
    enabled: !!requestId,
    staleTime: 60000, // 1 minuto
  });
};
