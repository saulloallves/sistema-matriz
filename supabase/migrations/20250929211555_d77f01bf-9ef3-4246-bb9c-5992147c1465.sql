-- Função para buscar unidades com nomes divergentes
CREATE OR REPLACE FUNCTION public.get_unidades_para_normalizacao()
RETURNS TABLE(
  group_code bigint,
  nome_atual text,
  nome_correto text,
  id_unidades uuid,
  id_unidades_old text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verifica se o usuário é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem executar esta função.';
  END IF;

  RETURN QUERY
  SELECT 
    u.group_code,
    u.group_name as nome_atual,
    uo.group_name as nome_correto,
    u.id as id_unidades,
    uo.id as id_unidades_old
  FROM unidades u
  INNER JOIN unidades_old uo ON u.group_code = uo.group_code
  WHERE u.group_name != uo.group_name
    AND uo.group_name IS NOT NULL
    AND trim(uo.group_name) != ''
  ORDER BY u.group_code;
END;
$$;

-- Função para normalizar uma unidade específica
CREATE OR REPLACE FUNCTION public.normalizar_nome_unidade(p_group_code bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_nome_correto text;
  v_nome_atual text;
BEGIN
  -- Verifica se o usuário é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem executar esta função.';
  END IF;

  -- Busca o nome correto da unidades_old
  SELECT uo.group_name, u.group_name 
  INTO v_nome_correto, v_nome_atual
  FROM unidades_old uo
  INNER JOIN unidades u ON u.group_code = uo.group_code
  WHERE uo.group_code = p_group_code
    AND uo.group_name IS NOT NULL
    AND trim(uo.group_name) != '';

  -- Se não encontrou ou os nomes já são iguais, retorna false
  IF v_nome_correto IS NULL OR v_nome_correto = v_nome_atual THEN
    RETURN false;
  END IF;

  -- Atualiza o nome na tabela unidades
  UPDATE unidades 
  SET 
    group_name = v_nome_correto,
    updated_at = now()
  WHERE group_code = p_group_code;

  -- Log da operação (se houver tabela de auditoria)
  INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
  VALUES (
    auth.uid(), 
    null, 
    'NORMALIZAR_NOME_UNIDADE - group_code: ' || p_group_code::text || ' - de: "' || v_nome_atual || '" para: "' || v_nome_correto || '"',
    ARRAY['group_name']
  );

  RETURN true;
END;
$$;

-- Função para normalizar todas as unidades
CREATE OR REPLACE FUNCTION public.normalizar_todas_unidades()
RETURNS TABLE(
  group_code bigint,
  nome_anterior text,
  nome_novo text,
  sucesso boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rec RECORD;
  v_total_processadas integer := 0;
  v_total_sucesso integer := 0;
BEGIN
  -- Verifica se o usuário é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem executar esta função.';
  END IF;

  -- Processa cada unidade com nome divergente
  FOR rec IN 
    SELECT 
      u.group_code,
      u.group_name as nome_atual,
      uo.group_name as nome_correto
    FROM unidades u
    INNER JOIN unidades_old uo ON u.group_code = uo.group_code
    WHERE u.group_name != uo.group_name
      AND uo.group_name IS NOT NULL
      AND trim(uo.group_name) != ''
  LOOP
    v_total_processadas := v_total_processadas + 1;
    
    BEGIN
      -- Atualiza o nome
      UPDATE unidades 
      SET 
        group_name = rec.nome_correto,
        updated_at = now()
      WHERE group_code = rec.group_code;
      
      v_total_sucesso := v_total_sucesso + 1;
      
      -- Retorna o resultado para esta unidade
      group_code := rec.group_code;
      nome_anterior := rec.nome_atual;
      nome_novo := rec.nome_correto;
      sucesso := true;
      RETURN NEXT;
      
    EXCEPTION WHEN OTHERS THEN
      -- Em caso de erro, retorna com sucesso = false
      group_code := rec.group_code;
      nome_anterior := rec.nome_atual;
      nome_novo := rec.nome_correto;
      sucesso := false;
      RETURN NEXT;
    END;
  END LOOP;

  -- Log geral da operação
  INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
  VALUES (
    auth.uid(), 
    null, 
    'NORMALIZAR_TODAS_UNIDADES - Total processadas: ' || v_total_processadas || ' - Sucessos: ' || v_total_sucesso,
    ARRAY['group_name']
  );
END;
$$;