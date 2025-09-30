import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface Permissao {
  id: string;
  level: string;
}

export function usePermissoes() {
  const queryClient = useQueryClient();

  const { data: permissoes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['permissoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissoes')
        .select('*')
        .order('level', { ascending: true });

      if (error) throw error;
      return data as Permissao[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newPermissao: Omit<Permissao, 'id'>) => {
      const { data, error } = await supabase
        .from('permissoes')
        .insert([newPermissao])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissoes'] });
      toast.success('Permissão criada com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar permissão: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Permissao> & { id: string }) => {
      const { data, error } = await supabase
        .from('permissoes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissoes'] });
      toast.success('Permissão atualizada com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar permissão: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('permissoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissoes'] });
      toast.success('Permissão removida com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover permissão: ${error.message}`);
    },
  });

  return {
    permissoes,
    isLoading,
    error,
    refetch,
    createPermissao: createMutation.mutate,
    updatePermissao: updateMutation.mutate,
    deletePermissao: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
