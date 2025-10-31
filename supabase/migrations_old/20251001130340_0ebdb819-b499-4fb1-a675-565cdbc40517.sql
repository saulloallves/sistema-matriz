-- Função corrigida para reenviar webhooks através de UPDATE
CREATE OR REPLACE FUNCTION reenviar_webhooks_normalizacao()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_atualizados integer := 0;
BEGIN
  -- Verifica se o usuário é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem executar esta função.';
  END IF;

  -- Faz um UPDATE "dummy" em todos os franqueados normalizados na última hora
  -- Isso vai disparar o trigger notify_table_changes automaticamente
  UPDATE franqueados
  SET updated_at = updated_at  -- UPDATE sem mudança real, só para disparar trigger
  WHERE updated_at > NOW() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS total_atualizados = ROW_COUNT;

  -- Log da operação
  INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
  VALUES (
    auth.uid(),
    null,
    'REENVIO_WEBHOOKS_NORMALIZACAO - Total: ' || total_atualizados || ' webhooks reenviados',
    ARRAY['updated_at']
  );

  RETURN json_build_object(
    'sucesso', true,
    'total_atualizados', total_atualizados,
    'mensagem', total_atualizados || ' webhooks reenviados com sucesso'
  );
END;
$$;