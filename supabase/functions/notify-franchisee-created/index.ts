import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    console.log('📨 Recebendo notificação de novo franqueado...');

    const body = await req.json();
    const { cpf, nome, telefone, id, codigo_unidade } = body;

    // Validação dos campos obrigatórios
    if (!cpf || !nome || !telefone || !id || !codigo_unidade) {
      console.error('❌ Campos obrigatórios faltando:', { cpf, nome, telefone, id, codigo_unidade });
      return new Response(
        JSON.stringify({
          error: 'Campos obrigatórios faltando',
          required: ['cpf', 'nome', 'telefone', 'id', 'codigo_unidade'],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('📤 Enviando dados para n8n:', { cpf, nome, telefone, id, codigo_unidade });

    // Enviar para webhook do n8n
    const n8nWebhookUrl = 'https://n8n.girabot.com.br/webhook/atualizar-senha-franqueado';

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cpf,
        nome,
        telefone,
        id,
        codigo_unidade,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ao enviar para n8n:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return new Response(
        JSON.stringify({
          error: 'Erro ao enviar para n8n',
          status: response.status,
          details: errorText,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const n8nResponse = await response.text();
    console.log('✅ Webhook n8n chamado com sucesso:', n8nResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notificação enviada com sucesso para n8n',
        n8nResponse,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('❌ Erro inesperado:', error);
    return new Response(
      JSON.stringify({
        error: 'Erro inesperado ao processar notificação',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
