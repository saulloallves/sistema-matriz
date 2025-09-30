import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface ContatoNormalizacao {
  franqueado_id: string;
  nome_franqueado: string;
  contato_atual: string;
  contato_normalizado: string;
}

interface ResultadoNormalizacao {
  franqueado_id: string;
  nome_franqueado: string;
  contato_anterior: string;
  contato_novo: string;
  sucesso: boolean;
}

export function useNormalizacaoContatos() {
  const queryClient = useQueryClient();

  // Buscar contatos que precisam de normalização
  const { 
    data: contatosParaNormalizacao = [], 
    isLoading,
    error,
    refetch 
  } = useQuery<ContatoNormalizacao[]>({
    queryKey: ['contatos-para-normalizacao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_contatos_para_normalizacao');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Normalizar um contato específico
  const { mutateAsync: normalizarContato, isPending: isNormalizandoContato } = useMutation({
    mutationFn: async (franqueadoId: string) => {
      const { data, error } = await supabase
        .rpc('normalizar_contato_franqueado', { p_franqueado_id: franqueadoId });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, franqueadoId) => {
      if (data) {
        toast.success('Contato normalizado com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['contatos-para-normalizacao'] });
        queryClient.invalidateQueries({ queryKey: ['franqueados'] });
      } else {
        toast.error('Contato já está normalizado ou não encontrado');
      }
    },
    onError: (error: any) => {
      console.error('Erro ao normalizar contato:', error);
      toast.error(error.message || 'Erro ao normalizar contato');
    },
  });

  // Normalizar todos os contatos
  const { mutateAsync: normalizarTodos, isPending: isNormalizandoTodas } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .rpc('normalizar_todos_contatos');
      
      if (error) throw error;
      return (data || []) as unknown as ResultadoNormalizacao[];
    },
    onSuccess: (resultados: ResultadoNormalizacao[]) => {
      const sucessos = resultados.filter(r => r.sucesso).length;
      const erros = resultados.filter(r => !r.sucesso).length;
      
      if (sucessos > 0) {
        toast.success(`${sucessos} contato(s) normalizado(s) com sucesso!`);
      }
      
      if (erros > 0) {
        toast.error(`${erros} erro(s) ao normalizar contatos`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['contatos-para-normalizacao'] });
      queryClient.invalidateQueries({ queryKey: ['franqueados'] });
    },
    onError: (error: any) => {
      console.error('Erro ao normalizar todos os contatos:', error);
      toast.error(error.message || 'Erro ao normalizar contatos');
    },
  });

  return {
    contatosParaNormalizacao,
    isLoading,
    error,
    refetch,
    normalizarContato,
    isNormalizandoContato,
    normalizarTodos,
    isNormalizandoTodas,
  };
}
