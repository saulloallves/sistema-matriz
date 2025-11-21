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

    const { franchiseeData, unitsData, request_number } = await req.json();
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

    // Mapeamento dos dados para o formato plano esperado pelo sistema
    const unit = unitsData && unitsData.length > 0 ? unitsData[0] : {};

    const formData = {
      // Dados Pessoais
      full_name: franchiseeData.full_name,
      cpf_rnm: franchiseeData.cpf_rnm,
      email: franchiseeData.email, // Email principal do cadastro
      contact: franchiseeData.contact,
      birth_date: franchiseeData.birth_date,
      nationality: franchiseeData.nationality,
      education: franchiseeData.education,
      instagram: franchiseeData.instagram,
      profile_image: franchiseeData.profile_image,

      // Endereço do Franqueado (Mapeado de address -> franchisee_address, etc)
      franchisee_address: franchiseeData.address,
      franchisee_number_address: franchiseeData.number_address,
      franchisee_address_complement: franchiseeData.address_complement,
      franchisee_neighborhood: franchiseeData.neighborhood,
      franchisee_city: franchiseeData.city,
      franchisee_state: franchiseeData.state, // Ou uf, dependendo do que vem
      franchisee_uf: franchiseeData.uf,
      franchisee_postal_code: franchiseeData.postal_code,
      franchisee_email: franchiseeData.email, // Repetido conforme padrão

      // Dados da Unidade (Pega a primeira unidade do array)
      cnpj: unit.cnpj,
      fantasy_name: unit.fantasy_name,
      group_code: unit.group_code,
      group_name: unit.group_name,
      store_model: unit.store_model,
      store_phase: unit.store_phase,
      store_imp_phase: unit.store_imp_phase,
      sales_active: unit.sales_active,
      purchases_active: unit.purchases_active,
      instagram_profile: unit.instagram_profile,

      // Endereço da Unidade
      unit_address: unit.address,
      unit_number_address: unit.number_address,
      unit_address_complement: unit.address_complement,
      unit_neighborhood: unit.neighborhood,
      unit_city: unit.city,
      unit_state: unit.state,
      unit_uf: unit.uf,
      unit_postal_code: unit.postal_code,

      // Outros Campos
      owner_type: franchiseeData.owner_type,
      availability: franchiseeData.availability,
      discovery_source: franchiseeData.discovery_source,
      was_entrepreneur: franchiseeData.was_entrepreneur,
      previous_profession: franchiseeData.previous_profession,
      previous_salary_range: franchiseeData.previous_salary_range,
      has_other_activities: franchiseeData.has_other_activities,
      other_activities_description: franchiseeData.other_activities_description,
      receives_prolabore: franchiseeData.receives_prolabore,
      prolabore_value: franchiseeData.prolabore_amount, // Mapeado de amount -> value
      was_referred: franchiseeData.was_referred,
      referrer_name: franchiseeData.referrer_name,
      referrer_unit_code: franchiseeData.referrer_unit_code,

      // Termos
      lgpd_term_accepted: franchiseeData.lgpd_term_accepted,
      system_term_accepted: franchiseeData.system_term_accepted,
      confidentiality_term_accepted: franchiseeData.confidentiality_term_accepted,

      // Campos booleanos auxiliares
      has_complement: !!franchiseeData.address_complement,
      has_unit_complement: !!unit.address_complement,

      // Preservar dados originais para referência
      _units_data: unitsData,
      _raw_franchisee_data: franchiseeData
    };

    // Cria a nova solicitação de onboarding
    const { data: newRequest, error } = await supabaseAdmin
      .from('onboarding_requests')
      .insert({
        request_number,
        form_data: formData,
        franchisee_cpf: franchiseeData.cpf_rnm,
        franchisee_email: franchiseeData.email,
        unit_cnpj: unit?.cnpj,
        franchisee_exists: true,
        franchisee_id: franchiseeData.id,
        unit_exists: true,
        unit_id: unit?.id,
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
