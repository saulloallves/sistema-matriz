/* eslint-disable @typescript-eslint/no-explicit-any */
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
    queryFn: async (): Promise<FranqueadoAuditLog[]> => {
      const { data, error } = await supabase
        .from('franqueados_audit_log')
        .select(`
          *,
          user_full_name:users(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar logs de auditoria de franqueados:', error);
        throw new Error(error.message);
      }

      // Transformar os dados para o formato esperado
      const transformedData: FranqueadoAuditLog[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        user_full_name: item.user_full_name?.full_name || null,
        franqueado_id: item.franqueado_id,
        action: item.action,
        accessed_fields: item.accessed_fields,
        ip_address: item.ip_address,
        user_agent: item.user_agent,
        created_at: item.created_at,
      }));

      return transformedData;
    },
  });

  return {
    logs,
    isLoading,
    error,
    refetch,
  };
};