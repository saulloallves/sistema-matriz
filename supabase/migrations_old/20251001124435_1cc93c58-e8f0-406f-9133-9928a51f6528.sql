-- Remover funções antigas
DROP FUNCTION IF EXISTS public.get_nomes_para_normalizacao();
DROP FUNCTION IF EXISTS public.normalizar_nome_pessoa(uuid, text);

-- Recriar função get_nomes_para_normalizacao com ID como text
CREATE OR REPLACE FUNCTION public.get_nomes_para_normalizacao()
 RETURNS TABLE(id text, tabela text, nome_atual text, nome_normalizado text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se o usuário é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem executar esta função.';
  END IF;

  RETURN QUERY
  -- Franqueados
  SELECT 
    f.id::text,
    'franqueados'::text as tabela,
    f.full_name as nome_atual,
    to_title_case(f.full_name) as nome_normalizado
  FROM franqueados f
  WHERE f.full_name != to_title_case(f.full_name)
    AND f.full_name IS NOT NULL
    AND trim(f.full_name) != ''
  
  UNION ALL
  
  -- Clientes (id é bigint, converter para text)
  SELECT 
    c.id::text,
    'clientes'::text as tabela,
    c.full_name as nome_atual,
    to_title_case(c.full_name) as nome_normalizado
  FROM clientes c
  WHERE c.full_name != to_title_case(c.full_name)
    AND c.full_name IS NOT NULL
    AND trim(c.full_name) != ''
  
  UNION ALL
  
  -- Colaboradores Interno
  SELECT 
    ci.id::text,
    'colaboradores_interno'::text as tabela,
    ci.employee_name as nome_atual,
    to_title_case(ci.employee_name) as nome_normalizado
  FROM colaboradores_interno ci
  WHERE ci.employee_name != to_title_case(ci.employee_name)
    AND ci.employee_name IS NOT NULL
    AND trim(ci.employee_name) != ''
  
  UNION ALL
  
  -- Colaboradores Loja
  SELECT 
    cl.id::text,
    'colaboradores_loja'::text as tabela,
    cl.employee_name as nome_atual,
    to_title_case(cl.employee_name) as nome_normalizado
  FROM colaboradores_loja cl
  WHERE cl.employee_name != to_title_case(cl.employee_name)
    AND cl.employee_name IS NOT NULL
    AND trim(cl.employee_name) != ''
  
  ORDER BY tabela, nome_atual;
END;
$function$;

-- Recriar função normalizar_nome_pessoa com ID como text
CREATE OR REPLACE FUNCTION public.normalizar_nome_pessoa(p_id text, p_tabela text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_nome_atual text;
  v_nome_normalizado text;
  v_rows_affected integer;
BEGIN
  -- Verificar se o usuário é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem executar esta função.';
  END IF;

  -- Processar baseado na tabela
  IF p_tabela = 'franqueados' THEN
    SELECT full_name INTO v_nome_atual FROM franqueados WHERE id = p_id::uuid;
    v_nome_normalizado := to_title_case(v_nome_atual);
    
    UPDATE franqueados 
    SET full_name = v_nome_normalizado, updated_at = now()
    WHERE id = p_id::uuid;
    
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    
  ELSIF p_tabela = 'clientes' THEN
    SELECT full_name INTO v_nome_atual FROM clientes WHERE id = p_id::bigint;
    v_nome_normalizado := to_title_case(v_nome_atual);
    
    UPDATE clientes 
    SET full_name = v_nome_normalizado, updated_at = now()
    WHERE id = p_id::bigint;
    
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    
  ELSIF p_tabela = 'colaboradores_interno' THEN
    SELECT employee_name INTO v_nome_atual FROM colaboradores_interno WHERE id = p_id::uuid;
    v_nome_normalizado := to_title_case(v_nome_atual);
    
    UPDATE colaboradores_interno 
    SET employee_name = v_nome_normalizado, updated_at = now()
    WHERE id = p_id::uuid;
    
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    
  ELSIF p_tabela = 'colaboradores_loja' THEN
    SELECT employee_name INTO v_nome_atual FROM colaboradores_loja WHERE id = p_id::uuid;
    v_nome_normalizado := to_title_case(v_nome_atual);
    
    UPDATE colaboradores_loja 
    SET employee_name = v_nome_normalizado, updated_at = now()
    WHERE id = p_id::uuid;
    
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    
  ELSE
    RAISE EXCEPTION 'Tabela inválida: %', p_tabela;
  END IF;

  -- Log da operação
  INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
  VALUES (
    auth.uid(),
    CASE WHEN p_tabela = 'franqueados' THEN p_id::uuid ELSE null END,
    'NORMALIZAR_NOME - tabela: ' || p_tabela || ' - de: "' || v_nome_atual || '" para: "' || v_nome_normalizado || '"',
    ARRAY['full_name', 'employee_name']
  );

  RETURN v_rows_affected > 0;
END;
$function$;