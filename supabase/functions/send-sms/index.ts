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
//   (Opcional) HOOK_SIGNING_SECRET

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
  const messageBody = `Seu código de login é: ${otp}`;

  try {
    // Envio paralelo: SMS via Bird e WhatsApp via Z-API
    const [smsResult, whatsappResult] = await Promise.allSettled([
      sendSmsViaBird(normalizedPhone, messageBody),
      sendWhatsAppViaZapi(normalizedPhone, messageBody),
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

    debugLog("Envio concluído", { sms: smsSuccess, whatsapp: whatsappSuccess });
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
  let p = raw.trim();
  // Remove espaços e hifens comuns
  p = p.replace(/[\s-]/g, "");
  // Se começar com 00, troca por +
  if (p.startsWith("00")) p = "+" + p.slice(2);
  // Se não tiver + e for só dígitos, adiciona + (assumindo já em formato país Ex: 55119...)
  if (!p.startsWith("+")) p = "+" + p;
  return p;
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
