import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type PermissionType = 'create' | 'read' | 'update' | 'delete';

interface TablePermissions {
  table_name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export function usePermissionCheck(tableName?: string) {
  const { user } = useAuth();

  const { data: allPermissions = [], isLoading } = useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc('get_user_permissions', {
        _user_id: user.id,
      });

      if (error) throw error;
      return data as TablePermissions[];
    },
    enabled: !!user?.id,
  });

  const getPermission = (table: string, permission: PermissionType): boolean => {
    const tablePerms = allPermissions.find((p) => p.table_name === table);
    if (!tablePerms) return false;

    switch (permission) {
      case 'create':
        return tablePerms.can_create;
      case 'read':
        return tablePerms.can_read;
      case 'update':
        return tablePerms.can_update;
      case 'delete':
        return tablePerms.can_delete;
      default:
        return false;
    }
  };

  const hasPermission = (permission: PermissionType): boolean => {
    if (!tableName) return false;
    return getPermission(tableName, permission);
  };

  const canCreate = hasPermission('create');
  const canRead = hasPermission('read');
  const canUpdate = hasPermission('update');
  const canDelete = hasPermission('delete');

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    hasPermission,
    getPermission,
    isLoading,
    allPermissions,
  };
}
