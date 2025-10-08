import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface CreateUserRequest {
  full_name: string;
  email: string;
  phone_number: string;
  notes?: string;
  role?: string;
}

const generateRandomPassword = (): string => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    // Inicializar cliente Supabase com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { full_name, email, phone_number, notes, role }: CreateUserRequest = await req.json();

    console.log('Criando usuário:', { full_name, email, phone_number, role });

    // Validar dados obrigatórios
    if (!full_name || !email || !phone_number) {
      throw new Error('Nome completo, email e telefone são obrigatórios');
    }

    // Gerar senha aleatória
    const password = generateRandomPassword();
    console.log('Senha gerada para o usuário');

    // Obter ID do usuário que está criando
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header:', authHeader ? 'presente' : 'ausente');
    
    if (!authHeader) {
      throw new Error('Token de autorização necessário');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extraído, tamanho:', token.length);
    
    // Decodificar JWT para extrair user_id
    let currentUserId: string;
    try {
      // Decodificar o JWT (sem verificação de assinatura, apenas extração de dados)
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      currentUserId = decodedPayload.sub;
      console.log('User ID extraído do token:', currentUserId);
      
      if (!currentUserId) {
        throw new Error('User ID não encontrado no token');
      }
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      throw new Error('Token inválido - não foi possível decodificar');
    }

    // Criar usuário no auth com service role
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        full_name: full_name,
        phone_number: phone_number,
        notes: notes,
        created_by: currentUserId
      }
    });

    if (createError) {
      console.error('Erro ao criar usuário:', createError);
      
      // Verificar se é erro de email já existente
      if (createError.code === 'email_exists' || createError.message.includes('already been registered')) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Este email já está cadastrado no sistema. Por favor, use um email diferente.',
          error_code: 'email_exists'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Erro ao criar usuário: ${createError.message}`);
    }

    console.log('Usuário criado com sucesso:', newUser.user?.id);

    // O profile será criado automaticamente pelo trigger handle_new_user()
    // Não precisamos criar manualmente aqui
    console.log('Profile será criado automaticamente pelo trigger');

    // Criar role do usuário (padrão: admin se não especificado)
    const userRole = role || 'admin';
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: newUser.user!.id,
        role: userRole
      });

    if (roleError) {
      console.error('Erro ao criar role:', roleError);
      // Não falhar a criação do usuário por causa do role, apenas logar
    } else {
      console.log('Role criado com sucesso:', userRole);
    }

    // Preparar mensagens
    const whatsappMessage = `🎉 Bem-vindo(a) ao Sistema de Gestão!

Olá, ${full_name}!

Suas credenciais de acesso foram criadas:
📧 Email: ${email}
🔑 Senha: ${password}

Acesse o sistema e faça seu primeiro login.

Mantenha suas credenciais em local seguro.`;

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1976d2, #42a5f5); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Bem-vindo(a) ao Sistema!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
        <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
          Olá, <strong>${full_name}</strong>!
        </p>
        
        <p style="color: #666; margin-bottom: 25px;">
          Suas credenciais de acesso ao sistema foram criadas com sucesso. Use os dados abaixo para fazer seu primeiro login:
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #1976d2; margin: 20px 0;">
          <p style="margin: 0; color: #333;"><strong>📧 Email:</strong> ${email}</p>
          <p style="margin: 10px 0 0 0; color: #333;"><strong>🔑 Senha:</strong> <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px;">${password}</code></p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>⚠️ Importante:</strong> Mantenha suas credenciais em local seguro e considere alterar a senha após o primeiro acesso.
          </p>
        </div>
        
        <p style="color: #666; margin-top: 25px;">
          Se você tiver alguma dúvida ou precisar de ajuda, entre em contato com o suporte.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
        <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
          Sistema de Gestão - Acesso Restrito
        </p>
      </div>
    </div>`;

    // Enviar notificações
    console.log('Enviando notificações...');
    
    const [whatsappSuccess, emailSuccess] = await Promise.all([
      sendWhatsApp(phone_number, whatsappMessage),
      sendEmail(email, 'Credenciais de Acesso - Sistema de Gestão', emailHtml)
    ]);

    console.log('Resultados das notificações:', { whatsappSuccess, emailSuccess });

    return new Response(JSON.stringify({
      success: true,
      user_id: newUser.user!.id,
      notifications: {
        whatsapp: whatsappSuccess,
        email: emailSuccess
      },
      message: 'Usuário criado com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro na função:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});