import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResetPasswordRequest {
  user_id: string;
  full_name: string;
  phone_number: string;
  email?: string;
}

function generateRandomPassword(length: number = 8): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
  let password = "";
  
  // Garantir pelo menos um de cada tipo
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%&*";
  
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Preencher o resto
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Embaralhar a senha
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function sendWhatsAppMessage(phone: string, name: string, password: string) {
  try {
    const message = `Olá ${name}! 🔐

Sua nova senha de acesso foi gerada:

*Senha:* ${password}

⚠️ Por segurança, recomendamos que você altere sua senha após o primeiro login.

Entre no sistema em: https://sua-plataforma.com

Qualquer dúvida, estamos à disposição!`;

    const response = await fetch('https://api.z-api.io/instances/your-instance/token/your-token/send-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: `55${phone}`,
        message: message
      })
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    console.log('WhatsApp enviado com sucesso para:', phone);
    return true;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return false;
  }
}

async function sendEmailNotification(email: string, name: string, password: string) {
  try {
    // Aqui você implementaria o envio de email
    // Por exemplo, usando Resend, SendGrid, ou outro serviço
    console.log(`Email seria enviado para: ${email} com a senha: ${password}`);
    
    // Simulação de envio bem-sucedido
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { user_id, full_name, phone_number, email }: ResetPasswordRequest = await req.json();

    if (!user_id || !full_name || !phone_number) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Dados obrigatórios não fornecidos: user_id, full_name, phone_number'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Criar cliente Supabase com service role para acesso ao auth
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Gerar nova senha
    const newPassword = generateRandomPassword(8);
    console.log(`Nova senha gerada para usuário ${user_id}: ${newPassword}`);

    // Atualizar a senha do usuário no auth.users
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      password: newPassword
    });

    if (updateError) {
      console.error('Erro ao atualizar senha no Auth:', updateError);
      return new Response(JSON.stringify({
        success: false,
        error: `Erro ao atualizar senha: ${updateError.message}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Senha atualizada com sucesso no Auth');

    // Enviar notificações
    const promises = [];
    
    // WhatsApp
    promises.push(sendWhatsAppMessage(phone_number, full_name, newPassword));
    
    // Email (se disponível)
    if (email) {
      promises.push(sendEmailNotification(email, full_name, newPassword));
    }

    const results = await Promise.allSettled(promises);
    
    let whatsappSent = false;
    let emailSent = false;

    if (results[0].status === 'fulfilled') {
      whatsappSent = results[0].value;
    }

    if (results[1] && results[1].status === 'fulfilled') {
      emailSent = results[1].value;
    }

    console.log('Resultados do envio:', { whatsappSent, emailSent });

    return new Response(JSON.stringify({
      success: true,
      message: 'Senha resetada com sucesso!',
      notifications: {
        whatsapp: whatsappSent,
        email: emailSent
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro na função reset-user-password:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);