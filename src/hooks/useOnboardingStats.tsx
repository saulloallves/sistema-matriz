import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { OnboardingStats } from '../types/onboarding';

/**
 * Hook para buscar estatísticas do dashboard de onboarding
 * Tenta usar a função RPC do banco, se não existir faz queries manuais
 */
export const useOnboardingStats = () => {
  return useQuery({
    queryKey: ['onboarding-stats'],
    queryFn: async () => {
      // Tentar usar a função RPC otimizada (se existir)
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_onboarding_stats' as never);

      if (!rpcError && rpcData) {
        return rpcData as OnboardingStats;
      }

      // Se a função RPC não existir, fazer queries manuais
      console.info('Função RPC não encontrada, fazendo queries manuais...');

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      const [
        totalResult,
        pendingResult,
        approvedResult,
        rejectedResult,
        processingResult,
        errorResult,
        last7DaysResult,
        pending48hResult,
      ] = await Promise.all([
        supabase.from('onboarding_requests' as never).select('*', { count: 'exact', head: true }),
        supabase.from('onboarding_requests' as never).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('onboarding_requests' as never).select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('onboarding_requests' as never).select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('onboarding_requests' as never).select('*', { count: 'exact', head: true }).eq('status', 'processing'),
        supabase.from('onboarding_requests' as never).select('*', { count: 'exact', head: true }).eq('status', 'error'),
        supabase
          .from('onboarding_requests' as never)
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString()),
        supabase
          .from('onboarding_requests' as never)
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
          .lt('submitted_at', fortyEightHoursAgo.toISOString()),
      ]);

      // Verificar se alguma query deu erro
      const errors = [
        totalResult.error,
        pendingResult.error,
        approvedResult.error,
        rejectedResult.error,
        processingResult.error,
        errorResult.error,
        last7DaysResult.error,
        pending48hResult.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error('Errors fetching onboarding stats:', errors);
        throw errors[0];
      }

      return {
        total: totalResult.count || 0,
        pending: pendingResult.count || 0,
        approved: approvedResult.count || 0,
        rejected: rejectedResult.count || 0,
        processing: processingResult.count || 0,
        error: errorResult.count || 0,
        last_7_days: last7DaysResult.count || 0,
        pending_over_48h: pending48hResult.count || 0,
      } as OnboardingStats;
    },
    staleTime: 0, // Sempre buscar dados frescos
    refetchInterval: 5000, // Recarregar a cada 5 segundos
    refetchOnWindowFocus: true, // Recarregar ao focar na janela
  });
};
