import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getRegiaoPorUF, getCorRegiao, getNomeEstado, RegiaoNome } from '@/utils/brazilRegions';

// Tipos básicos para franqueados usados no agrupamento
export interface FranqueadoBasic {
  id: string;
  full_name: string;
  owner_type: string | null;
  city: string | null;
  state: string | null;
  uf: string | null;
  address: string | null;
  is_in_contract: boolean | null;
}

export interface FranqueadoCityData {
  cidade: string;
  quantidade: number;
  franqueados: FranqueadoBasic[];
}

export interface FranqueadoGeolocationData {
  estado: string; // nome completo
  uf: string;
  quantidade: number;
  cidades: FranqueadoCityData[];
}

export interface FranqueadoRegionData {
  regiao: RegiaoNome;
  quantidade: number;
  estados: FranqueadoGeolocationData[];
  cor: string;
}

export interface FranqueadoGeolocationStats {
  totalFranqueados: number;
  franqueadosComLocalizacao: number;
  franqueadosSemLocalizacao: number;
  totalEstados: number;
  totalRegioes: number;
}

export const useFranqueadosGeolocationByRegion = () => {
  return useQuery({
    queryKey: ['franqueados-geolocation-region'],
    queryFn: async (): Promise<{ regioes: FranqueadoRegionData[]; stats: FranqueadoGeolocationStats }> => {
      const { data, error } = await supabase
        .from('franqueados')
        .select('id, full_name, owner_type, city, state, uf, address, is_in_contract');

      if (error) throw error;

      const franqueados = data || [];
      const totalFranqueados = franqueados.length;

      // Filtrar registros com UF válida
      const franqueadosValidos = franqueados.filter(f => f.uf && f.uf.trim() !== '');
      const franqueadosSemLocalizacao = totalFranqueados - franqueadosValidos.length;

      // Agrupar por estado (normalizando pelo UF)
      const porEstado = franqueadosValidos.reduce((acc, f) => {
        const uf = f.uf!.toUpperCase();
        const estadoNome = getNomeEstado(uf); // nome correto do estado
        const cidade = (f.city || 'Cidade não informada').trim();

        if (!acc[uf]) {
          acc[uf] = {
            estado: estadoNome,
            uf,
            quantidade: 0,
            cidadesMap: {} as Record<string, FranqueadoCityData>,
          };
        }

        acc[uf].quantidade++;

        if (!acc[uf].cidadesMap[cidade]) {
          acc[uf].cidadesMap[cidade] = {
            cidade,
            quantidade: 0,
            franqueados: [],
          };
        }

        acc[uf].cidadesMap[cidade].quantidade++;
        acc[uf].cidadesMap[cidade].franqueados.push({
          id: f.id,
          full_name: f.full_name,
          owner_type: f.owner_type,
          city: f.city,
          state: f.state,
          uf: f.uf,
          address: f.address,
          is_in_contract: f.is_in_contract,
        });

        return acc;
      }, {} as Record<string, { estado: string; uf: string; quantidade: number; cidadesMap: Record<string, FranqueadoCityData> }>);

      const estadosArray: FranqueadoGeolocationData[] = (Object.values(porEstado) as Array<{
        estado: string; uf: string; quantidade: number; cidadesMap: Record<string, FranqueadoCityData>
      }>).map((item) => {
        const cidades = Object.values(item.cidadesMap);
        return {
          estado: item.estado,
          uf: item.uf,
          quantidade: item.quantidade,
            cidades: cidades.sort((a, b) => b.quantidade - a.quantidade),
        };
      });

      // Agrupar por região
      const porRegiao = estadosArray.reduce((acc, estadoData) => {
        const regiao = getRegiaoPorUF(estadoData.uf);
        if (!regiao) return acc;

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
      }, {} as Record<RegiaoNome, FranqueadoRegionData>);

      // Ordenar estados em cada região e regiões por quantidade
      Object.values(porRegiao).forEach(r => r.estados.sort((a, b) => b.quantidade - a.quantidade));
      const regioesArray = Object.values(porRegiao).sort((a, b) => b.quantidade - a.quantidade);

      const stats: FranqueadoGeolocationStats = {
        totalFranqueados,
        franqueadosComLocalizacao: franqueadosValidos.length,
        franqueadosSemLocalizacao,
        totalEstados: new Set(estadosArray.map(e => e.uf)).size,
        totalRegioes: regioesArray.length,
      };

      return { regioes: regioesArray, stats };
    },
  });
};
