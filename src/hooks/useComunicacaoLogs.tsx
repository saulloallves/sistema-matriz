import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ComunicacaoLog {
  id: string;
  event_type: string;
  user_action: string;
  canal: 'whatsapp' | 'email' | 'sms';
  destinatario: string;
  conteudo: string;
  assunto: string | null;
  status: 'enviado' | 'erro' | 'pendente';
  external_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  created_by: string | null;
}

export const useComunicacaoLogs = () => {
  const logsQuery = useQuery({
    queryKey: ['comunicacao-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comunicacoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as ComunicacaoLog[];
    },
  });

  return {
    logs: logsQuery.data || [],
    isLoading: logsQuery.isLoading,
    error: logsQuery.error,
    refetch: logsQuery.refetch,
  };
};
