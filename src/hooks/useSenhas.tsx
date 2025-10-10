import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface Senha {
  id: string;
  platform: string;
  login: string;
  password: string;
  account_id?: string;
  token?: string;
  authentication_code?: string;
  a2f_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useSenhas() {
  const queryClient = useQueryClient();

  const { data: senhas = [], isLoading, error, refetch } = useQuery({
    queryKey: ['senhas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('senhas')
        .select('*')
        .order('platform', { ascending: true });

      if (error) throw error;
      return data as Senha[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newSenha: Omit<Senha, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('senhas')
        .insert([newSenha])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senhas'] });
      toast.success('Senha criada com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar senha: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Senha> & { id: string }) => {
      const { data, error } = await supabase
        .from('senhas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senhas'] });
      toast.success('Senha atualizada com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar senha: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('senhas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senhas'] });
      toast.success('Senha removida com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover senha: ${error.message}`);
    },
  });

  return {
    senhas,
    isLoading,
    error,
    refetch,
    createSenha: createMutation.mutate,
    updateSenha: updateMutation.mutate,
    deleteSenha: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
