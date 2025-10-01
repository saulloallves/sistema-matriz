import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface PessoaNormalizacao {
  id: string;
  tabela: string;
  nome_atual: string;
  nome_normalizado: string;
}

export interface ResultadoNormalizacaoPessoas {
  id: string;
  tabela: string;
  nome_anterior: string;
  nome_novo: string;
  sucesso: boolean;
  erro?: string;
}

export const useNormalizacaoPessoas = () => {
  const queryClient = useQueryClient();

  // Query para buscar nomes que precisam ser normalizados
  const {
    data: pessoasParaNormalizacao,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['pessoas-normalizacao'],
    queryFn: async (): Promise<PessoaNormalizacao[]> => {
      console.log('🔍 Buscando nomes para normalização...');
      const { data, error } = await supabase.rpc('get_nomes_para_normalizacao');
      
      if (error) {
        console.error('❌ Erro ao buscar nomes para normalização:', error);
        console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
        toast.error(`Erro ao buscar nomes: ${error.message}`);
        throw new Error(error.message);
      }
      
      console.log(`✅ Encontrados ${data?.length || 0} nomes para normalizar`);
      return data || [];
    },
    retry: false,
  });

  // Mutation para normalizar um nome específico
  const normalizarPessoaMutation = useMutation({
    mutationFn: async ({ id, tabela }: { id: string; tabela: string }): Promise<boolean> => {
      const { data, error } = await supabase.rpc('normalizar_nome_pessoa', {
        p_id: id,
        p_tabela: tabela
      });
      
      if (error) {
        console.error('Erro ao normalizar nome:', error);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (sucesso, variables) => {
      if (sucesso) {
        toast.success(`Nome normalizado com sucesso!`);
        queryClient.invalidateQueries({ queryKey: ['pessoas-normalizacao'] });
      } else {
        toast.error(`Falha ao normalizar nome`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Mutation para normalizar todos os nomes
  const normalizarTodosMutation = useMutation({
    mutationFn: async (): Promise<ResultadoNormalizacaoPessoas[]> => {
      const { data, error } = await supabase.rpc('normalizar_todos_nomes');
      
      if (error) {
        console.error('Erro ao normalizar todos os nomes:', error);
        throw new Error(error.message);
      }
      
      // Converter JSON para o tipo esperado
      return (data as any[])?.map((item: any) => ({
        id: item.id,
        tabela: item.tabela,
        nome_anterior: item.nome_anterior,
        nome_novo: item.nome_novo,
        sucesso: item.sucesso,
        erro: item.erro
      })) || [];
    },
    onSuccess: (resultados) => {
      console.log('Resultados da normalização:', resultados);
      
      const sucessos = resultados.filter(r => r.sucesso).length;
      const falhas = resultados.filter(r => !r.sucesso).length;
      
      if (falhas === 0) {
        toast.success(`${sucessos} nomes normalizados com sucesso!`);
      } else {
        toast.error(`${sucessos} sucessos, ${falhas} falhas na normalização`);
        
        // Log detalhado das falhas
        const falhasDetalhes = resultados.filter(r => !r.sucesso);
        console.log('Falhas detalhadas:', falhasDetalhes);
      }
      
      queryClient.invalidateQueries({ queryKey: ['pessoas-normalizacao'] });
    },
    onError: (error: Error) => {
      console.error('Erro na mutation normalizar todos:', error);
      toast.error(`Erro: ${error.message}`);
    },
  });

  return {
    pessoasParaNormalizacao: pessoasParaNormalizacao || [],
    isLoading,
    error,
    refetch,
    normalizarPessoa: normalizarPessoaMutation.mutate,
    normalizarTodos: normalizarTodosMutation.mutate,
    isNormalizandoPessoa: normalizarPessoaMutation.isPending,
    isNormalizandoTodos: normalizarTodosMutation.isPending,
  };
};
