import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';
import toast from 'react-hot-toast';
import { useRealtimeSubscription } from './useRealtimeSubscription';

const queryKey = ['users'];

export const useUsers = () => {
  const queryClient = useQueryClient();
  useRealtimeSubscription('profiles', queryKey);

  const usersQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_profiles_with_users_data');

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
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar usuário:', error);
      toast.error(error.message || 'Erro ao atualizar usuário');
    }
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'ativo' | 'inativo' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (_, { newStatus }) => {
      const action = newStatus === 'ativo' ? 'ativado' : 'inativado';
      toast.success(`Usuário ${action} com sucesso!`);
    },
    onError: (error: Error) => {
      console.error('Erro ao alterar status do usuário:', error);
      toast.error(error.message || 'Erro ao alterar status do usuário');
    }
  });

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    updateUser: updateUserMutation.mutate,
    isUpdating: updateUserMutation.isPending,
    toggleUserStatus: toggleUserStatusMutation.mutate,
    isTogglingStatus: toggleUserStatusMutation.isPending,
    refetch: usersQuery.refetch
  };
};