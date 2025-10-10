import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

export interface WebhookDeliveryLog {
  id: string;
  subscription_id: string | null;
  status_code: number | null;
  success: boolean | null;
  attempt: number;
  error_message: string | null;
  request_body: any;
  response_body: string | null;
  dispatched_at: string | null;
}

export const useWebhookDeliveryLogs = () => {
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['webhook-delivery-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_delivery_logs')
        .select('*')
        .order('dispatched_at', { ascending: false });

      if (error) throw error;
      return data as WebhookDeliveryLog[];
    },
  });

  const deleteLog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('webhook_delivery_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-delivery-logs'] });
      toast.success('Log removido com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao remover log:', error);
      toast.error('Erro ao remover log: ' + error.message);
    },
  });

  const deleteAllLogs = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('webhook_delivery_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-delivery-logs'] });
      toast.success('Todos os logs foram removidos!');
    },
    onError: (error: Error) => {
      console.error('Erro ao remover logs:', error);
      toast.error('Erro ao remover logs: ' + error.message);
    },
  });

  return {
    logs,
    isLoading,
    deleteLog: deleteLog.mutate,
    isDeleting: deleteLog.isPending,
    deleteAllLogs: deleteAllLogs.mutate,
    isDeletingAll: deleteAllLogs.isPending,
  };
};
