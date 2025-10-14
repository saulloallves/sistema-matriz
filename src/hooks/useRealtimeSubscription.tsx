import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Um tipo genérico para itens que possuem uma propriedade 'id'
type ItemWithId = { id: string | number; [key: string]: any };

export function useRealtimeSubscription<T extends ItemWithId>(
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
        (payload: RealtimePostgresChangesPayload<T>) => {
          console.log(`Realtime change on ${tableName}:`, payload);

          // Evento de INSERÇÃO (novo item)
          if (payload.eventType === 'INSERT') {
            queryClient.setQueryData<T[]>(queryKey, (oldData) => {
              if (!oldData) return [payload.new];
              // Evita adicionar duplicatas se o cliente já iniciou a mudança
              if (oldData.some(item => item.id === payload.new.id)) {
                return oldData;
              }
              return [payload.new, ...oldData];
            });
          }

          // Evento de ATUALIZAÇÃO (item editado)
          if (payload.eventType === 'UPDATE') {
            queryClient.setQueryData<T[]>(queryKey, (oldData) => {
              if (!oldData) return [];
              return oldData.map((item) =>
                item.id === payload.new.id ? payload.new : item
              );
            });
          }

          // Evento de EXCLUSÃO (item removido)
          if (payload.eventType === 'DELETE') {
            queryClient.setQueryData<T[]>(queryKey, (oldData) => {
              if (!oldData) return [];
              return oldData.filter((item) => item.id !== (payload.old as T).id);
            });
          }
        }
      )
      .subscribe();

    // Função de limpeza para remover a inscrição quando o componente não estiver mais na tela
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, queryKey, queryClient]);
}