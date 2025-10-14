import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export interface ColaboradorInterno {
  id: string;
  employee_name: string;
  cpf: string;
  email: string;
  phone: string;
  birth_date: string;
  position_id?: string | null;
  position_name?: string | null;
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

const queryKey = ['colaboradores_interno'];

export function useColaboradoresInterno() {
  const queryClient = useQueryClient();
  useRealtimeSubscription('colaboradores_interno', queryKey);

  const { data: colaboradores = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colaboradores_interno')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ColaboradorInterno[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newColaborador: Omit<ColaboradorInterno, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('colaboradores_interno')
        .insert([newColaborador])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Colaborador interno criado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar colaborador interno: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ColaboradorInterno> & { id: string }) => {
      const { data, error } = await supabase
        .from('colaboradores_interno')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Colaborador interno atualizado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar colaborador interno: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('colaboradores_interno')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Colaborador interno removido com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover colaborador interno: ${error.message}`);
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