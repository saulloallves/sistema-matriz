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

// Função para enviar notificação via WhatsApp
async function sendWhatsAppNotification(phone: string, message: string): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const response = await fetch(`${supabaseUrl}/functions/v1/zapi-send-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        phone,
        message,
        logData: {
          event_type: 'onboarding_notification',
          user_action: 'system',
        },
      }),
    });

    if (!response.ok) {
      console.error('❌ Erro ao enviar WhatsApp:', await response.text());
      return false;
    }

    console.log('✅ WhatsApp enviado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp:', error);
    return false;
  }
}

// Função para enviar notificação via Email
async function sendEmailNotification(email: string, subject: string, html: string): Promise<boolean> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const response = await fetch(`${supabaseUrl}/functions/v1/brevo-send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        to: email,
        subject,
        html,
        logData: {
          event_type: 'onboarding_notification',
          user_action: 'system',
        },
      }),
    });

    if (!response.ok) {
      console.error('❌ Erro ao enviar Email:', await response.text());
      return false;
    }

    console.log('✅ Email enviado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar Email:', error);
    return false;
  }
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

/**
 * Busca dados dos vínculos de um franqueado para cadastro no sistema de treinamento
 * @param supabaseAdmin - Cliente Supabase com Service Role
 * @param franchiseeId - ID do franqueado
 * @returns Dados dos vínculos (unit_code mais recente, unit_codes array, nomes das unidades)
 */
async function getFranchiseeUnitsData(supabaseAdmin: any, franchiseeId: string) {
  try {
    console.log('🔍 Buscando vínculos do franqueado:', franchiseeId);
    
    // Buscar todos os vínculos do franqueado com dados das unidades
    // Especificando o relacionamento correto para evitar ambiguidade
    const { data: vinculos, error } = await supabaseAdmin
      .from('franqueados_unidades')
      .select(`
        id,
        created_at,
        unidade_id,
        unidades!franqueados_unidades_unidade_id_fkey (
          id,
          group_code,
          group_name
        )
      `)
      .eq('franqueado_id', franchiseeId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar vínculos:', error);
      throw error;
    }
    
    if (!vinculos || vinculos.length === 0) {
      console.warn('⚠️ Nenhum vínculo encontrado para o franqueado');
      return null;
    }
    
    console.log(`✅ Encontrados ${vinculos.length} vínculo(s)`);
    
    // Unidade mais recente (primeira no array pois já está ordenado DESC)
    const mostRecentUnit = vinculos[0].unidades;
    
    // Arrays de códigos e nomes de todas as unidades
    const unitCodes = vinculos.map((v: any) => String(v.unidades.group_code));
    const unitNames = vinculos.map((v: any) => v.unidades.group_name).join(' / ');
    
    return {
      unit_code: String(mostRecentUnit.group_code),
      unit_codes: unitCodes,
      nomes_unidades: unitNames
    };
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados dos vínculos:', error);
    return null;
  }
}

/**
 * Cria registro do franqueado no sistema de treinamento
 * @param supabaseAdmin - Cliente Supabase com Service Role
 * @param franchiseeData - Dados do franqueado
 * @param unitsData - Dados das unidades vinculadas
 * @param systemPassword - Senha do sistema
 */
async function createTrainingUser(
  supabaseAdmin: any,
  franchiseeData: any,
  unitsData: any,
  systemPassword: number
) {
  try {
    console.log('🎓 Iniciando criação de usuário no sistema de treinamento...');
    
    if (!unitsData) {
      console.warn('⚠️ Dados de unidades não disponíveis, pulando criação no treinamento');
      return;
    }
    
    // Preparar dados para inserção no treinamento.users
    const trainingUserData = {
      name: franchiseeData.full_name,
      cpf: franchiseeData.cpf_rnm?.replace(/\D/g, '') || null,
      email: franchiseeData.email,
      phone: franchiseeData.contact?.replace(/\D/g, '') || null,
      position: null,
      user_type: 'Aluno',
      active: true,
      unit_code: unitsData.unit_code,
      role: 'Franqueado',
      approval_status: 'aprovado',
      approved_by: null,
      approved_at: null,
      visible_password: String(systemPassword).padStart(2, '0'),
      unit_codes: unitsData.unit_codes,
      nomes_unidades: unitsData.nomes_unidades
    };
    
    console.log('📝 Dados preparados para treinamento.users:', {
      name: trainingUserData.name,
      cpf: trainingUserData.cpf,
      email: trainingUserData.email,
      unit_code: trainingUserData.unit_code,
      unit_codes_count: trainingUserData.unit_codes.length
    });
    
    // Inserir no schema treinamento usando RPC (pois .schema() não funciona em Edge Functions)
    // Vamos usar SQL direto via query do supabase
    const { data: insertedUser, error: insertError } = await supabaseAdmin.rpc(
      'insert_training_user',
      {
        user_data: trainingUserData
      }
    );
    
    if (insertError) {
      console.error('❌ Erro ao inserir usuário no treinamento:', insertError);
      throw insertError;
    }
    
    console.log('✅ Usuário criado no sistema de treinamento com sucesso!');
    console.log('📋 ID no treinamento:', insertedUser?.id);
    
    return insertedUser;
    
  } catch (error: any) {
    console.error('❌ Erro ao criar usuário no treinamento:', error);
    // Não propagar o erro para não falhar a aprovação principal
    console.warn('⚠️ Continuando aprovação apesar do erro no treinamento');
  }
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
    console.log('📊 Group Code para geração:', unitGroupCode);
    
    if (!unitGroupCode) {
      console.error('❌ Group code não encontrado!');
      throw new Error('Group code da unidade não encontrado para gerar senha');
    }
    
    const systemPassword = generateSystemPassword(unitGroupCode);
    console.log('✅ Senha gerada com sucesso:', systemPassword);
    console.log('📝 Tipo da senha:', typeof systemPassword);
    
    // Atualizar franqueado com a senha gerada
    console.log('💾 Salvando senha no franqueado ID:', franchiseeId);
    const { data: updatedFranchisee, error: passwordError } = await supabaseAdmin
      .from('franqueados')
      .update({ systems_password: systemPassword })
      .eq('id', franchiseeId)
      .select('id, systems_password')
      .single();
    
    if (passwordError) {
      console.error('❌ Erro ao salvar senha do franqueado:', passwordError);
      throw new Error(`Falha ao salvar senha: ${passwordError.message}`);
    }
    
    console.log('✅ Senha salva com sucesso no franqueado');
    console.log('📋 Dados atualizados:', updatedFranchisee);
    
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
    
    // ===== 4.1. CRIAR USUÁRIO NO SISTEMA DE TREINAMENTO (APENAS PARA NOVOS FRANQUEADOS) =====
    // Criar no treinamento apenas quando for novo franqueado (não quando for franqueado existente)
    const isNewFranchisee = request.request_type === 'new_franchisee_new_unit' || 
                            request.request_type === 'new_franchisee_existing_unit';
    
    if (isNewFranchisee) {
      console.log('🎓 Request de NOVO FRANQUEADO detectado - iniciando criação no sistema de treinamento...');
      console.log('📋 Tipo do request:', request.request_type);
      
      // Buscar dados dos vínculos do franqueado
      const unitsData = await getFranchiseeUnitsData(supabaseAdmin, franchiseeId);
      
      if (unitsData) {
        // Buscar dados completos do franqueado
        const { data: franchiseeFullData, error: franchiseeError } = await supabaseAdmin
          .from('franqueados')
          .select('*')
          .eq('id', franchiseeId)
          .single();
        
        if (franchiseeError) {
          console.error('❌ Erro ao buscar dados do franqueado:', franchiseeError);
        } else {
          // Criar usuário no treinamento
          await createTrainingUser(
            supabaseAdmin,
            franchiseeFullData,
            unitsData,
            systemPassword
          );
        }
      }
    } else {
      console.log('ℹ️ Request é de FRANQUEADO EXISTENTE - pulando criação no treinamento');
      console.log('📋 Tipo do request:', request.request_type);
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
    
    // ===== 6. ENVIAR NOTIFICAÇÕES DE APROVAÇÃO =====
    console.log('📧 Enviando notificações de aprovação...');
    
    const franchiseeName = formData.full_name || 'Franqueado';
    const franchiseePhone = cleanPhoneNumber(formData.contact);
    const franchiseeEmail = formData.franchisee_email || formData.email;
    
    // Mensagem de aprovação
    const whatsappMessage = `🎉 *Parabéns, ${franchiseeName}!*

Informamos que seu cadastro no *Girabot* foi *APROVADO* com sucesso! ✅

Você já pode utilizar todos os nossos sistemas.

*Dados de Acesso:*
• Código da Unidade: ${unitGroupCode}
• Senha do Sistema: ${systemPassword}

Caso tenha alguma dúvida, entre em contato conosco.

Bem-vindo(a) à família Cresci e Perdi! 🎊`;

    const emailSubject = '🎉 Cadastro Aprovado - Girabot';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #E3A024, #42a5f5); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Cadastro Aprovado!</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Olá, <strong>${franchiseeName}</strong>!
          </p>
          
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Informamos que seu cadastro no <strong>Girabot</strong> foi <strong style="color: #27ae60;">APROVADO</strong> com sucesso! ✅
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
            <h3 style="color: #E3A024; margin-top: 0;">Dados de Acesso</h3>
            <p style="margin: 10px 0;"><strong>Código da Unidade:</strong> ${unitGroupCode}</p>
            <p style="margin: 10px 0;"><strong>Senha do Sistema:</strong> ${systemPassword}</p>
          </div>
          
          <p style="font-size: 16px; color: #333; margin-top: 20px;">
            Você já pode utilizar todos os nossos sistemas!
          </p>
          
          <p style="font-size: 16px; color: #333; margin-top: 20px;">
            Caso tenha alguma dúvida, entre em contato conosco.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
            <p style="color: #666; font-size: 14px;">
              Bem-vindo(a) à família <strong>Cresci e Perdi</strong>! 🎊
            </p>
          </div>
        </div>
      </div>
    `;
    
    // Enviar notificações (não bloqueante - não falha se houver erro)
    if (franchiseePhone) {
      await sendWhatsAppNotification(franchiseePhone, whatsappMessage);
    }
    
    if (franchiseeEmail) {
      await sendEmailNotification(franchiseeEmail, emailSubject, emailHtml);
    }
    
    console.log('✅ Processo de aprovação e notificação concluído!');
    
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
  
  // ===== ENVIAR NOTIFICAÇÕES DE REJEIÇÃO =====
  console.log('📧 Enviando notificações de rejeição...');
  
  const formData = request.form_data;
  const franchiseeName = formData.full_name || 'Franqueado';
  const franchiseePhone = cleanPhoneNumber(formData.contact);
  const franchiseeEmail = formData.franchisee_email || formData.email;
  
  // Mensagem de rejeição
  const whatsappMessage = `Olá, ${franchiseeName}.

Informamos que seu cadastro no *Girabot* foi *REJEITADO*. ❌

*Motivo da rejeição:*
${reason}

Para mais informações ou para esclarecer dúvidas, entre em contato conosco.

Atenciosamente,
Equipe Cresci e Perdi`;

  const emailSubject = 'Cadastro Rejeitado - Girabot';
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Cadastro Rejeitado</h1>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          Olá, <strong>${franchiseeName}</strong>,
        </p>
        
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          Informamos que seu cadastro no <strong>Girabot</strong> foi <strong style="color: #e74c3c;">REJEITADO</strong>. ❌
        </p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c;">
          <h3 style="color: #e74c3c; margin-top: 0;">Motivo da Rejeição</h3>
          <p style="margin: 10px 0; color: #555; white-space: pre-wrap;">${reason}</p>
        </div>
        
        <p style="font-size: 16px; color: #333; margin-top: 20px;">
          Para mais informações ou para esclarecer dúvidas, entre em contato conosco.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
          <p style="color: #666; font-size: 14px;">
            Atenciosamente,<br/>
            <strong>Equipe Cresci e Perdi</strong>
          </p>
        </div>
      </div>
    </div>
  `;
  
  // Enviar notificações (não bloqueante - não falha se houver erro)
  if (franchiseePhone) {
    await sendWhatsAppNotification(franchiseePhone, whatsappMessage);
  }
  
  if (franchiseeEmail) {
    await sendEmailNotification(franchiseeEmail, emailSubject, emailHtml);
  }
  
  console.log('✅ Processo de rejeição e notificação concluído!');
}
