import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface UnidadeNormalizacao {
  group_code: number;
  nome_atual: string;
  nome_correto: string;
  id_unidades: string;
  id_unidades_old: string;
}

export interface ResultadoNormalizacao {
  group_code: number;
  nome_anterior: string;
  nome_novo: string;
  sucesso: boolean;
}

export const useNormalizacaoUnidades = () => {
  const queryClient = useQueryClient();

  // Query para buscar unidades que precisam ser normalizadas
  const {
    data: unidadesParaNormalizacao,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['unidades-normalizacao'],
    queryFn: async (): Promise<UnidadeNormalizacao[]> => {
      const { data, error } = await supabase.rpc('get_unidades_para_normalizacao');
      
      if (error) {
        console.error('Erro ao buscar unidades para normalização:', error);
        throw new Error(error.message);
      }
      
      return data || [];
    },
  });

  // Mutation para normalizar uma unidade específica
  const normalizarUnidadeMutation = useMutation({
    mutationFn: async (groupCode: number): Promise<boolean> => {
      const { data, error } = await supabase.rpc('normalizar_nome_unidade', {
        p_group_code: groupCode
      });
      
      if (error) {
        console.error('Erro ao normalizar unidade:', error);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (sucesso, groupCode) => {
      if (sucesso) {
        toast.success(`Unidade ${groupCode} normalizada com sucesso!`);
        queryClient.invalidateQueries({ queryKey: ['unidades-normalizacao'] });
      } else {
        toast.error(`Falha ao normalizar unidade ${groupCode}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Mutation para normalizar todas as unidades
  const normalizarTodasMutation = useMutation({
    mutationFn: async (): Promise<ResultadoNormalizacao[]> => {
      const { data, error } = await supabase.rpc('normalizar_todas_unidades');
      
      if (error) {
        console.error('Erro ao normalizar todas as unidades:', error);
        throw new Error(error.message);
      }
      
      // Converter JSON para o tipo esperado
      return (data as any[])?.map((item: any) => ({
        group_code: item.group_code,
        nome_anterior: item.nome_anterior,
        nome_novo: item.nome_novo,
        sucesso: item.sucesso
      })) || [];
    },
    onSuccess: (resultados) => {
      console.log('Resultados da normalização:', resultados);
      
      const sucessos = resultados.filter(r => r.sucesso).length;
      const falhas = resultados.filter(r => !r.sucesso).length;
      
      if (falhas === 0) {
        toast.success(`${sucessos} unidades normalizadas com sucesso!`);
      } else {
        toast.error(`${sucessos} sucessos, ${falhas} falhas na normalização`);
        
        // Log detalhado das falhas
        const falhasDetalhes = resultados.filter(r => !r.sucesso);
        console.log('Falhas detalhadas:', falhasDetalhes);
      }
      
      queryClient.invalidateQueries({ queryKey: ['unidades-normalizacao'] });
    },
    onError: (error: Error) => {
      console.error('Erro na mutation normalizar todas:', error);
      toast.error(`Erro: ${error.message}`);
    },
  });

  return {
    unidadesParaNormalizacao: unidadesParaNormalizacao || [],
    isLoading,
    error,
    refetch,
    normalizarUnidade: normalizarUnidadeMutation.mutate,
    normalizarTodas: normalizarTodasMutation.mutate,
    isNormalizandoUnidade: normalizarUnidadeMutation.isPending,
    isNormalizandoTodas: normalizarTodasMutation.isPending,
  };
};