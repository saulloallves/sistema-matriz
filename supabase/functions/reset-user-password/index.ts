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

const sendWhatsApp = async (phone: string, message: string): Promise<boolean> => {
  try {
    const response = await fetch('https://qrdewkryvpwvdxygtxve.supabase.co/functions/v1/zapi-send-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZGV3a3J5dnB3dmR4eWd0eHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDAzOTksImV4cCI6MjA3MjQ3NjM5OX0.WLo3vRrsflLvqCu9a6qjo8QZerA9NqgpYaJuXbQNRFc',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZGV3a3J5dnB3dmR4eWd0eHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDAzOTksImV4cCI6MjA3MjQ3NjM5OX0.WLo3vRrsflLvqCu9a6qjo8QZerA9NqgpYaJuXbQNRFc'
      },
      body: JSON.stringify({
        phone: phone,
        message: message
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return false;
  }
};

const sendEmail = async (email: string, subject: string, html: string): Promise<boolean> => {
  try {
    const response = await fetch('https://qrdewkryvpwvdxygtxve.supabase.co/functions/v1/brevo-send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZGV3a3J5dnB3dmR4eWd0eHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDAzOTksImV4cCI6MjA3MjQ3NjM5OX0.WLo3vRrsflLvqCu9a6qjo8QZerA9NqgpYaJuXbQNRFc',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZGV3a3J5dnB3dmR4eWd0eHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDAzOTksImV4cCI6MjA3MjQ3NjM5OX0.WLo3vRrsflLvqCu9a6qjo8QZerA9NqgpYaJuXbQNRFc'
      },
      body: JSON.stringify({
        to: email,
        subject: subject,
        html: html,
        from: "sistema@crescieperdi.com.br",
        fromName: "Sistema de Gestão"
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
};

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

    // Preparar mensagens
    const whatsappMessage = `Olá ${full_name}! 🔐

Sua nova senha de acesso foi gerada:

*Senha:* ${newPassword}

⚠️ Por segurança, recomendamos que você altere sua senha após o primeiro login.

Qualquer dúvida, estamos à disposição!`;

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">
          🔐 Nova Senha de Acesso
        </h1>
      </div>
      
      <div style="padding: 40px 30px;">
        <h2 style="color: #333; margin-bottom: 20px;">Olá, ${full_name}!</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
          Uma nova senha foi gerada para sua conta no sistema. Use as credenciais abaixo para fazer login:
        </p>
        
        <div style="background: #f8f9ff; border: 2px solid #667eea; padding: 25px; border-radius: 12px; margin: 25px 0;">
          <p style="margin: 0 0 15px 0; color: #333;"><strong>Nova Senha:</strong></p>
          <p style="font-family: 'Courier New', monospace; font-size: 18px; color: #667eea; font-weight: bold; margin: 0; letter-spacing: 2px;">
            ${newPassword}
          </p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>⚠️ Importante:</strong> Por segurança, recomendamos que você altere sua senha após o primeiro login.
          </p>
        </div>
        
        <p style="color: #666; margin-top: 25px;">
          Se você tiver alguma dúvida ou precisar de ajuda, entre em contato com o suporte.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
        <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
          Sistema de Gestão - Reset de Senha
        </p>
      </div>
    </div>`;

    // Enviar notificações
    console.log('Enviando notificações...');
    
    const [whatsappSuccess, emailSuccess] = await Promise.all([
      sendWhatsApp(phone_number, whatsappMessage),
      email ? sendEmail(email, 'Nova Senha de Acesso - Sistema de Gestão', emailHtml) : Promise.resolve(false)
    ]);

    console.log('Resultados das notificações:', { whatsappSuccess, emailSuccess });

    return new Response(JSON.stringify({
      success: true,
      message: 'Senha resetada com sucesso!',
      notifications: {
        whatsapp: whatsappSuccess,
        email: emailSuccess
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