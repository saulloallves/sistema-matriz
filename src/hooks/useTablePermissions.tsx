import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface PermissionTable {
  id: string;
  table_name: string;
  display_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface RoleTablePermission {
  id: string;
  role: string;
  table_name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  created_at: string;
  updated_at: string;
}

export function useTablePermissions() {
  const queryClient = useQueryClient();

  const { data: permissionTables = [], isLoading: isLoadingTables } = useQuery({
    queryKey: ['permission-tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permission_tables')
        .select('*')
        .order('display_name', { ascending: true });

      if (error) throw error;
      return data as PermissionTable[];
    },
  });

  const { data: rolePermissions = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ['role-table-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_table_permissions')
        .select('*')
        .order('role', { ascending: true });

      if (error) throw error;
      return data as RoleTablePermission[];
    },
  });

  const updateRolePermissionMutation = useMutation({
    mutationFn: async ({
      role,
      table_name,
      can_create,
      can_read,
      can_update,
      can_delete,
    }: {
      role: string;
      table_name: string;
      can_create: boolean;
      can_read: boolean;
      can_update: boolean;
      can_delete: boolean;
    }) => {
      const { data, error } = await supabase
        .from('role_table_permissions')
        .upsert({
          role: role as any,
          table_name,
          can_create,
          can_read,
          can_update,
          can_delete,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-table-permissions'] });
      toast.success('Permissão atualizada com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar permissão: ${error.message}`);
    },
  });

  return {
    permissionTables,
    rolePermissions,
    isLoading: isLoadingTables || isLoadingRoles,
    updateRolePermission: updateRolePermissionMutation.mutate,
    isUpdating: updateRolePermissionMutation.isPending,
  };
}
