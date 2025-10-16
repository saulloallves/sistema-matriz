import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('--- CEP Lookup Function Invoked ---');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    console.log('Request URL:', url.href);
    
    const cep = url.searchParams.get('cep');
    console.log('Extracted CEP:', cep);

    if (!cep || !/^\d{8}$/.test(cep)) {
      console.error('Validation failed: CEP is invalid or missing.');
      return new Response(JSON.stringify({ error: 'CEP inválido. Forneça 8 dígitos numéricos.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const viaCepUrl = `https://viacep.com.br/ws/${cep}/json/`;
    console.log('Calling ViaCEP with:', viaCepUrl);
    
    const response = await fetch(viaCepUrl);
    console.log('ViaCEP response status:', response.status);

    if (!response.ok) {
      throw new Error(`Erro na API ViaCEP: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('ViaCEP response data:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in CEP lookup function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});