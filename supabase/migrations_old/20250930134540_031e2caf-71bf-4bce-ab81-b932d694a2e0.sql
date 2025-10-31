-- Fase 1: Sistema Real-time de Sincronização da Matriz
-- Criar função para notificar mudanças nas tabelas e enviar para webhook-dispatcher

CREATE OR REPLACE FUNCTION public.notify_table_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_data JSONB;
  operation_type TEXT;
  webhook_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Determinar tipo de operação
  operation_type := TG_OP;
  
  -- URL da edge function webhook-dispatcher
  webhook_url := 'https://zqexpclhdrbnevxheiax.supabase.co/functions/v1/webhook-dispatcher';
  
  -- Service role key para autenticação
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Montar payload estruturado
  event_data := jsonb_build_object(
    'event_id', gen_random_uuid(),
    'timestamp', now(),
    'table', TG_TABLE_NAME,
    'operation', operation_type,
    'user_id', auth.uid(),
    'data', CASE 
      WHEN TG_OP = 'DELETE' THEN jsonb_build_object('before', to_jsonb(OLD))
      WHEN TG_OP = 'INSERT' THEN jsonb_build_object('after', to_jsonb(NEW))
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW))
    END,
    'metadata', jsonb_build_object(
      'source', 'matriz-system',
      'version', '1.0'
    )
  );

  -- Enviar para webhook-dispatcher de forma assíncrona
  PERFORM net.http_post(
    url := webhook_url,
    body := jsonb_build_object(
      'topic', TG_TABLE_NAME || '_changed',
      'payload', event_data
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(service_role_key, '')
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Criar triggers para tabela franqueados
DROP TRIGGER IF EXISTS notify_franqueados_changes ON public.franqueados;
CREATE TRIGGER notify_franqueados_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.franqueados
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_table_changes();

-- Criar triggers para tabela unidades
DROP TRIGGER IF EXISTS notify_unidades_changes ON public.unidades;
CREATE TRIGGER notify_unidades_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.unidades
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_table_changes();

-- Criar triggers para tabela franqueados_unidades
DROP TRIGGER IF EXISTS notify_franqueados_unidades_changes ON public.franqueados_unidades;
CREATE TRIGGER notify_franqueados_unidades_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.franqueados_unidades
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_table_changes();

-- Criar triggers para tabela profiles
DROP TRIGGER IF EXISTS notify_profiles_changes ON public.profiles;
CREATE TRIGGER notify_profiles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_table_changes();

-- Criar triggers para tabela unidades_grupos_whatsapp
DROP TRIGGER IF EXISTS notify_unidades_grupos_whatsapp_changes ON public.unidades_grupos_whatsapp;
CREATE TRIGGER notify_unidades_grupos_whatsapp_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.unidades_grupos_whatsapp
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_table_changes();

-- Comentários explicativos
COMMENT ON FUNCTION public.notify_table_changes() IS 'Função que captura mudanças em tabelas e envia eventos para o webhook-dispatcher para sincronização real-time com sistemas consumidores';
COMMENT ON TRIGGER notify_franqueados_changes ON public.franqueados IS 'Trigger para sincronização real-time de mudanças em franqueados';
COMMENT ON TRIGGER notify_unidades_changes ON public.unidades IS 'Trigger para sincronização real-time de mudanças em unidades';
COMMENT ON TRIGGER notify_franqueados_unidades_changes ON public.franqueados_unidades IS 'Trigger para sincronização real-time de vínculos franqueado-unidade';
COMMENT ON TRIGGER notify_profiles_changes ON public.profiles IS 'Trigger para sincronização real-time de mudanças em perfis de usuário';
COMMENT ON TRIGGER notify_unidades_grupos_whatsapp_changes ON public.unidades_grupos_whatsapp IS 'Trigger para sincronização real-time de grupos WhatsApp das unidades';