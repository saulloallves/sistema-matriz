import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import toast from 'react-hot-toast';

type Franqueado = Tables<"franqueados">;

export const useFranqueados = () => {
  const queryClient = useQueryClient();

  const franqueadosQuery = useQuery({
    queryKey: ['franqueados'],
    queryFn: async () => {
      // Use the secure function that handles data masking
      const { data, error } = await supabase
        .rpc('get_franqueados_secure');

      if (error) {
        throw new Error(error.message);
      }

      // Log access attempt
      await supabase.rpc('log_franqueado_access', {
        _franqueado_id: null,
        _action: 'view_list',
        _accessed_fields: ['full_name', 'owner_type', 'is_in_contract', 'receives_prolabore']
      });

      return data;
    },
  });

  const createFranqueadoMutation = useMutation({
    mutationFn: async (franqueadoData: Omit<Franqueado, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('franqueados')
        .insert(franqueadoData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Log creation
      await supabase.rpc('log_franqueado_access', {
        _franqueado_id: data.id,
        _action: 'create',
        _accessed_fields: Object.keys(franqueadoData)
      });

      return data;
    },
    onSuccess: () => {
      toast.success('Franqueado criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['franqueados'] });
    },
    onError: (error: Error) => {
      console.error('Erro ao criar franqueado:', error);
      toast.error(error.message || 'Erro ao criar franqueado');
    }
  });

  const updateFranqueadoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Franqueado> }) => {
      const { data, error } = await supabase
        .from('franqueados')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Log update
      await supabase.rpc('log_franqueado_access', {
        _franqueado_id: id,
        _action: 'edit',
        _accessed_fields: Object.keys(updates)
      });

      return data;
    },
    onSuccess: () => {
      toast.success('Franqueado atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['franqueados'] });
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar franqueado:', error);
      toast.error(error.message || 'Erro ao atualizar franqueado');
    }
  });

  const deleteFranqueadoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('franqueados')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      // Log deletion
      await supabase.rpc('log_franqueado_access', {
        _franqueado_id: id,
        _action: 'delete',
        _accessed_fields: ['*']
      });
    },
    onSuccess: () => {
      toast.success('Franqueado excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['franqueados'] });
    },
    onError: (error: Error) => {
      console.error('Erro ao excluir franqueado:', error);
      toast.error(error.message || 'Erro ao excluir franqueado');
    }
  });

  // Hook to get detailed franqueado data for viewing/editing
  const getFranqueadoDetails = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('franqueados')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Log view access
      await supabase.rpc('log_franqueado_access', {
        _franqueado_id: id,
        _action: 'view_details',
        _accessed_fields: ['*']
      });

      return data;
    } catch (error) {
      console.error('Erro ao buscar detalhes do franqueado:', error);
      throw error;
    }
  };

  return {
    franqueados: franqueadosQuery.data || [],
    isLoading: franqueadosQuery.isLoading,
    error: franqueadosQuery.error,
    createFranqueado: createFranqueadoMutation.mutate,
    isCreating: createFranqueadoMutation.isPending,
    updateFranqueado: updateFranqueadoMutation.mutate,
    isUpdating: updateFranqueadoMutation.isPending,
    deleteFranqueado: deleteFranqueadoMutation.mutate,
    isDeleting: deleteFranqueadoMutation.isPending,
    getFranqueadoDetails,
    refetch: franqueadosQuery.refetch
  };
};

// Hook for checking user permissions
export const useUserRole = () => {
  const userRoleQuery = useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_current_user_role');

      if (error) {
        console.error('Erro ao buscar role do usuário:', error);
        return null;
      }

      return data;
    },
  });

  const hasRole = (role: 'admin' | 'franqueado' | 'user') => {
    return userRoleQuery.data === role;
  };

  const isAdmin = () => hasRole('admin');
  const isFranqueado = () => hasRole('franqueado');

  return {
    userRole: userRoleQuery.data,
    isLoading: userRoleQuery.isLoading,
    hasRole,
    isAdmin,
    isFranqueado,
    refetch: userRoleQuery.refetch
  };
};