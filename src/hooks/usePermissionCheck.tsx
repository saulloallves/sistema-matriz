import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// 1. Atualizar a interface para corresponder à nova resposta da RPC
interface TablePermission {
  table_name: string;
  has_access: boolean;
}

export function usePermissionCheck(tableName?: string) {
  const { user } = useAuth();

  const { data: allPermissions = [], isLoading } = useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // A RPC agora retorna a nova estrutura simplificada
      const { data, error } = await supabase.rpc('get_user_permissions', {
        _user_id: user.id,
      });

      if (error) throw error;
      return data as TablePermission[];
    },
    enabled: !!user?.id,
  });

  // 2. Simplificar a lógica de getPermission. O segundo argumento agora é ignorado.
  const getPermission = (table: string): boolean => {
    const tablePerms = allPermissions.find((p) => p.table_name === table);
    if (!tablePerms) return false;
    return tablePerms.has_access;
  };

  const hasAccess = tableName ? getPermission(tableName) : false;

  // 3. Unificar todas as permissões CRUD sob a única flag 'has_access'
  const canCreate = hasAccess;
  const canRead = hasAccess;
  const canUpdate = hasAccess;
  const canDelete = hasAccess;

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    hasPermission: (permissionType: 'create' | 'read' | 'update' | 'delete') => {
      if (!tableName) return false;
      // A verificação agora é a mesma para qualquer tipo de permissão
      return getPermission(tableName);
    },
    getPermission,
    isLoading,
    allPermissions,
  };
}