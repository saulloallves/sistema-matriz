import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { OnboardingRequest, OnboardingStatus } from '../types/onboarding';

/**
 * Hook para buscar lista de solicitações de onboarding
 * @param status - Filtrar por status específico (opcional)
 */
export const useOnboardingRequests = (status?: OnboardingStatus) => {
  return useQuery({
    queryKey: ['onboarding-requests', status],
    queryFn: async () => {
      let query = supabase
        .from('onboarding_requests' as never)
        .select('*')
        .order('submitted_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching onboarding requests:', error);
        throw error;
      }

      return data as unknown as OnboardingRequest[];
    },
    staleTime: 30000, // 30 segundos - dados relativamente frescos
    refetchInterval: 60000, // Recarregar a cada 1 minuto
  });
};

/**
 * Hook para buscar uma solicitação específica por ID
 * @param id - ID da solicitação
 */
export const useOnboardingRequest = (id: string) => {
  return useQuery({
    queryKey: ['onboarding-request', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_requests' as never)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching onboarding request:', error);
        throw error;
      }

      return data as unknown as OnboardingRequest;
    },
    enabled: !!id,
    staleTime: 60000, // 1 minuto
  });
};
