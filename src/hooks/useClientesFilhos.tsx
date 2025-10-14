import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export type ShirtNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG';

export interface ClienteFilho {
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

const queryKey = ['clientes_filhos'];

export function useClientesFilhos() {
  const queryClient = useQueryClient();
  useRealtimeSubscription('clientes_filhos', queryKey);

  const { data: clientesFilhos = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes_filhos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClienteFilho[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newFilho: Omit<ClienteFilho, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('clientes_filhos')
        .insert([newFilho])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Filho de cliente criado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar filho de cliente: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClienteFilho> & { id: number }) => {
      const { data, error } = await supabase
        .from('clientes_filhos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Filho de cliente atualizado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar filho de cliente: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('clientes_filhos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Filho de cliente removido com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover filho de cliente: ${error.message}`);
    },
  });

  return {
    clientesFilhos,
    isLoading,
    error,
    refetch,
    createClienteFilho: createMutation.mutate,
    updateClienteFilho: updateMutation.mutate,
    deleteClienteFilho: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}