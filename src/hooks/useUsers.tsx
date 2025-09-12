import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';
import toast from 'react-hot-toast';

export const useUsers = () => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_users_with_emails');

      if (error) {
        throw new Error(error.message);
      }

      return data as User[];
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<User> }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Usuário atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar usuário:', error);
      toast.error(error.message || 'Erro ao atualizar usuário');
    }
  });

  const inactivateUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inativo' })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success('Usuário inativado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      console.error('Erro ao inativar usuário:', error);
      toast.error(error.message || 'Erro ao inativar usuário');
    }
  });

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    updateUser: updateUserMutation.mutate,
    isUpdating: updateUserMutation.isPending,
    inactivateUser: inactivateUserMutation.mutate,
    isInactivating: inactivateUserMutation.isPending,
    refetch: usersQuery.refetch
  };
};