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
    const { type, value } = await req.json();
    console.log(`API Lookup request: ${type} - ${value}`);

    let result;
    switch (type) {
      case 'cpf':
        result = await lookupCpf(value);
        break;
      case 'cnpj':
        result = await lookupCnpj(value);
        break;
      case 'cep':
        result = await lookupCep(value);
        break;
      default:
        throw new Error('Invalid lookup type');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in api-lookup function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function lookupCpf(cpf: string) {
  const hubdevApiKey = Deno.env.get('HUBDEV_API_KEY');

  if (!hubdevApiKey) {
    console.warn('HUBDEV_API_KEY not configured, returning mock data');
    // Return mock data for development/testing
    return {
      success: true,
      data: {
        nome: 'João Silva Santos',
        nascimento: '1985-03-15',
      },
    };
  }

  try {
    // Get current date in DD/MM/YYYY format for the 'data' parameter
    const currentDate = new Date().toLocaleDateString('pt-BR');

    // Build the correct HUBDev API URL according to documentation
    const url = `http://ws.hubdodesenvolvedor.com.br/v2/cpf/?cpf=${cpf}&data=${encodeURIComponent(
      currentDate
    )}&token=${hubdevApiKey}`;

    console.log(`Calling HUBDev API: ${url.replace(hubdevApiKey, '[TOKEN_HIDDEN]')}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Lovable-API-Client/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HubDev API HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log('HubDev API response:', JSON.stringify(data, null, 2));

    // Check if the API returned success
    if (data.return === 'OK' && data.result) {
      // Format the birth date from DD/MM/YYYY to YYYY-MM-DD
      let formattedBirthDate = '';
      if (data.result.data_nascimento) {
        const birthDateParts = data.result.data_nascimento.split('/');
        if (birthDateParts.length === 3) {
          formattedBirthDate = `${birthDateParts[2]}-${birthDateParts[1].padStart(
            2,
            '0'
          )}-${birthDateParts[0].padStart(2, '0')}`;
        }
      }

      return {
        success: true,
        data: {
          nome: data.result.nome_da_pf || '',
          nascimento: formattedBirthDate,
          cpf_numero: data.result.numero_de_cpf || '',
          situacao_cadastral: data.result.situacao_cadastral || '',
          data_inscricao: data.result.data_inscricao || '',
          comprovante_emitido: data.result.comprovante_emitido || '',
        },
      };
    } else {
      console.warn('HubDev API returned non-OK status:', data);
      return {
        success: false,
        error: 'CPF não encontrado na base da Receita Federal',
      };
    }
  } catch (error: any) {
    console.error('CPF lookup error:', error);
    return {
      success: false,
      error: 'Erro ao consultar CPF na base da Receita Federal',
    };
  }
}

async function lookupCnpj(cnpj: string) {
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);

    if (!response.ok) {
      throw new Error(`BrasilAPI error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        nome: data.nome_fantasia || data.razao_social,
        razao_social: data.razao_social,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cep: data.cep,
        municipio: data.municipio,
        uf: data.uf,
      },
    };
  } catch (error: any) {
    console.error('CNPJ lookup error:', error);
    return {
      success: false,
      error: 'Erro ao consultar CNPJ',
    };
  }
}

async function lookupCep(cep: string) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    if (!response.ok) {
      throw new Error(`ViaCEP error: ${response.status}`);
    }

    const data = await response.json();

    if (data.erro) {
      return {
        success: false,
        error: 'CEP não encontrado',
      };
    }

    return {
      success: true,
      data: {
        logradouro: data.logradouro,
        complemento: data.complemento,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf,
        cep: data.cep,
      },
    };
  } catch (error: any) {
    console.error('CEP lookup error:', error);
    return {
      success: false,
      error: 'Erro ao consultar CEP',
    };
  }
}
