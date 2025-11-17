import { createClient } from "npm:@supabase/supabase-js@2.57.4";

// Lista de origens permitidas (desenvolvimento e produção)
const ALLOWED_ORIGINS = new Set([
  'http://localhost:8080',
  'https://matriz.girabot.com.br',
]);

const FUNCTION_VERSION = "1.3"; // Marcador de versão para depuração de cache

function corsHeadersFor(req: Request) {
  const origin = req.headers.get('Origin') ?? '';
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin', // Importante para caches/CDN
  };
}

Deno.serve(async (req: Request) => {
  console.log(`Executing get-franchisee-data-for-edit v${FUNCTION_VERSION}`); // Log da versão
  const corsHeaders = corsHeadersFor(req);

  // Responde à requisição preflight do CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    const { identifier } = await req.json();
    if (!identifier) {
      return new Response(JSON.stringify({ error: "Identificador é obrigatório." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar franqueado por CPF/RNM
    let { data: franqueado, error: franqueadoError } = await supabaseAdmin
      .from('franqueados')
      .select('*')
      .eq('cpf_rnm', identifier)
      .single();

    // Se não achou, procurar por CNPJ da unidade -> vínculo -> franqueado
    if (franqueadoError && !franqueado) {
      const { data: unidadePorCnpj } = await supabaseAdmin
        .from('unidades')
        .select('id')
        .eq('cnpj', identifier)
        .single();

      if (unidadePorCnpj) {
        const { data: vinculo } = await supabaseAdmin
          .from('franqueados_unidades')
          .select('franqueado_id')
          .eq('unidade_id', unidadePorCnpj.id)
          .limit(1)
          .single();

        if (vinculo) {
          const { data: franqueadoPorVinculo, error: franqueadoPorVinculoError } =
            await supabaseAdmin
              .from('franqueados')
              .select('*')
              .eq('id', vinculo.franqueado_id)
              .single();

          if (franqueadoPorVinculoError) throw franqueadoPorVinculoError;
          franqueado = franqueadoPorVinculo;
        }
      }
    }

    if (!franqueado) {
      return new Response(JSON.stringify({ found: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Busca todas as unidades vinculadas, especificando o relacionamento para evitar ambiguidade
    const { data: vinculos, error: vinculosError } = await supabaseAdmin
      .from('franqueados_unidades')
      .select('unidades!fk_franqueados_unidades_unidade_id (*)') // Especifica qual FK usar
      .eq('franqueado_id', franqueado.id);

    if (vinculosError) throw vinculosError;

    const linkedUnits = vinculos?.map((v: any) => v.unidades) ?? [];

    return new Response(
      JSON.stringify({
        version: FUNCTION_VERSION, // Retorna a versão na resposta
        found: true,
        franchiseeData: franqueado,
        unitsData: linkedUnits,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Erro na função:', error);
    return new Response(JSON.stringify({ error: error?.message ?? 'Erro interno' }), {
      headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
