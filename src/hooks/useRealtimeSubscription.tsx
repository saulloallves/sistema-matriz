import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Função Debounce: Agrupa múltiplas chamadas a uma função em um curto 
 * período de tempo em uma única execução.
 */
function debounce(func: () => void, delay: number) {
  let timeoutId: number;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func();
    }, delay);
  };
}

export function useRealtimeSubscription(
  tableName: string,
  queryKey: readonly unknown[]
) {
  const queryClient = useQueryClient();

  // Usamos useCallback para garantir que a função debounced seja estável
  // entre as renderizações, desde que suas dependências (queryKey, etc.) não mudem.
  const debouncedInvalidate = useCallback(
    debounce(() => {
      console.log(`[Realtime Debounced] Invalidando a query para a tabela: ${tableName}`, queryKey);
      queryClient.invalidateQueries({ queryKey });
    }, 500), // Agrupa todas as atualizações que ocorrerem em um intervalo de 500ms
    [queryClient, queryKey, tableName]
  );

  useEffect(() => {
    const channelName = `db-changes-${tableName}`;
    const channel = supabase.channel(channelName);

    const subscription = channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log(`[Realtime] Mudança recebida da tabela '${tableName}':`, payload.eventType);
          // Chama a função debounced estável
          debouncedInvalidate();
        }
      )
      .subscribe((status, err) => {
        // Adiciona logs detalhados para monitorar o status da conexão
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Conectado com sucesso ao canal da tabela: ${tableName}`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error(`[Realtime] Erro de conexão no canal da tabela ${tableName}:`, err);
        }
        if (status === 'TIMED_OUT') {
          console.warn(`[Realtime] Conexão com o canal da tabela ${tableName} expirou. Tentando reconectar...`);
        }
        if (status === 'CLOSED') {
          console.log(`[Realtime] Canal da tabela ${tableName} fechado.`);
        }
      });

    // Função de limpeza para remover a inscrição quando o componente não estiver mais na tela
    return () => {
      console.log(`[Realtime] Desconectando do canal da tabela: ${tableName}`);
      supabase.removeChannel(subscription);
    };
  }, [tableName, queryKey, debouncedInvalidate]);
}