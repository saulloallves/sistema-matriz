/* eslint-disable @typescript-eslint/no-explicit-any */
// Edge Function: send-sms
// Responsável por receber o hook de envio de SMS do Supabase Auth (OTP phone login)
// e encaminhar via Bird (MessageBird nova API). Projeto Deno (Supabase Functions).
// 
// MVP: tolerante ao formato do payload. Opcional: verificação de assinatura.
// Adicione HOOK_SIGNING_SECRET nos secrets para ativar verificação HMAC.
//
// Variáveis de ambiente esperadas:
//   SMS_WORKSPACE_ID
//   SMS_CHANNEL_ID
//   SMS_ACCESS_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   (Opcional) SEND_SMS_HOOK_SECRETS

// Shim de tipos para evitar erros de editor no ambiente Node/TS local
// (Em produção, o runtime é Deno e esse namespace existe.)
declare const Deno: any;

interface SmsHookPayload {
  user?: { phone?: string };
  sms?: { otp?: string };
  // Fallbacks quando chamada direta para teste manual
  phone?: string;
  otp?: string;
}

function debugLog(...args: unknown[]) {
  if (Deno.env.get("DEBUG") === "true") console.log(...args);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Leia body cru e cabeçalhos (necessário para Standard Webhooks)
  let rawBody = "";
  try {
    rawBody = await req.text();
  } catch (e) {
    console.error("Erro lendo body", e);
    return new Response(JSON.stringify({ error: "Invalid body" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const headersObj = Object.fromEntries(req.headers);
  if (Deno.env.get("DEBUG") === "true") {
    console.log("Headers recebidos:", headersObj);
    console.log("Body bruto:", rawBody);
  }

  // Verificação Standard Webhooks quando for chamada de Hook (headers presentes)
  const hookSecretFull = Deno.env.get("SEND_SMS_HOOK_SECRETS") || Deno.env.get("HOOK_SIGNING_SECRET");
  const hasSwHeaders = (
    "webhook-signature" in headersObj ||
    "webhook_timestamp" in headersObj ||
    "webhook-timestamp" in headersObj ||
    "webhook-id" in headersObj
  );

  let verifiedPayload: SmsHookPayload | null = null;
  if (hookSecretFull && hasSwHeaders) {
    try {
      const baseSecret = hookSecretFull.replace(/^v1,whsec_/i, "");
      // @ts-expect-error Deno remote import resolved at runtime
      const swlib: any = await import("https://esm.sh/standardwebhooks@1.0.0");
      const wh = new swlib.Webhook(baseSecret);
      const data = wh.verify(rawBody, headersObj) as any;
      verifiedPayload = data as SmsHookPayload;
    } catch (e) {
      console.error("Signature verification failed", e);
      return new Response(JSON.stringify({ error: "Signature verification failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }

  let payload: SmsHookPayload;
  if (verifiedPayload) {
    payload = verifiedPayload;
  } else {
    try {
      payload = JSON.parse(rawBody) as SmsHookPayload;
    } catch (e) {
      console.error("JSON parse error", e);
      return new Response(JSON.stringify({ error: "Malformed JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
  }

  debugLog("Payload interpretado:", payload);

  const phone = pickFirstDefined([
    payload.phone,
    payload.user?.phone,
    // campos legados removidos
  ]);
  const otp = pickFirstDefined([
    // campos legados removidos
    payload.sms?.otp,
    payload.otp,
    // token/code legados removidos
  ]);

  if (!phone || !otp) {
    console.error("Missing phone or OTP no payload", { phone, otp, payload });
    return new Response("Missing phone or otp", { status: 400 });
  }

  const normalizedPhone = normalizePhone(phone);
  
  // Validação: verificar se telefone pertence a franqueado cadastrado
  try {
    const validation = await validateFranqueadoByPhone(normalizedPhone);
    
    if (!validation.exists) {
      console.warn("Tentativa de login com telefone não cadastrado:", normalizedPhone);
      // IMPORTANTE: Supabase Auth Hook espera status 200 sempre
      // Não enviamos SMS/WhatsApp, apenas retornamos sucesso vazio para não quebrar o fluxo
      // O usuário não receberá código e não conseguirá fazer login
      return new Response(JSON.stringify({ 
        status: "blocked",
        reason: "franchisee_not_registered",
        message: "Telefone não cadastrado como franqueado"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    debugLog("Franqueado validado:", validation.franqueado?.full_name);
  } catch (e) {
    console.error("Erro na validação do franqueado:", e);
    // Fail-safe: em caso de erro técnico, permite continuar (não bloqueia o sistema)
    debugLog("Prosseguindo com envio apesar de erro na validação (fail-safe)");
  }

  const messageBody = `Seu código de acesso ao Girabot é: ${otp}`;
  const messageBodyWhats = `👋 GiraBot por aqui!

Aqui está seu código de acesso:

🗝️ ${otp}

Use o botão abaixo para copiar facilmente. Não compartilhe com ninguém. 😉

_⏳ Ele expira em 5 minutos_`;

  try {
    // Para SMS via Bird, precisamos do formato internacional com +55
    const phoneForSms = normalizedPhone.startsWith("55") ? `+${normalizedPhone}` : `+55${normalizedPhone}`;
    
    // Envio paralelo: SMS via Bird e WhatsApp via Z-API
    const [smsResult, whatsappResult] = await Promise.allSettled([
      sendSmsViaBird(phoneForSms, messageBody),
      sendWhatsAppViaZapi(normalizedPhone, messageBodyWhats),
    ]);

    const smsSuccess = smsResult.status === "fulfilled";
    const whatsappSuccess = whatsappResult.status === "fulfilled";

    if (!smsSuccess && !whatsappSuccess) {
      console.error("Ambos os envios falharam", {
        sms: smsResult.status === "rejected" ? smsResult.reason : null,
        whatsapp: whatsappResult.status === "rejected" ? whatsappResult.reason : null,
      });
      return new Response(JSON.stringify({ error: "Failed to send OTP via SMS and WhatsApp" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Envio concluído", { sms: smsSuccess, whatsapp: whatsappSuccess });
    return new Response(JSON.stringify({ 
      status: "sent", 
      channels: { sms: smsSuccess, whatsapp: whatsappSuccess } 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Erro crítico no envio", e);
    return new Response(JSON.stringify({ error: "Critical error sending OTP" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
});

function pickFirstDefined<T>(arr: (T | undefined | null)[]): T | undefined {
  for (const v of arr) if (v != null) return v;
  return undefined;
}

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
  franqueado?: { id: string; full_name: string } 
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

async function sendSmsViaBird(phoneNumber: string, messageBody: string) {
  const workspaceId = Deno.env.get("SMS_WORKSPACE_ID");
  const channelId = Deno.env.get("SMS_CHANNEL_ID");
  const accessKey = Deno.env.get("SMS_ACCESS_KEY");

  if (!workspaceId || !channelId || !accessKey) {
    throw new Error(
      "Missing SMS_WORKSPACE_ID / SMS_CHANNEL_ID / SMS_ACCESS_KEY env vars",
    );
  }

  const url = `https://api.bird.com/workspaces/${workspaceId}/channels/${channelId}/messages`;

  const body = {
    receiver: {
      contacts: [
        {
          identifierValue: phoneNumber,
          identifierKey: "phonenumber",
        },
      ],
    },
    body: {
      type: "text",
      text: {
        text: messageBody,
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `AccessKey ${accessKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bird API error: ${res.status} ${res.statusText} - ${text}`);
  }
}

async function sendWhatsAppViaZapi(phoneNumber: string, messageBody: string) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/zapi-send-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        phone: phoneNumber,
        message: messageBody,
        logData: {
          event_type: "auth_otp",
          user_action: "system",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Z-API function error: ${response.status} - ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error("Erro ao enviar WhatsApp:", error);
    throw error;
  }
}

// hmacHex removido (não necessário com standardwebhooks)
