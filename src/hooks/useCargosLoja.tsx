import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export type StoreRoleEnum = 
  | 'Cashier'
  | 'Cleaner'
  | 'Cleaning Assistant'
  | 'Evaluator'
  | 'HR'
  | 'Main'
  | 'Manager'
  | 'Partner'
  | 'Replenisher'
  | 'Social Media'
  | 'Stocker'
  | 'Store Assistant'
  | 'Store Leader';

export const storeRoleEnumOptions: StoreRoleEnum[] = [
  'Cashier',
  'Cleaner',
  'Cleaning Assistant',
  'Evaluator',
  'HR',
  'Main',
  'Manager',
  'Partner',
  'Replenisher',
  'Social Media',
  'Stocker',
  'Store Assistant',
  'Store Leader'
];

export interface CargoLoja {
  id: string;
  role: StoreRoleEnum;
}

const queryKey = ['cargos_loja'];

export function useCargosLoja() {
  const queryClient = useQueryClient();
  useRealtimeSubscription('cargos_loja', queryKey);

  const { data: cargos = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cargos_loja')
        .select('*')
        .order('role', { ascending: true });

      if (error) throw error;
      return data as CargoLoja[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newCargo: Omit<CargoLoja, 'id'>) => {
      const { data, error } = await supabase
        .from('cargos_loja')
        .insert([newCargo])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Cargo criado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar cargo: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CargoLoja> & { id: string }) => {
      const { data, error } = await supabase
        .from('cargos_loja')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Cargo atualizado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar cargo: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cargos_loja')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Cargo removido com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover cargo: ${error.message}`);
    },
  });

  return {
    cargos,
    isLoading,
    error,
    refetch,
    createCargo: createMutation.mutate,
    updateCargo: updateMutation.mutate,
    deleteCargo: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}