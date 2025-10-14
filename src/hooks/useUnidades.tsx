import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import toast from 'react-hot-toast';
import { useRealtimeSubscription } from './useRealtimeSubscription';

type Unidade = Tables<"unidades">;
const queryKey = ['unidades'];

export const useUnidades = () => {
  const queryClient = useQueryClient();
  useRealtimeSubscription('unidades', queryKey);

  const { data: unidades = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unidades')
        .select('*')
        .order('group_code', { ascending: true });

      if (error) throw error;
      return data as Unidade[];
    },
  });

  const createUnidade = useMutation({
    mutationFn: async (newUnidade: TablesInsert<'unidades'>) => {
      const { data, error } = await supabase
        .from('unidades')
        .insert([newUnidade])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Unidade criada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar unidade:', error);
      if (error.message?.includes('duplicate key')) {
        toast.error('Erro: Já existe uma unidade com este código.');
      } else {
        toast.error(`Erro ao criar unidade: ${error.message}`);
      }
    },
  });

  const updateUnidade = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'unidades'> }) => {
      const { data, error } = await supabase
        .from('unidades')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Unidade atualizada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar unidade:', error);
      toast.error(`Erro ao atualizar unidade: ${error.message}`);
    },
  });

  const toggleUnidadeStatus = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: boolean }) => {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from('unidades')
        .update({ is_active: newStatus })
        .eq('id', id);
      if (error) throw error;
      return newStatus;
    },
    onSuccess: (newStatus) => {
      toast.success(`Unidade ${newStatus ? 'ativada' : 'inativada'} com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao alterar status da unidade:', error);
      toast.error(`Erro ao alterar status: ${error.message}`);
    },
  });

  return {
    unidades,
    isLoading,
    error,
    refetch,
    createUnidade: createUnidade.mutateAsync,
    isCreating: createUnidade.isPending,
    updateUnidade: updateUnidade.mutateAsync,
    isUpdating: updateUnidade.isPending,
    toggleUnidadeStatus: toggleUnidadeStatus.mutateAsync,
    isToggling: toggleUnidadeStatus.isPending,
  };
};