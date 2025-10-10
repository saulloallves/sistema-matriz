import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export type ShirtNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG';

export interface FranqueadoFilho {
  id: number;
  name: string;
  cpf: string;
  birth_date: string;
  age?: number;
  gender: 'Masculino' | 'Feminino';
  nationality?: string;
  school_grade?: string;
  shirt_number?: ShirtNumber;
  address?: string;
  number_address?: string;
  address_complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  uf?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
}

export function useFranqueadosFilhos() {
  const queryClient = useQueryClient();

  const { data: franqueadosFilhos = [], isLoading, error, refetch } = useQuery({
    queryKey: ['franqueados_filhos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('franqueados_filhos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FranqueadoFilho[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newFilho: Omit<FranqueadoFilho, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('franqueados_filhos')
        .insert([newFilho])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franqueados_filhos'] });
      toast.success('Filho de franqueado criado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar filho de franqueado: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FranqueadoFilho> & { id: number }) => {
      const { data, error } = await supabase
        .from('franqueados_filhos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franqueados_filhos'] });
      toast.success('Filho de franqueado atualizado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar filho de franqueado: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('franqueados_filhos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franqueados_filhos'] });
      toast.success('Filho de franqueado removido com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover filho de franqueado: ${error.message}`);
    },
  });

  return {
    franqueadosFilhos,
    isLoading,
    error,
    refetch,
    createFranqueadoFilho: createMutation.mutate,
    updateFranqueadoFilho: updateMutation.mutate,
    deleteFranqueadoFilho: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
