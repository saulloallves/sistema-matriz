import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export interface FranqueadoAuditLog {
  id: string;
  user_id: string;
  user_full_name: string | null;
  franqueado_id: string | null;
  action: string;
  accessed_fields: string[] | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const queryKey = ['franqueados-audit-logs'];

export const useFranqueadosAuditLogs = () => {
  useRealtimeSubscription('franqueados_audit_log', queryKey);

  const { data: logs = [], isLoading, error, refetch } = useQuery<FranqueadoAuditLog[]>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_franqueados_audit_logs_with_user_names');

      if (error) {
        console.error('Erro ao buscar logs de auditoria de franqueados:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
  });

  return {
    logs,
    isLoading,
    error,
    refetch,
  };
};