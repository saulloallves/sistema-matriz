import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface ColaboradorLoja {
  id: string;
  employee_name: string;
  cpf: string;
  email: string;
  phone: string;
  birth_date: string;
  position_id: string;
  admission_date: string;
  salary: string;
  web_password: string;
  instagram_profile?: string;
  address?: string;
  number_address?: string;
  address_complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  uf?: string;
  postal_code?: string;
  meal_voucher_active: boolean;
  meal_voucher_value?: string;
  transport_voucher_active: boolean;
  transport_voucher_value?: string;
  health_plan: boolean;
  basic_food_basket_active: boolean;
  basic_food_basket_value?: string;
  cost_assistance_active: boolean;
  cost_assistance_value?: string;
  cash_access: boolean;
  evaluation_access: boolean;
  training: boolean;
  support: boolean;
  lgpd_term: boolean;
  confidentiality_term: boolean;
  system_term: boolean;
  created_at: string;
  updated_at: string;
}

export function useColaboradoresLoja() {
  const queryClient = useQueryClient();

  const { data: colaboradores = [], isLoading, error, refetch } = useQuery({
    queryKey: ['colaboradores_loja'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colaboradores_loja')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ColaboradorLoja[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newColaborador: Omit<ColaboradorLoja, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('colaboradores_loja')
        .insert([newColaborador])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores_loja'] });
      toast.success('Colaborador de loja criado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar colaborador de loja: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ColaboradorLoja> & { id: string }) => {
      const { data, error } = await supabase
        .from('colaboradores_loja')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores_loja'] });
      toast.success('Colaborador de loja atualizado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar colaborador de loja: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('colaboradores_loja')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores_loja'] });
      toast.success('Colaborador de loja removido com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover colaborador de loja: ${error.message}`);
    },
  });

  return {
    colaboradores,
    isLoading,
    error,
    refetch,
    createColaborador: createMutation.mutate,
    updateColaborador: updateMutation.mutate,
    deleteColaborador: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
