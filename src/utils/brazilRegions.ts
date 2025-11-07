/**
 * Mapeamento de Regiões do Brasil e Utilidades
 * 
 * Este arquivo contém as constantes e funções para trabalhar com
 * a divisão regional do Brasil (5 regiões, 27 UFs)
 */

// Mapeamento de UFs por Região
export const REGIOES_BRASIL = {
  Norte: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'],
  Nordeste: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  'Centro-Oeste': ['DF', 'GO', 'MS', 'MT'],
  Sudeste: ['ES', 'MG', 'RJ', 'SP'],
  Sul: ['PR', 'RS', 'SC'],
} as const;

// Tipo para as regiões
export type RegiaoNome = keyof typeof REGIOES_BRASIL;

// Paleta de cores por região (consistente com o tema do sistema)
export const CORES_REGIOES: Record<RegiaoNome, string> = {
  Norte: '#4caf50',        // Verde
  Nordeste: '#E3A024',     // Amarelo/Dourado (cor principal do sistema)
  'Centro-Oeste': '#ff9800', // Laranja
  Sudeste: '#2196f3',      // Azul
  Sul: '#9c27b0',          // Roxo
};

// Nomes completos dos estados por UF
export const ESTADOS_NOMES: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
};

/**
 * Retorna a região de uma UF
 * @param uf - Sigla do estado (ex: 'SP', 'RJ')
 * @returns Nome da região (ex: 'Sudeste') ou null se não encontrado
 */
export function getRegiaoPorUF(uf: string): RegiaoNome | null {
  const ufUpper = uf.toUpperCase();
  
  for (const [regiao, ufs] of Object.entries(REGIOES_BRASIL)) {
    if ((ufs as readonly string[]).includes(ufUpper)) {
      return regiao as RegiaoNome;
    }
  }
  
  return null;
}

/**
 * Retorna a cor de uma região
 * @param regiao - Nome da região
 * @returns Código hexadecimal da cor
 */
export function getCorRegiao(regiao: RegiaoNome): string {
  return CORES_REGIOES[regiao];
}

/**
 * Retorna o nome completo de um estado pela UF
 * @param uf - Sigla do estado
 * @returns Nome completo ou a própria UF se não encontrado
 */
export function getNomeEstado(uf: string): string {
  return ESTADOS_NOMES[uf.toUpperCase()] || uf;
}

/**
 * Retorna todas as UFs de uma região
 * @param regiao - Nome da região
 * @returns Array de UFs
 */
export function getUFsPorRegiao(regiao: RegiaoNome): readonly string[] {
  return REGIOES_BRASIL[regiao];
}

/**
 * Retorna lista de todas as regiões
 * @returns Array com nomes das regiões
 */
export function getTodasRegioes(): RegiaoNome[] {
  return Object.keys(REGIOES_BRASIL) as RegiaoNome[];
}

/**
 * Valida se uma UF existe
 * @param uf - Sigla do estado
 * @returns true se a UF é válida
 */
export function isUFValida(uf: string): boolean {
  return uf.toUpperCase() in ESTADOS_NOMES;
}
