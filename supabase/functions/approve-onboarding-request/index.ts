import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Função auxiliar para limpar telefone (apenas números)
function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Gera senha do sistema baseada no código da unidade
 * @param groupCode - Código da unidade (sempre 4 dígitos)
 * @returns Senha numérica de 8 dígitos
 */
function generateSystemPassword(groupCode: number): number {
  // Código da unidade com 4 dígitos
  const codigo = String(groupCode).padStart(4, "0");
  
  // Número aleatório de 4 dígitos
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  
  // Intercala: random[0] + codigo[0] + random[1] + codigo[1] + ...
  let senha = "";
  for (let i = 0; i < 4; i++) {
    senha += random[i] + codigo[i];
  }
  
  return parseInt(senha, 10);
}

serve(async (req: any) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  
  try {
    console.log('🚀 Iniciando approve-onboarding-request');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Cliente com Service Role para bypass de RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { requestId, action, rejectionReason, reviewerId } = await req.json();
    
    console.log('📥 Dados recebidos:', {
      requestId,
      action,
      reviewerId
    });
    
    // Validações
    if (!requestId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'requestId é obrigatório'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    if (!action || !['approve', 'reject'].includes(action)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'action deve ser "approve" ou "reject"'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    if (action === 'reject' && !rejectionReason) {
      return new Response(JSON.stringify({
        success: false,
        error: 'rejectionReason é obrigatório para rejeição'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 1. Buscar request
    console.log('🔍 Buscando request:', requestId);
    const { data: request, error: fetchError } = await supabaseAdmin
      .from('onboarding_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (fetchError || !request) {
      console.error('❌ Request não encontrado:', fetchError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Request não encontrado'
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // 2. Validar status
    if (request.status !== 'pending') {
      console.error('❌ Status inválido:', request.status);
      return new Response(JSON.stringify({
        success: false,
        error: `Request já está no status: ${request.status}`
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    console.log('✅ Request encontrado:', request.request_number);
    console.log('📋 Tipo:', request.request_type);
    
    // 3. Processar aprovação ou rejeição
    if (action === 'approve') {
      const result = await processApproval(supabaseAdmin, request, reviewerId);
      return new Response(JSON.stringify({
        success: true,
        message: 'Request aprovado e dados inseridos com sucesso',
        requestNumber: request.request_number,
        data: result
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } else {
      await processRejection(supabaseAdmin, request, reviewerId, rejectionReason);
      return new Response(JSON.stringify({
        success: true,
        message: 'Request rejeitado com sucesso',
        requestNumber: request.request_number
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error: any) {
    console.error('❌ Erro inesperado na Edge Function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erro inesperado ao processar requisição'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

// =====================================================
// FUNÇÃO: PROCESSAR APROVAÇÃO
// =====================================================
async function processApproval(supabaseAdmin: any, request: any, reviewerId: string) {
  console.log('✅ Iniciando processo de aprovação...');
  
  // Atualizar status para processing
  await supabaseAdmin
    .from('onboarding_requests')
    .update({ status: 'processing' })
    .eq('id', request.id);
  
  const formData = request.form_data;
  
  try {
    let franchiseeId = request.franchisee_id;
    let unitId = request.unit_id;
    let unitGroupCode: number;
    
    // ===== 1. CRIAR/ATUALIZAR FRANQUEADO SE NECESSÁRIO =====
    if (!request.franchisee_exists) {
      console.log('👤 Criando novo franqueado...');
      const franchiseeData = {
        cpf_rnm: formData.cpf_rnm,
        full_name: formData.full_name,
        birth_date: formData.birth_date || null,
        email: formData.franchisee_email || null,
        contact: cleanPhoneNumber(formData.contact),
        nationality: formData.nationality || null,
        owner_type: formData.owner_type,
        education: formData.education || null,
        previous_profession: formData.previous_profession || null,
        previous_salary_range: formData.previous_salary_range || null,
        was_entrepreneur: formData.was_entrepreneur,
        availability: formData.availability || null,
        discovery_source: formData.discovery_source || null,
        was_referred: formData.was_referred,
        referrer_name: formData.referrer_name || null,
        referrer_unit_code: formData.referrer_unit_code || null,
        has_other_activities: formData.has_other_activities,
        other_activities_description: formData.other_activities_description || null,
        receives_prolabore: formData.receives_prolabore,
        prolabore_value: formData.prolabore_value || null,
        profile_image: formData.profile_image || null,
        instagram: formData.instagram || null,
        address: formData.franchisee_address || null,
        number_address: formData.franchisee_number_address || null,
        address_complement: formData.franchisee_address_complement || null,
        neighborhood: formData.franchisee_neighborhood || null,
        city: formData.franchisee_city || null,
        state: formData.franchisee_state || null,
        uf: formData.franchisee_uf || null,
        postal_code: formData.franchisee_postal_code || null,
        system_term_accepted: formData.system_term_accepted,
        confidentiality_term_accepted: formData.confidentiality_term_accepted,
        lgpd_term_accepted: formData.lgpd_term_accepted,
        is_in_contract: false,
        is_active_system: true
      };
      
      const { data: newFranchisee, error: franchiseeError } = await supabaseAdmin
        .from('franqueados')
        .insert(franchiseeData)
        .select()
        .single();
      
      if (franchiseeError) {
        console.error('❌ Erro ao criar franqueado:', franchiseeError);
        throw franchiseeError;
      }
      
      franchiseeId = newFranchisee.id;
      console.log('✅ Franqueado criado com ID:', franchiseeId);
    } else {
      console.log('👤 Franqueado já existe, ID:', franchiseeId);
    }
    
    // ===== 2. CRIAR/ATUALIZAR UNIDADE SE NECESSÁRIO =====
    if (!request.unit_exists) {
      console.log('🏢 Criando nova unidade...');
      const unitData = {
        cnpj: formData.cnpj || null,
        fantasy_name: formData.fantasy_name || null,
        group_name: formData.group_name,
        group_code: formData.group_code,
        store_model: formData.store_model,
        store_phase: formData.store_phase,
        store_imp_phase: formData.store_imp_phase || null,
        email: formData.email || null,
        phone: formData.phone || null,
        instagram_profile: formData.instagram_profile || null,
        has_parking: formData.has_parking,
        parking_spots: formData.parking_spots || null,
        has_partner_parking: formData.has_partner_parking,
        partner_parking_address: formData.has_partner_parking ? formData.partner_parking_address : null,
        purchases_active: formData.purchases_active,
        sales_active: formData.sales_active,
        address: formData.unit_address || null,
        number_address: formData.unit_number_address || null,
        address_complement: formData.unit_address_complement || null,
        neighborhood: formData.unit_neighborhood || null,
        city: formData.unit_city || null,
        state: formData.unit_state || null,
        uf: formData.unit_uf || null,
        postal_code: formData.unit_postal_code || null,
        operation_mon: formData.operation_mon || null,
        operation_tue: formData.operation_tue || null,
        operation_wed: formData.operation_wed || null,
        operation_thu: formData.operation_thu || null,
        operation_fri: formData.operation_fri || null,
        operation_sat: formData.operation_sat || null,
        operation_sun: formData.operation_sun || null,
        operation_hol: formData.operation_hol || null,
        is_active: true
      };
      
      const { data: newUnit, error: unitError } = await supabaseAdmin
        .from('unidades')
        .insert(unitData)
        .select()
        .single();
      
      if (unitError) {
        console.error('❌ Erro ao criar unidade:', unitError);
        throw unitError;
      }
      
      unitId = newUnit.id;
      unitGroupCode = newUnit.group_code;
      console.log('✅ Unidade criada com ID:', unitId);
    } else {
      console.log('🏢 Unidade já existe, ID:', unitId);
      // Buscar o group_code da unidade existente
      const { data: existingUnit } = await supabaseAdmin
        .from('unidades')
        .select('group_code')
        .eq('id', unitId)
        .single();
      
      unitGroupCode = existingUnit?.group_code || formData.group_code;
    }
    
    // ===== 3. GERAR SENHA DO SISTEMA =====
    console.log('🔐 Gerando senha do sistema...');
    const systemPassword = generateSystemPassword(unitGroupCode);
    console.log('✅ Senha gerada:', systemPassword);
    
    // Atualizar franqueado com a senha gerada
    const { error: passwordError } = await supabaseAdmin
      .from('franqueados')
      .update({ systems_password: systemPassword })
      .eq('id', franchiseeId);
    
    if (passwordError) {
      console.error('⚠️ Erro ao salvar senha do franqueado:', passwordError);
      // Não vamos falhar a aprovação por causa disso
    } else {
      console.log('✅ Senha salva no franqueado');
    }
    
    // ===== 4. CRIAR VINCULAÇÃO FRANQUEADO-UNIDADE =====
    console.log('🔗 Verificando vinculação...');
    
    // Verificar se já existe vinculação
    const { data: existingRelation } = await supabaseAdmin
      .from('franqueados_unidades')
      .select('id')
      .eq('franqueado_id', franchiseeId)
      .eq('unidade_id', unitId)
      .maybeSingle();
    
    if (!existingRelation) {
      console.log('🔗 Criando vinculação...');
      const { error: relationError } = await supabaseAdmin
        .from('franqueados_unidades')
        .insert({
          franqueado_id: franchiseeId,
          unidade_id: unitId
        });
      
      if (relationError) {
        console.error('❌ Erro ao criar vinculação:', relationError);
        throw relationError;
      }
      console.log('✅ Vinculação criada');
    } else {
      console.log('✅ Vinculação já existe');
    }
    
    // ===== 5. ATUALIZAR REQUEST PARA APPROVED =====
    console.log('📝 Atualizando status do request...');
    const processingResult = {
      franchisee_id: franchiseeId,
      unit_id: unitId,
      system_password: systemPassword,
      created_at: new Date().toISOString()
    };
    
    await supabaseAdmin
      .from('onboarding_requests')
      .update({
        status: 'approved',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        franchisee_id: franchiseeId,
        unit_id: unitId,
        processing_result: processingResult
      })
      .eq('id', request.id);
    
    console.log('✅ Aprovação concluída com sucesso!');
    console.log('📝 Histórico será registrado automaticamente por trigger');
    
    return processingResult;
    
  } catch (error: any) {
    console.error('❌ Erro durante aprovação:', error);
    
    // Rollback: atualizar para erro
    await supabaseAdmin
      .from('onboarding_requests')
      .update({
        status: 'error',
        rejection_reason: `Erro ao processar: ${error.message}`
      })
      .eq('id', request.id);
    
    throw error;
  }
}

// =====================================================
// FUNÇÃO: PROCESSAR REJEIÇÃO
// =====================================================
async function processRejection(supabaseAdmin: any, request: any, reviewerId: string, reason: string) {
  console.log('❌ Processando rejeição...');
  
  // Atualizar request para rejected
  await supabaseAdmin
    .from('onboarding_requests')
    .update({
      status: 'rejected',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason || 'Rejeitado sem motivo especificado'
    })
    .eq('id', request.id);
  
  console.log('✅ Rejeição processada com sucesso');
  console.log('📝 Histórico será registrado automaticamente por trigger');
}
