import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Franchisee {
  id: string;
  email: string;
  full_name: string;
  cpf_rnm: string;
  contact: string;
  systems_password: string;
  created_at: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: franchisees, error: fetchError } = await supabaseAdmin
      .from('franqueados')
      .select('*')
      .not('email', 'is', null)
      .not('systems_password', 'is', null)
      .neq('email', '')
      .neq('systems_password', '');

    if (fetchError) {
      throw new Error(`Erro ao buscar franqueados: ${fetchError.message}`);
    }

    const primaryUsersByEmail = new Map<string, Franchisee>();
    franchisees.forEach((f: Franchisee) => {
      const existing = primaryUsersByEmail.get(f.email);
      if (!existing || new Date(f.created_at) < new Date(existing.created_at)) {
        primaryUsersByEmail.set(f.email, f);
      }
    });

    let duplicateCounter = 0;
    const migrationTasks = franchisees.map((f: Franchisee) => {
      const primaryUser = primaryUsersByEmail.get(f.email);
      const isPrimary = primaryUser?.id === f.id;
      const targetEmail = isPrimary ? f.email : `atualizaremail@emailduplicado${duplicateCounter++}.com.br`;

      return {
        franchiseeId: f.id,
        email: targetEmail,
        password: f.systems_password,
        phone: f.contact,
        user_metadata: {
          full_name: f.full_name,
          original_contact: f.contact,
          franqueado_id: f.id,
          cpf_rnm: f.cpf_rnm,
          original_email: f.email,
          notes: 'Usuário migrado da tabela de franqueados.',
        },
      };
    });

    // Contadores para o relatório final
    let migratedCount = 0;
    let skippedAlreadyExists = 0;
    let skippedInvalidData = 0;
    let failedUnexpected = 0;
    const errors: string[] = [];

    for (const task of migrationTasks) {
      try {
        // A chamada para createUser pode lançar um erro
        const { error } = await supabaseAdmin.auth.admin.createUser({
          email: task.email,
          password: task.password,
          phone: task.phone,
          user_metadata: task.user_metadata,
          email_confirm: true,
        });

        if (error) {
          // Se a API retornar um erro sem lançar, tratamos aqui
          throw error;
        }
        
        // Se não houver erro, foi um sucesso
        migratedCount++;

      } catch (error) {
        // Inspeciona o erro para categorizá-lo e continuar o loop
        if (error.name === 'AuthApiError') {
          if (error.status === 422 || error.message.includes('already been registered')) {
            skippedAlreadyExists++;
            console.warn(`Usuário com e-mail ${task.email} já existe. Pulando.`);
          } else if (error.status === 400 || error.message.includes('invalid format')) {
            skippedInvalidData++;
            const errorMessage = `E-mail inválido para franqueado ID ${task.franchiseeId} (e-mail usado: ${task.email}).`;
            console.error(errorMessage);
            errors.push(errorMessage);
          } else {
            failedUnexpected++;
            const errorMessage = `Falha de Auth API ao migrar franqueado ID ${task.franchiseeId}: ${error.message}`;
            console.error(errorMessage, error);
            errors.push(errorMessage);
          }
        } else {
          // Erro não relacionado à API de Auth (ex: rede)
          failedUnexpected++;
          const errorMessage = `Falha inesperada ao migrar franqueado ID ${task.franchiseeId}: ${error.message}`;
          console.error(errorMessage, error);
          errors.push(errorMessage);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Migração concluída.',
        migrated: migratedCount,
        skipped_already_exists: skippedAlreadyExists,
        skipped_invalid_data: skippedInvalidData,
        failed_unexpected: failedUnexpected,
        errors: errors,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});