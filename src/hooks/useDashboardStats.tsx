/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { getRegiaoPorUF, getCorRegiao, getNomeEstado, type RegiaoNome } from '../utils/brazilRegions';

interface DashboardStats {
  totalUnidades: number;
  totalFranqueados: number;
  unidadesAtivas: number;
  novasUnidadesMes: number;
  taxaConversao: number;
  franqueadosComUnidades: number;
}

interface ChartData {
  month: string;
  unidades: number;
  franqueados: number;
}

interface Activity {
  id: string;
  type: 'franqueado' | 'unidade' | 'sistema' | 'performance';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'info';
}

interface UnitPerformance {
  id: string;
  name: string;
  city: string;
  state: string;
  model: string;
  phase: string;
  isActive: boolean;
  trend: 'up' | 'down' | 'stable';
  score: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [unidadesResponse, franqueadosResponse, vinculosResponse] = await Promise.all([
        supabase.from('unidades').select('*'),
        supabase.from('franqueados').select('*'),
        supabase.from('franqueados_unidades').select('franqueado_id, created_at').order('created_at', { ascending: false }),
      ]);

      if (unidadesResponse.error) throw unidadesResponse.error;
      if (franqueadosResponse.error) throw franqueadosResponse.error;
      if (vinculosResponse.error) throw vinculosResponse.error;

      const unidades = unidadesResponse.data || [];
      const franqueados = franqueadosResponse.data || [];
      const vinculos = vinculosResponse.data || [];

      // Franqueados únicos com unidades vinculadas
      const franqueadosComUnidades = new Set(vinculos.map(v => v.franqueado_id)).size;
      
      // Novos vínculos criados no último mês
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const novasUnidadesMes = vinculos.filter(v => 
        new Date(v.created_at) >= oneMonthAgo
      ).length;

      // Taxa de vinculação real (franqueados com unidades / total de franqueados)
      const taxaConversao = franqueados.length > 0 ? 
        Math.round((franqueadosComUnidades / franqueados.length) * 100) : 0;

      return {
        totalUnidades: unidades.length,
        totalFranqueados: franqueados.length,
        unidadesAtivas: franqueadosComUnidades, // Mostra franqueados com unidades
        novasUnidadesMes,
        taxaConversao,
        franqueadosComUnidades,
      };
    },
  });
};

export const useUnidadesDistribution = () => {
  return useQuery({
    queryKey: ['unidades-distribution'],
    queryFn: async (): Promise<ChartData[]> => {
      const { data: unidades, error } = await supabase
        .from('unidades')
        .select('store_model')
        .order('store_model');

      if (error) throw error;

      // Agrupar por modelo de loja
      const distribution = (unidades || []).reduce((acc, unidade) => {
        const model = unidade.store_model || 'Não informado';
        acc[model] = (acc[model] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Converter para formato do gráfico
      return Object.entries(distribution).map(([model, count]) => ({
        month: model, // Reutilizando campo month para modelo
        unidades: count as number,
        franqueados: 0, // Não usado neste contexto
      }));
    },
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async (): Promise<Activity[]> => {
      // Get recent activities from different sources
      const [franqueadosResponse, vinculosResponse, proLaboreResponse] = await Promise.all([
        supabase.from('franqueados').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('franqueados_unidades').select(`
          *, 
          franqueados!franqueado_id(full_name), 
          unidades!unidade_id(group_name, city, state)
        `).order('created_at', { ascending: false }).limit(3),
        supabase.from('franqueados').select('full_name, prolabore_value, updated_at')
          .not('prolabore_value', 'is', null)
          .order('updated_at', { ascending: false }).limit(2),
      ]);

      const activities: Activity[] = [];

      // Add recent franqueados
      if (franqueadosResponse.data) {
        franqueadosResponse.data.forEach((franqueado) => {
          activities.push({
            id: `franqueado-${franqueado.id}`,
            type: 'franqueado',
            title: `Novo franqueado: ${franqueado.full_name}`,
            description: `Cadastrado como ${franqueado.owner_type}`,
            timestamp: new Date(franqueado.created_at),
            status: 'success',
          });
        });
      }

      // Add recent vinculos
      if (vinculosResponse.data) {
        vinculosResponse.data.forEach((vinculo) => {
          activities.push({
            id: `vinculo-${vinculo.id}`,
            type: 'unidade',
            title: `Nova vinculação: ${vinculo.franqueados.full_name}`,
            description: `Vinculado à ${vinculo.unidades.group_name} - ${vinculo.unidades.city}, ${vinculo.unidades.state}`,
            timestamp: new Date(vinculo.created_at),
            status: 'info',
          });
        });
      }

      // Add recent pro-labore updates
      if (proLaboreResponse.data) {
        proLaboreResponse.data.forEach((franqueado) => {
          activities.push({
            id: `prolabore-${franqueado.full_name}-${franqueado.updated_at}`,
            type: 'performance',
            title: `Pró-labore atualizado: ${franqueado.full_name}`,
            description: `Valor: R$ ${Number(franqueado.prolabore_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            timestamp: new Date(franqueado.updated_at),
            status: 'success',
          });
        });
      }

      // Sort by timestamp and return latest 8
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 8);
    },
  });
};

export const useTopUnits = () => {
  return useQuery({
    queryKey: ['top-units'],
    queryFn: async (): Promise<UnitPerformance[]> => {
      // Buscar unidades primeiro
      const { data: unidades, error: unidadesError } = await supabase
        .from('unidades')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (unidadesError) {
        console.error('Erro ao buscar unidades:', unidadesError);
        throw unidadesError;
      }

      if (!unidades || unidades.length === 0) {
        console.log('Nenhuma unidade encontrada');
        return [];
      }

      // Buscar vínculos para as unidades encontradas
      const unidadeIds = unidades.map(u => u.id);
      const { data: vinculos, error: vinculosError } = await supabase
        .from('franqueados_unidades')
        .select('unidade_id, franqueado_id')
        .in('unidade_id', unidadeIds);

      if (vinculosError) {
        console.error('Erro ao buscar vínculos:', vinculosError);
      }

      // Mapear vínculos por unidade
      const vinculosPorUnidade = (vinculos || []).reduce((acc, v) => {
        if (!acc[v.unidade_id]) acc[v.unidade_id] = [];
        acc[v.unidade_id].push(v);
        return acc;
      }, {} as Record<string, any[]>);

      return unidades.map((unidade): UnitPerformance => {
        const vinculosCount = vinculosPorUnidade[unidade.id]?.length || 0;
        const daysSinceCreation = Math.floor((Date.now() - new Date(unidade.created_at).getTime()) / (1000 * 60 * 60 * 24));
        
        // Determinar trend baseado em métricas reais
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (vinculosCount > 1) trend = 'up';
        else if (unidade.store_phase === 'operacao') trend = 'up';
        else if (daysSinceCreation > 180) trend = 'down';

        return {
          id: unidade.id,
          name: unidade.group_name,
          city: unidade.city || 'Cidade não informada',
          state: unidade.state || 'UF',
          model: unidade.store_model,
          phase: unidade.store_phase,
          isActive: unidade.is_active,
          trend,
          score: vinculosCount,
        };
      });
    },
  });
};

// ========================================
// HOOK: GEOLOCALIZAÇÃO DE UNIDADES
// ========================================

export interface CityData {
  cidade: string;
  quantidade: number;
  unidades: UnidadeBasic[];
}

export interface GeolocationData {
  estado: string;
  uf: string;
  quantidade: number;
  cidades: CityData[];
}

export interface UnidadeBasic {
  id: string;
  group_name: string;
  group_code: number;
  store_model: string;
  store_phase: string;
  city: string;
  address: string;
  is_active: boolean;
}

// ========================================
// TIPOS: ESTRUTURA DE REGIÕES
// ========================================

export interface RegionData {
  regiao: RegiaoNome;
  quantidade: number;
  estados: GeolocationData[];
  cor: string;
}

export interface GeolocationStats {
  totalUnidades: number;
  unidadesComLocalizacao: number;
  unidadesSemLocalizacao: number;
  totalEstados: number;
  totalRegioes: number;
}

export const useUnidadesGeolocation = () => {
  return useQuery({
    queryKey: ['unidades-geolocation'],
    queryFn: async (): Promise<GeolocationData[]> => {
      const { data: unidades, error } = await supabase
        .from('unidades')
        .select('id, group_name, group_code, store_model, store_phase, city, state, uf, address, is_active')
        .order('state');

      if (error) throw error;

      // Filtrar unidades sem estado definido
      const unidadesValidas = (unidades || []).filter(u => u.state && u.uf);

      // Agrupar por estado
      const porEstado = unidadesValidas.reduce((acc, unidade) => {
        const estado = unidade.state!;
        const uf = unidade.uf!;
        const cidade = unidade.city || 'Cidade não informada';

        if (!acc[uf]) {
          acc[uf] = {
            estado,
            uf,
            quantidade: 0,
            cidadesMap: {} as Record<string, CityData>,
          };
        }

        acc[uf].quantidade++;

        // Agrupar por cidade
        if (!acc[uf].cidadesMap[cidade]) {
          acc[uf].cidadesMap[cidade] = {
            cidade,
            quantidade: 0,
            unidades: [],
          };
        }

        acc[uf].cidadesMap[cidade].quantidade++;
        acc[uf].cidadesMap[cidade].unidades.push({
          id: unidade.id,
          group_name: unidade.group_name,
          group_code: unidade.group_code,
          store_model: unidade.store_model,
          store_phase: unidade.store_phase,
          city: cidade,
          address: unidade.address || 'Endereço não informado',
          is_active: unidade.is_active,
        });

        return acc;
      }, {} as Record<string, { estado: string; uf: string; quantidade: number; cidadesMap: Record<string, CityData> }>);

      // Converter para array e ordenar por quantidade (maior para menor)
      return Object.values(porEstado)
        .map(item => ({
          estado: item.estado,
          uf: item.uf,
          quantidade: item.quantidade,
          cidades: Object.values(item.cidadesMap).sort((a, b) => b.quantidade - a.quantidade) as CityData[],
        }))
        .sort((a, b) => b.quantidade - a.quantidade);
    },
  });
};

// ========================================
// HOOK: GEOLOCALIZAÇÃO POR REGIÃO
// ========================================

export const useUnidadesGeolocationByRegion = () => {
  return useQuery({
    queryKey: ['unidades-geolocation-region'],
    queryFn: async (): Promise<{ regioes: RegionData[]; stats: GeolocationStats }> => {
      const { data: unidades, error } = await supabase
        .from('unidades')
        .select('id, group_name, group_code, store_model, store_phase, city, state, uf, address, is_active')
        .order('state');

      if (error) throw error;

      const totalUnidades = unidades?.length || 0;
      
      // Filtrar unidades sem estado definido
      const unidadesValidas = (unidades || []).filter(u => u.state && u.uf);
      const unidadesSemLocalizacao = totalUnidades - unidadesValidas.length;

      // Primeiro: agrupar por estado
      const porEstado = unidadesValidas.reduce((acc, unidade) => {
        const uf = unidade.uf!;
        const estado = getNomeEstado(uf); // Obter nome completo do estado a partir da UF
        const cidade = unidade.city || 'Cidade não informada';

        if (!acc[uf]) {
          acc[uf] = {
            estado,
            uf,
            quantidade: 0,
            cidadesMap: {} as Record<string, CityData>,
          };
        }

        acc[uf].quantidade++;

        // Agrupar por cidade
        if (!acc[uf].cidadesMap[cidade]) {
          acc[uf].cidadesMap[cidade] = {
            cidade,
            quantidade: 0,
            unidades: [],
          };
        }

        acc[uf].cidadesMap[cidade].quantidade++;
        acc[uf].cidadesMap[cidade].unidades.push({
          id: unidade.id,
          group_name: unidade.group_name,
          group_code: unidade.group_code,
          store_model: unidade.store_model,
          store_phase: unidade.store_phase,
          city: cidade,
          address: unidade.address || 'Endereço não informado',
          is_active: unidade.is_active,
        });

        return acc;
      }, {} as Record<string, { estado: string; uf: string; quantidade: number; cidadesMap: Record<string, CityData> }>);

      // Converter estados para array com GeolocationData
      const estadosData: GeolocationData[] = Object.values(porEstado).map(item => ({
        estado: item.estado,
        uf: item.uf,
        quantidade: item.quantidade,
        cidades: Object.values(item.cidadesMap).sort((a, b) => b.quantidade - a.quantidade) as CityData[],
      }));

      // Segundo: agrupar estados por região
      const porRegiao = estadosData.reduce((acc, estadoData) => {
        const regiao = getRegiaoPorUF(estadoData.uf);
        
        if (!regiao) return acc; // Pular se região não encontrada

        if (!acc[regiao]) {
          acc[regiao] = {
            regiao,
            quantidade: 0,
            estados: [],
            cor: getCorRegiao(regiao),
          };
        }

        acc[regiao].quantidade += estadoData.quantidade;
        acc[regiao].estados.push(estadoData);

        return acc;
      }, {} as Record<RegiaoNome, RegionData>);

      // Ordenar estados dentro de cada região
      Object.values(porRegiao).forEach(regiao => {
        regiao.estados.sort((a, b) => b.quantidade - a.quantidade);
      });

      // Converter para array e ordenar por quantidade
      const regioesArray = Object.values(porRegiao).sort((a, b) => b.quantidade - a.quantidade);

      // Calcular estatísticas
      const totalEstados = new Set(estadosData.map(e => e.uf)).size;
      const totalRegioes = regioesArray.length;

      const stats: GeolocationStats = {
        totalUnidades,
        unidadesComLocalizacao: unidadesValidas.length,
        unidadesSemLocalizacao,
        totalEstados,
        totalRegioes,
      };

      const result = {
        regioes: regioesArray,
        stats,
      };

      // Debug log
      console.log('useUnidadesGeolocationByRegion - Result:', {
        totalUnidades,
        unidadesValidas: unidadesValidas.length,
        unidadesSemLocalizacao,
        regioesCount: regioesArray.length,
        regioes: regioesArray.map(r => ({ nome: r.regiao, quantidade: r.quantidade, estados: r.estados.length })),
      });

      return result;
    },
  });
};
