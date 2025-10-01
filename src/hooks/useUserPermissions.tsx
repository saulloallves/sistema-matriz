import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface UserTablePermission {
  id: string;
  user_id: string;
  table_name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function useUserPermissions(userId?: string) {
  const queryClient = useQueryClient();

  const { data: userPermissions = [], isLoading } = useQuery({
    queryKey: ['user-table-permissions', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_table_permissions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data as UserTablePermission[];
    },
    enabled: !!userId,
  });

  const updateUserPermissionMutation = useMutation({
    mutationFn: async ({
      user_id,
      table_name,
      can_create,
      can_read,
      can_update,
      can_delete,
    }: {
      user_id: string;
      table_name: string;
      can_create: boolean;
      can_read: boolean;
      can_update: boolean;
      can_delete: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('user_table_permissions')
        .upsert({
          user_id,
          table_name,
          can_create,
          can_read,
          can_update,
          can_delete,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-table-permissions'] });
      toast.success('Permissão de usuário atualizada com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar permissão: ${error.message}`);
    },
  });

  const deleteUserPermissionMutation = useMutation({
    mutationFn: async ({ user_id, table_name }: { user_id: string; table_name: string }) => {
      const { error } = await supabase
        .from('user_table_permissions')
        .delete()
        .eq('user_id', user_id)
        .eq('table_name', table_name);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-table-permissions'] });
      toast.success('Permissão de usuário removida com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover permissão: ${error.message}`);
    },
  });

  return {
    userPermissions,
    isLoading,
    updateUserPermission: updateUserPermissionMutation.mutate,
    deleteUserPermission: deleteUserPermissionMutation.mutate,
    isUpdating: updateUserPermissionMutation.isPending,
    isDeleting: deleteUserPermissionMutation.isPending,
  };
}
