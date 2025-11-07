import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { getNomeEstado } from '../utils/brazilRegions';

interface UnidadeIncorreta {
  id: string;
  group_name: string;
  group_code: string;
  city: string | null;
  uf: string;
  state: string;
  estadoCorreto: string;
}

interface EstatisticasCorrecao {
  totalUnidades: number;
  totalIncorretas: number;
  totalCorretas: number;
  porUF: Record<string, number>;
}

// Hook para analisar e buscar unidades com estado incorreto
export const useAnalisarEstados = () => {
  return useQuery({
    queryKey: ['analisar-estados'],
    queryFn: async (): Promise<{ incorretas: UnidadeIncorreta[]; estatisticas: EstatisticasCorrecao }> => {
      const { data: unidades, error } = await supabase
        .from('unidades')
        .select('id, group_name, group_code, city, state, uf')
        .not('uf', 'is', null)
        .order('uf');

      if (error) throw error;

      const totalUnidades = unidades?.length || 0;
      const incorretas: UnidadeIncorreta[] = [];
      const porUF: Record<string, number> = {};

      unidades?.forEach(unidade => {
        if (!unidade.uf) return;

        const estadoCorreto = getNomeEstado(unidade.uf);
        const estadoAtual = unidade.state || '';

        // Verificar se o estado atual está incorreto
        if (estadoAtual !== estadoCorreto) {
          incorretas.push({
            id: unidade.id,
            group_name: unidade.group_name,
            group_code: unidade.group_code,
            city: unidade.city,
            uf: unidade.uf,
            state: estadoAtual,
            estadoCorreto,
          });

          porUF[unidade.uf] = (porUF[unidade.uf] || 0) + 1;
        }
      });

      const estatisticas: EstatisticasCorrecao = {
        totalUnidades,
        totalIncorretas: incorretas.length,
        totalCorretas: totalUnidades - incorretas.length,
        porUF,
      };

      return { incorretas, estatisticas };
    },
  });
};

// Hook para corrigir unidades em massa
export const useCorrigirEstados = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unidades: UnidadeIncorreta[]) => {
      const updates = unidades.map(unidade =>
        supabase
          .from('unidades')
          .update({ state: unidade.estadoCorreto })
          .eq('id', unidade.id)
      );

      const results = await Promise.all(updates);
      
      // Verificar se houve erros
      const erros = results.filter(r => r.error);
      if (erros.length > 0) {
        throw new Error(`Falha ao corrigir ${erros.length} unidades`);
      }

      return { corrigidas: unidades.length };
    },
    onSuccess: () => {
      // Invalidar queries para atualizar dados
      queryClient.invalidateQueries({ queryKey: ['analisar-estados'] });
      queryClient.invalidateQueries({ queryKey: ['unidades-geolocation-region'] });
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
    },
  });
};
