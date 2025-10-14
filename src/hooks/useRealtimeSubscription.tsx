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
    // Usaremos um nome de canal simples e único para cada tabela para maior robustez.
    const channel = supabase.channel(`table-changes-${tableName}`);

    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log(`[Realtime] Mudança detectada em '${tableName}':`, payload);
          // Invalida a query para forçar o React Query a buscar os dados mais recentes.
          // Isso garante que todas as regras de segurança (RLS) e RPCs sejam reaplicadas.
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe((status, err) => {
        // Adiciona logs para depuração do status da conexão em tempo real.
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Conectado com sucesso ao canal da tabela: ${tableName}`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error(`[Realtime] Erro de conexão no canal da tabela ${tableName}:`, err);
        }
        if (status === 'TIMED_OUT') {
          console.warn(`[Realtime] Conexão com o canal da tabela ${tableName} expirou.`);
        }
      });

    // Função de limpeza para remover a inscrição quando o componente não estiver mais na tela.
    return () => {
      console.log(`[Realtime] Desconectando do canal da tabela: ${tableName}`);
      supabase.removeChannel(channel);
    };
  }, [tableName, queryKey, queryClient]);
}