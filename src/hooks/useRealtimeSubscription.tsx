import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useRealtimeSubscription(
  tableName: string,
  queryKey: readonly unknown[]
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log(`Realtime change on ${tableName}, invalidating query:`, queryKey, payload);
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    // Função de limpeza para remover a inscrição quando o componente não estiver mais na tela
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, queryKey, queryClient]);
}