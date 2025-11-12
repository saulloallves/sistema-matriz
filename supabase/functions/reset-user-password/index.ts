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
    // Usar Edge Function local do próprio sistema
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const response = await fetch(`${supabaseUrl}/functions/v1/zapi-send-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
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
    // Usar Edge Function local do próprio sistema
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const response = await fetch(`${supabaseUrl}/functions/v1/brevo-send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
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
    const { email }: { email: string } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Dados obrigatórios não fornecidos: email'
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

    // 1. Buscar o usuário pelo email
    const { data: usersWithEmails, error: searchError } = await supabaseAdmin
      .rpc('get_users_with_emails');

    if (searchError) {
      // Log detalhado do erro que vem do Supabase
      console.error('Erro detalhado da RPC get_users_with_emails:', JSON.stringify(searchError, null, 2));
      throw new Error('Erro ao executar a RPC get_users_with_emails.');
    }

    const user = usersWithEmails?.find(
      (u: { email?: string; user_id: string; full_name: string; phone_number: string }) =>
        u.email?.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (!user) {
      throw new Error('Email não encontrado no sistema.');
    }

    // Log de Diagnóstico: Exibe os dados do usuário encontrado.
    console.log('Dados do usuário encontrados:', JSON.stringify(user, null, 2));

    // 2. Gerar nova senha
    const newPassword = Math.random().toString(36).slice(-8);

    // 3. Atualizar a senha do usuário no Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.user_id,
      { password: newPassword }
    );

    if (updateError) {
      throw new Error('Erro ao atualizar a senha.');
    }
    console.log(`Senha para o usuário ${user.user_id} atualizada com sucesso no Auth.`);

    // 4. Preparar e enviar notificações
    const whatsappMessage = `Olá, ${user.full_name}! 🔐 Sua nova senha de acesso ao sistema Girabot foi gerada:\n\n*Senha:* ${newPassword}\n\nPor segurança, recomendamos que você a altere após o primeiro login.`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #E3A024, #42a5f5); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Sua senha foi redefinida!</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Olá, <strong>${user.full_name}</strong>!
          </p>
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Conforme solicitado, sua senha de acesso ao <strong>Girabot</strong> foi redefinida.
          </p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
            <h3 style="color: #E3A024; margin-top: 0;">Sua Nova Senha</h3>
            <p style="margin: 10px 0; font-size: 20px; font-weight: bold; letter-spacing: 2px;">${newPassword}</p>
          </div>
          <p style="font-size: 16px; color: #333; margin-top: 20px;">
            Recomendamos que você altere esta senha para uma de sua preferência após o login.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
            <p style="color: #666; font-size: 14px;">
              Atenciosamente,<br/>
              <strong>Equipe Cresci e Perdi</strong>
            </p>
          </div>
        </div>
      </div>
    `;

    // Chamar a função de envio de email e verificar o erro
    const { error: emailError } = await supabaseAdmin.functions.invoke('brevo-send-email', {
      body: {
        to: user.email,
        subject: 'Sua nova senha de acesso ao Girabot',
        html: emailHtml,
        from: "sistema@crescieperdi.com.br",
        fromName: "Sistema de Gestão"
      }
    });

    if (emailError) {
      console.error('Erro ao invocar a função de e-mail:', emailError);
      throw new Error('Falha ao enviar o e-mail de redefinição.');
    }
    console.log('E-mail de redefinição enviado com sucesso.');

    // Chamar a função de envio de WhatsApp e verificar o erro
    if (user.phone_number) {
      console.log(`Tentando enviar WhatsApp para o número: ${user.phone_number}`);
      const { error: whatsappError } = await supabaseAdmin.functions.invoke('zapi-send-text', {
        body: {
          phone: user.phone_number,
          message: whatsappMessage,
          logData: {
            event_type: 'password_reset',
            user_action: 'system'
          }
        }
      });

      if (whatsappError) {
        console.error('Erro ao invocar a função de WhatsApp:', whatsappError);
        throw new Error('Falha ao enviar a notificação via WhatsApp.');
      }
      console.log('WhatsApp de redefinição enviado com sucesso.');
    } else {
      // Log de Diagnóstico: Informa por que o envio de WhatsApp foi pulado.
      console.log('Envio de WhatsApp pulado: o usuário não possui um número de telefone (phone_number).');
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Senha resetada com sucesso!'
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