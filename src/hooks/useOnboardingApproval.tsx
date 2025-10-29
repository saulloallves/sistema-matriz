import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import toast from 'react-hot-toast';
import { ApproveRequestParams, ApprovalResponse } from '../types/onboarding';

/**
 * Hook para aprovar ou rejeitar solicitações de onboarding
 * Chama a Edge Function do Supabase para processar a ação
 */
export const useOnboardingApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, action, rejectionReason }: ApproveRequestParams) => {
      // Obter o usuário atual autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Chamar a Edge Function para processar a aprovação/rejeição
      const { data, error } = await supabase.functions.invoke<ApprovalResponse>(
        'approve-onboarding-request',
        {
          body: {
            requestId,
            action,
            rejectionReason,
            reviewerId: user.id,
          },
        }
      );

      if (error) {
        console.error('Error calling Edge Function:', error);
        throw new Error(error.message || 'Erro ao processar solicitação');
      }

      if (!data?.success) {
        throw new Error(data?.message || 'Erro ao processar solicitação');
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas para forçar recarregamento
      queryClient.invalidateQueries({ queryKey: ['onboarding-requests'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-request', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-stats'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-history', variables.requestId] });
      
      // Também invalidar dados de franqueados e unidades pois podem ter sido criados
      queryClient.invalidateQueries({ queryKey: ['franqueados'] });
      queryClient.invalidateQueries({ queryKey: ['unidades'] });

      // Forçar refetch imediato das estatísticas
      queryClient.refetchQueries({ queryKey: ['onboarding-stats'] });

      // Mostrar mensagem de sucesso
      const message = variables.action === 'approve' 
        ? '✅ Cadastro aprovado com sucesso!' 
        : '❌ Cadastro rejeitado com sucesso!';
      
      toast.success(message);
    },
    onError: (error: Error) => {
      console.error('Error processing onboarding request:', error);
      toast.error(error.message || 'Erro ao processar solicitação');
    },
  });
};
