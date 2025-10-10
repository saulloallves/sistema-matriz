import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WhatsAppGroup, WhatsAppGroupInsert, WhatsAppGroupUpdate, WhatsAppGroupWithUnidade } from '@/types/whatsapp';
import toast from 'react-hot-toast';

export const useWhatsAppGroups = (unitId?: string) => {
  const queryClient = useQueryClient();

  const { data: groups, error, isLoading } = useQuery({
    queryKey: ['whatsapp-groups', unitId],
    queryFn: async () => {
      let query = supabase
        .from('unidades_grupos_whatsapp')
        .select(`
          *,
          unidades (
            id,
            group_name,
            group_code
          )
        `)
        .order('created_at', { ascending: false });

      if (unitId) {
        query = query.eq('unit_id', unitId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform data to include unit information
      const groupsWithUnits: WhatsAppGroupWithUnidade[] = (data || []).map((group: any) => ({
        ...group,
        unidade_name: group.unidades?.group_name,
        unidade_code: group.unidades?.group_code,
      }));

      return groupsWithUnits;
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (groupData: WhatsAppGroupInsert) => {
      const { data, error } = await supabase
        .from('unidades_grupos_whatsapp')
        .insert([groupData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-groups'] });
      toast.success('Grupo WhatsApp criado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar grupo:', error);
      
      if (error.message?.includes('uq_unit_kind')) {
        toast.error('Já existe um grupo deste tipo para esta unidade');
      } else if (error.message?.includes('unidades_grupos_whatsapp_unit_id_fkey')) {
        toast.error('Unidade não encontrada');
      } else {
        toast.error('Erro ao criar grupo: ' + error.message);
      }
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string; data: WhatsAppGroupUpdate }) => {
      const { data, error } = await supabase
        .from('unidades_grupos_whatsapp')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-groups'] });
      toast.success('Grupo WhatsApp atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar grupo:', error);
      
      if (error.message?.includes('uq_unit_kind')) {
        toast.error('Já existe um grupo deste tipo para esta unidade');
      } else {
        toast.error('Erro ao atualizar grupo: ' + error.message);
      }
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('unidades_grupos_whatsapp')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-groups'] });
      toast.success('Grupo WhatsApp excluído com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao excluir grupo:', error);
      toast.error('Erro ao excluir grupo: ' + error.message);
    },
  });

  return {
    groups: groups || [],
    isLoading,
    error,
    createGroup: createGroupMutation.mutateAsync,
    updateGroup: updateGroupMutation.mutateAsync,
    deleteGroup: deleteGroupMutation.mutateAsync,
    isCreating: createGroupMutation.isPending,
    isUpdating: updateGroupMutation.isPending,
    isDeleting: deleteGroupMutation.isPending,
  };
};

export const useUnidades = () => {
  const { data: unidades, isLoading } = useQuery({
    queryKey: ['unidades-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unidades')
        .select('id, group_name, group_code')
        .eq('is_active', true)
        .order('group_code', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });

  return {
    unidades: unidades || [],
    isLoadingUnidades: isLoading,
  };
};