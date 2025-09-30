-- Correção: Atualizar função para compatibilidade com sistema de cobrança
-- A função agora envia no formato legacy esperado pela matriz-webhook

CREATE OR REPLACE FUNCTION public.notify_table_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  webhook_url TEXT;
  payload_data JSONB;
BEGIN
  -- URL da edge function webhook-dispatcher
  webhook_url := 'https://zqexpclhdrbnevxheiax.supabase.co/functions/v1/webhook-dispatcher';
  
  -- Montar payload no formato legacy compatível com matriz-webhook
  -- Formato: { "topic": "generic", "payload": { "table": "...", "record": {...} } }
  payload_data := jsonb_build_object(
    'topic', 'generic',
    'payload', jsonb_build_object(
      'table', TG_TABLE_NAME,
      'record', CASE 
        WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
        ELSE to_jsonb(NEW)
      END
    )
  );

  -- Enviar para webhook-dispatcher de forma assíncrona
  PERFORM net.http_post(
    url := webhook_url,
    body := payload_data,
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION public.notify_table_changes() IS 'Função que captura mudanças em tabelas e envia no formato legacy (table/record) para o webhook-dispatcher que distribui para sistemas consumidores cadastrados';