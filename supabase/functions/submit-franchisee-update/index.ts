import { createClient } from "npm:@supabase/supabase-js@2.57.4";

// Lista de origens permitidas (desenvolvimento e produção)
const ALLOWED_ORIGINS = new Set([
  'http://localhost:8080',
  'https://matriz.girabot.com.br',
]);

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

    const { franchiseeData, unitData } = await req.json();
    if (!franchiseeData) {
      return new Response(JSON.stringify({ error: "Dados do franqueado são obrigatórios." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Combina os dados do franqueado e da unidade em um único objeto para o form_data
    const formData = {
      ...franchiseeData,
      ...unitData, // Se unitData for undefined, não afeta o resultado
    };

    // Cria a nova solicitação de onboarding
    const { data: newRequest, error } = await supabaseAdmin
      .from('onboarding_requests')
      .insert({
        form_data: formData,
        franchisee_cpf: franchiseeData.cpf_rnm,
        franchisee_email: franchiseeData.email,
        unit_cnpj: unitData?.cnpj,
        franchisee_exists: true,
        franchisee_id: franchiseeData.id,
        unit_exists: true,
        unit_id: unitData?.id,
        status: 'pending',
        request_type: 'update_franchisee_data',
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        requestNumber: newRequest.request_number,
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
