import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database, Json } from '@/integrations/supabase/types';

export interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_full_name: string | null;
  action: Database["public"]["Enums"]["action_type"];
  table_name: string;
  record_id: string;
  old_record_data: Record<string, any> | null;
  new_record_data: Record<string, any> | null;
}

const queryKey = ['audit-logs'];

export const useAuditLogs = () => {
  const { data: logs = [], isLoading, error, refetch } = useQuery<AuditLog[]>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_audit_logs_with_user_names');

      if (error) {
        console.error('Erro ao buscar logs de auditoria:', error);
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