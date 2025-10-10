import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, payload } = await req.json();

    if (!topic || !payload) {
      console.error('[webhook-dispatcher] Payload inválido:', { topic, payload });
      return new Response(
        JSON.stringify({ error: 'topic e payload são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('[webhook-dispatcher] Recebido:', { topic, payload });

    // Conectar ao Supabase com service role para acessar todas as tabelas
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar todos os webhooks ativos para este tópico (ou tópico genérico)
    const { data: subscriptions, error: fetchError } = await supabaseAdmin
      .from('webhook_subscriptions')
      .select('*')
      .eq('enabled', true)
      .or(`topic.eq.${topic},topic.eq.generic`);

    if (fetchError) {
      console.error('[webhook-dispatcher] Erro ao buscar subscriptions:', fetchError);
      throw new Error(`Erro ao buscar subscriptions: ${fetchError.message}`);
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[webhook-dispatcher] Nenhuma subscription ativa encontrada para topic:', topic);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhuma subscription ativa encontrada',
          dispatched: 0 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`[webhook-dispatcher] Encontradas ${subscriptions.length} subscriptions ativas`);

    // Enviar para cada webhook
    const deliveryResults = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        const startTime = Date.now();
        
        try {
          console.log(`[webhook-dispatcher] Enviando para ${subscription.endpoint_url}`);
          
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };

          // Adicionar assinatura se houver secret
          if (subscription.secret) {
            // Criar assinatura simples HMAC-SHA256
            const signature = await crypto.subtle.digest(
              'SHA-256',
              new TextEncoder().encode(subscription.secret + JSON.stringify(payload))
            );
            const hashArray = Array.from(new Uint8Array(signature));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            headers['X-Webhook-Signature'] = hashHex;
          }

          const response = await fetch(subscription.endpoint_url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          });

          const responseText = await response.text();
          const duration = Date.now() - startTime;

          // Registrar delivery log
          await supabaseAdmin.from('webhook_delivery_logs').insert({
            subscription_id: subscription.id,
            success: response.ok,
            status_code: response.status,
            request_body: payload,
            response_body: responseText,
            attempt: 1,
          });

          console.log(`[webhook-dispatcher] Sucesso para ${subscription.endpoint_url} (${duration}ms, status: ${response.status})`);

          return {
            subscription_id: subscription.id,
            endpoint_url: subscription.endpoint_url,
            success: response.ok,
            status_code: response.status,
            duration_ms: duration,
          };
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(`[webhook-dispatcher] Erro ao enviar para ${subscription.endpoint_url}:`, error);

          // Registrar erro no delivery log
          await supabaseAdmin.from('webhook_delivery_logs').insert({
            subscription_id: subscription.id,
            success: false,
            status_code: null,
            request_body: payload,
            error_message: error.message,
            attempt: 1,
          });

          return {
            subscription_id: subscription.id,
            endpoint_url: subscription.endpoint_url,
            success: false,
            error: error.message,
            duration_ms: duration,
          };
        }
      })
    );

    const results = deliveryResults.map((result) => 
      result.status === 'fulfilled' ? result.value : { error: result.reason }
    );

    const successCount = results.filter((r) => r.success).length;
    
    console.log(`[webhook-dispatcher] Finalizado: ${successCount}/${subscriptions.length} enviados com sucesso`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Webhooks disparados: ${successCount}/${subscriptions.length}`,
        dispatched: successCount,
        total: subscriptions.length,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[webhook-dispatcher] Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
