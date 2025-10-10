import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import toast from 'react-hot-toast';

// Types
export type FranqueadoUnidade = {
  id: number;
  franqueado_id: string;
  unidade_id: string;
  created_at: string;
  updated_at: string;
  franqueado_full_name: string;
  franqueado_contact: string;
  franqueado_contact_masked: string;
  franqueado_owner_type: string;
  franqueado_profile_image: string | null;
  franqueado_is_in_contract: boolean;
  unidade_group_code: number;
  unidade_group_name: string;
  unidade_city: string | null;
  unidade_state: string | null;
  unidade_store_model: string;
  unidade_store_phase: string;
  unidade_cnpj: string | null;
  unidade_fantasy_name: string | null;
  unidade_is_active: boolean;
};

export type CreateFranqueadoUnidadeData = {
  franqueado_id: string;
  unidade_id: string;
};

export const useFranqueadosUnidades = () => {
  const queryClient = useQueryClient();

  // Buscar todos os vínculos
  const {
    data: vinculos = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['franqueados-unidades'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_franqueados_unidades_secure');
      
      if (error) {
        console.error('Error fetching franqueados-unidades:', error);
        throw error;
      }
      
      return data as FranqueadoUnidade[];
    },
  });

  // Buscar franqueados disponíveis para seleção
  const { data: franqueadosDisponiveis = [] } = useQuery({
    queryKey: ['franqueados-disponiveis'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_franqueados_secure');
      
      if (error) {
        console.error('Error fetching franqueados:', error);
        throw error;
      }
      
      return data;
    },
  });

  // Buscar unidades disponíveis para seleção
  const { data: unidadesDisponiveis = [] } = useQuery({
    queryKey: ['unidades-disponiveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unidades')
        .select('id, group_code, group_name, city, state, store_model, store_phase, is_active, fantasy_name')
        .eq('is_active', true)
        .order('group_name');
      
      if (error) {
        console.error('Error fetching unidades:', error);
        throw error;
      }
      
      return data;
    },
  });

  // Função para buscar detalhes de um vínculo específico
  const getVinculoDetails = async (id: number) => {
    const vinculo = vinculos.find(v => v.id === id);
    if (vinculo) {
      // Log access
      await supabase.rpc('log_vinculo_access', {
        _vinculo_id: id,
        _action: 'view',
        _accessed_fields: ['all']
      });
    }
    return vinculo;
  };

  // Mutation para criar vínculo
  const createVinculoMutation = useMutation({
    mutationFn: async (data: CreateFranqueadoUnidadeData) => {
      // Verificar se já existe o vínculo
      const existingVinculo = vinculos.find(
        v => v.franqueado_id === data.franqueado_id && v.unidade_id === data.unidade_id
      );
      
      if (existingVinculo) {
        throw new Error('Este vínculo já existe entre o franqueado e a unidade');
      }

      const { data: result, error } = await supabase
        .from('franqueados_unidades')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Error creating vinculo:', error);
        throw error;
      }

      // Log da criação
      await supabase.rpc('log_vinculo_access', {
        _vinculo_id: result.id,
        _action: 'create',
        _accessed_fields: ['franqueado_id', 'unidade_id']
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franqueados-unidades'] });
      toast.success('Vínculo criado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error creating vinculo:', error);
      toast.error(error.message || 'Erro ao criar vínculo');
    },
  });

  // Mutation para atualizar vínculo
  const updateVinculoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateFranqueadoUnidadeData> }) => {
      const { data: result, error } = await supabase
        .from('franqueados_unidades')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating vinculo:', error);
        throw error;
      }

      // Log da atualização
      await supabase.rpc('log_vinculo_access', {
        _vinculo_id: id,
        _action: 'update',
        _accessed_fields: Object.keys(data)
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franqueados-unidades'] });
      toast.success('Vínculo atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error updating vinculo:', error);
      toast.error(error.message || 'Erro ao atualizar vínculo');
    },
  });

  // Mutation para deletar vínculo
  const deleteVinculoMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('franqueados_unidades')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting vinculo:', error);
        throw error;
      }

      // Log da exclusão
      await supabase.rpc('log_vinculo_access', {
        _vinculo_id: id,
        _action: 'delete',
        _accessed_fields: ['id']
      });

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franqueados-unidades'] });
      toast.success('Vínculo removido com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error deleting vinculo:', error);
      toast.error(error.message || 'Erro ao remover vínculo');
    },
  });

  return {
    vinculos,
    franqueadosDisponiveis,
    unidadesDisponiveis,
    isLoading,
    error,
    refetch,
    getVinculoDetails,
    createVinculo: createVinculoMutation.mutateAsync,
    updateVinculo: updateVinculoMutation.mutateAsync,
    deleteVinculo: deleteVinculoMutation.mutateAsync,
    isCreating: createVinculoMutation.isPending,
    isUpdating: updateVinculoMutation.isPending,
    isDeleting: deleteVinculoMutation.isPending,
  };
};