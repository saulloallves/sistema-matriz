import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface FranqueadoParaGeracaoSenha {
  franqueado_id: string;
  franqueado_nome: string;
  unidade_group_code: number;
}

const queryKey = ['franqueados-para-geracao-senha'];

export function useGeracaoSenhas() {
  const queryClient = useQueryClient();

  const { 
    data: franqueados = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery<FranqueadoParaGeracaoSenha[]>({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_franqueados_para_geracao_senha');
      if (error) throw error;
      return data || [];
    },
  });

  const { mutate: gerarSenha, isPending: isGerandoSenha } = useMutation({
    mutationFn: async (franqueadoId: string) => {
      const { data, error } = await supabase.rpc('gerar_senha_para_franqueado', {
        p_franqueado_id: franqueadoId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (success) => {
      if (success) {
        toast.success('Senha gerada com sucesso!');
        queryClient.invalidateQueries({ queryKey });
      } else {
        toast.error('Não foi possível gerar a senha. Verifique se o franqueado tem uma unidade vinculada.');
      }
    },
    onError: (error: any) => {
      toast.error(`Erro ao gerar senha: ${error.message}`);
    },
  });

  const { mutate: gerarTodasAsSenhas, isPending: isGerandoTodas } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('gerar_senhas_franqueados_em_lote');
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      const { sucessos, falhas } = data;
      if (sucessos > 0) {
        toast.success(`${sucessos} senha(s) gerada(s) com sucesso!`);
      }
      if (falhas > 0) {
        toast.error(`${falhas} falha(s) ao gerar senhas. Verifique os vínculos das unidades.`);
      }
      if (sucessos === 0 && falhas === 0) {
        toast.info('Nenhuma senha para gerar.');
      }
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      toast.error(`Erro ao gerar senhas em lote: ${error.message}`);
    },
  });

  return {
    franqueados,
    isLoading,
    error,
    refetch,
    gerarSenha,
    isGerandoSenha,
    gerarTodasAsSenhas,
    isGerandoTodas,
  };
}