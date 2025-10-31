// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
serve(async (req)=>{
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  try {
    const body = await req.json();
    const { phone, message, logData } = body;
    if (!phone || !message) {
      return new Response(JSON.stringify({
        error: "Missing phone or message"
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Criar cliente Supabase para buscar credenciais do banco
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar credenciais do banco de dados primeiro
    const { data: credentials } = await supabase
      .from('notification_credentials')
      .select('zapi_instance_id, zapi_instance_token, zapi_client_token, zapi_base_url')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    // Usar credenciais do banco, com fallback para variáveis de ambiente
    const instanceId = credentials?.zapi_instance_id || Deno.env.get("ZAPI_INSTANCE_ID") || "";
    const instanceToken = credentials?.zapi_instance_token || Deno.env.get("ZAPI_INSTANCE_TOKEN") || "";
    const clientToken = credentials?.zapi_client_token || Deno.env.get("ZAPI_CLIENT_TOKEN") || "";
    const baseUrl = credentials?.zapi_base_url || Deno.env.get("ZAPI_BASE_URL") || "https://api.z-api.io";

    if (!instanceId || !instanceToken || !clientToken) {
      return new Response(JSON.stringify({
        error: "Z-API credentials not configured"
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
    const url = `${baseUrl}/instances/${encodeURIComponent(instanceId)}/token/${encodeURIComponent(instanceToken)}/send-text`;
    const zapiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": clientToken
      },
      body: JSON.stringify({
        phone,
        message
      })
    });
    const zapiData = await zapiRes.json().catch(()=>({}));
    if (!zapiRes.ok) {
      return new Response(JSON.stringify({
        error: "Z-API error",
        status: zapiRes.status,
        data: zapiData
      }), {
        status: 502,
        headers: corsHeaders
      });
    }
    
    // Log de auditoria no sucesso
    try {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '', 
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const logEntry = {
        event_type: logData?.event_type || 'whatsapp_message',
        user_action: logData?.user_action || 'system',
        canal: 'whatsapp',
        destinatario: phone,
        conteudo: message,
        assunto: null,
        status: 'enviado',
        external_id: zapiData?.id || zapiData?.messageId,
        metadata: {
          zapi_response: zapiData,
          request_data: logData
        }
      };
      
      const { error: logError } = await supabaseAdmin
        .from('comunicacoes')
        .insert(logEntry);
      
      if (logError) {
        console.error('⚠️ Falha ao registrar log de comunicação:', logError);
        // Não falha a requisição principal, apenas loga o erro
      } else {
        console.log('✅ Log de comunicação registrado com sucesso');
      }
    } catch (logErr) {
      console.error('⚠️ Erro ao tentar registrar log:', logErr);
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: zapiData
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: "Unexpected error",
      message: err instanceof Error ? err.message : String(err)
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
