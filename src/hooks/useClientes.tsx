import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export interface Cliente {
  id: number;
  full_name: string;
  cpf_rnm: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  nationality?: string;
  address?: string;
  number_address?: string;
  address_complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  uf?: string;
  postal_code?: string;
  discovery_source?: string;
  created_at: string;
  updated_at: string;
}

const queryKey = ['clientes'];

export function useClientes() {
  const queryClient = useQueryClient();
  useRealtimeSubscription('clientes', queryKey);

  const { data: clientes = [], isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Cliente[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newCliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('clientes')
        .insert([newCliente])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Cliente criado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar cliente: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Cliente> & { id: number }) => {
      const { data, error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Cliente atualizado com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar cliente: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Cliente removido com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover cliente: ${error.message}`);
    },
  });

  return {
    clientes,
    isLoading,
    error,
    refetch,
    createCliente: createMutation.mutate,
    updateCliente: updateMutation.mutate,
    deleteCliente: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}