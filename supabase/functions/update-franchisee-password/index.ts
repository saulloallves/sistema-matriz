/* eslint-disable @typescript-eslint/no-explicit-any */
// Edge Function: update-franchisee-password
// Atualiza a senha do franqueado em auth.users quando systems_password é alterada
//
// Variáveis de ambiente esperadas:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

interface UpdatePasswordRequest {
  franqueado_id: string;
  new_password: string | number;
  email?: string;
  phone?: string;
}

interface UpdatePasswordResponse {
  success: boolean;
  message: string;
  auth_user_id?: string;
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
    const body = (await req.json()) as UpdatePasswordRequest;
    const { franqueado_id, new_password, email, phone } = body;

    if (!franqueado_id || !new_password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "franqueado_id e new_password são obrigatórios",
        } as UpdatePasswordResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    // @ts-expect-error Deno remote import resolved at runtime
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Converter senha para string
    const passwordString = String(new_password);

    // Buscar usuário auth existente vinculado ao franqueado
    let authUserId: string | null = null;

    // Estratégia 1: Buscar por email se fornecido
    if (email && email.trim() !== "") {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (!userError && userData?.users) {
        const foundUser = userData.users.find((u: any) => u.email === email.toLowerCase());
        if (foundUser) {
          authUserId = foundUser.id;
          console.log(`Usuário encontrado por email: ${email} -> ID: ${authUserId}`);
        }
      }
    }

    // Estratégia 2: Buscar por phone se não encontrou por email
    if (!authUserId && phone && phone.trim() !== "") {
      const cleanPhone = phone.replace(/\D/g, "");
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (!userError && userData?.users) {
        const foundUser = userData.users.find((u: any) => {
          const userPhone = u.phone?.replace(/\D/g, "") || "";
          return userPhone.includes(cleanPhone) || cleanPhone.includes(userPhone);
        });
        if (foundUser) {
          authUserId = foundUser.id;
          console.log(`Usuário encontrado por telefone: ${phone} -> ID: ${authUserId}`);
        }
      }
    }

    // Estratégia 3: Buscar por user_metadata.franqueado_id
    if (!authUserId) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (!userError && userData?.users) {
        const foundUser = userData.users.find((u: any) => 
          u.user_metadata?.franqueado_id === franqueado_id
        );
        if (foundUser) {
          authUserId = foundUser.id;
          console.log(`Usuário encontrado por franqueado_id: ${franqueado_id} -> ID: ${authUserId}`);
        }
      }
    }

    if (!authUserId) {
      console.warn(`Usuário auth não encontrado para franqueado ${franqueado_id}`);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Usuário de autenticação não encontrado. Crie um usuário auth antes de atualizar a senha.",
        } as UpdatePasswordResponse),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Atualizar senha do usuário usando Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authUserId,
      { password: passwordString }
    );

    if (updateError) {
      console.error("Erro ao atualizar senha:", updateError);
      throw new Error(`Falha ao atualizar senha: ${updateError.message}`);
    }

    console.log(`✅ Senha atualizada com sucesso para auth.user ID: ${authUserId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Senha atualizada com sucesso em auth.users",
        auth_user_id: authUserId,
      } as UpdatePasswordResponse),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Erro ao processar atualização de senha:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Erro ao atualizar senha",
      } as UpdatePasswordResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
