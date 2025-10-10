import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export type AppRole = 'admin' | 'operador' | 'franqueado' | 'user';

export interface UserRole {
  user_id: string;
  role: AppRole;
}

export function useUserRoles() {
  const queryClient = useQueryClient();
  
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

  const { mutate: updateUserRole, isPending: isUpdating } = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Verificar se já existe um role para esse usuário
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Atualizar role existente
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Criar novo role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil do usuário');
    },
  });

  return {
    userRoles,
    isLoading,
    getRoleByUserId,
    getRoleLabel,
    updateUserRole,
    isUpdating,
  };
}
