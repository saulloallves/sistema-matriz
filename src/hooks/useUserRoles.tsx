import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'operador' | 'franqueado' | 'user';

export interface UserRole {
  user_id: string;
  role: AppRole;
}

export function useUserRoles() {
  const { data: userRoles = [], isLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (error) throw error;
      return data as UserRole[];
    },
  });

  const getRoleByUserId = (userId: string): AppRole | undefined => {
    return userRoles.find(ur => ur.user_id === userId)?.role;
  };

  const getRoleLabel = (role: AppRole): string => {
    const labels: Record<AppRole, string> = {
      admin: 'Administrador',
      operador: 'Operador',
      franqueado: 'Franqueado',
      user: 'Usuário',
    };
    return labels[role] || role;
  };

  return {
    userRoles,
    isLoading,
    getRoleByUserId,
    getRoleLabel,
  };
}
