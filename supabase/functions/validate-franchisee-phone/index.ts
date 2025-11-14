/* eslint-disable @typescript-eslint/no-explicit-any */
// Edge Function: validate-franchisee-phone
// Valida se um telefone pertence a um franqueado cadastrado
// Deve ser chamada ANTES de /auth/v1/otp no fluxo do Typebot
//
// Variáveis de ambiente esperadas:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

interface ValidationRequest {
  phone: string;
}

interface ValidationResponse {
  valid: boolean;
  message: string;
  franqueado?: {
    id: string;
    full_name: string;
  };
}

Deno.serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as ValidationRequest;
    const { phone } = body;

    if (!phone) {
      return new Response(
        JSON.stringify({
          valid: false,
          message: "Telefone não fornecido",
        } as ValidationResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const normalizedPhone = normalizePhone(phone);
    const validation = await validateFranqueadoByPhone(normalizedPhone);

    const response: ValidationResponse = validation.exists
      ? {
          valid: true,
          message: "Franqueado encontrado. Pode prosseguir com o login.",
          franqueado: validation.franqueado,
        }
      : {
          valid: false,
          message: "Telefone não cadastrado. Por favor, cadastre-se primeiro.",
        };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro na validação:", error);
    return new Response(
      JSON.stringify({
        valid: false,
        message: "Erro ao validar telefone. Tente novamente.",
      } as ValidationResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function normalizePhone(raw: string): string {
  // Remove todos os caracteres especiais, deixando apenas dígitos
  let cleanPhone = raw.replace(/\D/g, "");
  
  // Remove código do país (55) se presente
  if (cleanPhone.startsWith("55") && cleanPhone.length > 11) {
    cleanPhone = cleanPhone.substring(2);
  }
  
  console.log(`Telefone normalizado: ${raw} -> ${cleanPhone}`);
  return cleanPhone;
}

async function validateFranqueadoByPhone(phone: string): Promise<{
  exists: boolean;
  franqueado?: { id: string; full_name: string };
}> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  // @ts-expect-error Deno remote import resolved at runtime
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(supabaseUrl, serviceKey);

  // Busca exata com o número normalizado (apenas dígitos, sem +55/55)
  const { data, error } = await supabase
    .from("franqueados")
    .select("id, full_name, contact")
    .eq("contact", phone)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Erro ao validar franqueado no banco:", error);
    throw new Error("Falha na validação do franqueado");
  }

  console.log(`Validação para ${phone}: ${data ? "encontrado" : "não encontrado"}`);

  return {
    exists: !!data,
    franqueado: data ? { id: data.id, full_name: data.full_name } : undefined,
  };
}
