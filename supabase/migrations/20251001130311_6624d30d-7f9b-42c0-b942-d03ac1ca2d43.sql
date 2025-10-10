-- Função temporária para reenviar eventos de normalização
CREATE OR REPLACE FUNCTION reenviar_webhooks_normalizacao()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  franqueado_record RECORD;
  total_enviados integer := 0;
BEGIN
  -- Verifica se o usuário é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem executar esta função.';
  END IF;

  -- Para cada franqueado normalizado recentemente, dispara o webhook
  FOR franqueado_record IN 
    SELECT * FROM franqueados
    WHERE updated_at > NOW() - INTERVAL '1 hour'
    ORDER BY updated_at DESC
  LOOP
    -- Dispara o webhook manualmente
    PERFORM notify_table_changes();
    total_enviados := total_enviados + 1;
  END LOOP;

  RETURN json_build_object(
    'sucesso', true,
    'total_enviados', total_enviados,
    'mensagem', total_enviados || ' webhooks reenviados com sucesso'
  );
END;
$$;