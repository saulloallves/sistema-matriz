-- Função para normalizar um nome para Title Case
CREATE OR REPLACE FUNCTION public.to_title_case(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $function$
DECLARE
  words text[];
  result text := '';
  word text;
BEGIN
  IF input_text IS NULL OR trim(input_text) = '' THEN
    RETURN input_text;
  END IF;
  
  -- Split por espaços
  words := string_to_array(lower(trim(input_text)), ' ');
  
  -- Processar cada palavra
  FOREACH word IN ARRAY words
  LOOP
    IF word != '' THEN
      -- Primeira letra maiúscula, resto minúsculo
      result := result || initcap(word) || ' ';
    END IF;
  END LOOP;
  
  -- Remover espaço final
  RETURN trim(result);
END;
$function$;

-- Função para buscar nomes que precisam normalização
CREATE OR REPLACE FUNCTION public.get_nomes_para_normalizacao()
RETURNS TABLE(
  id uuid,
  tabela text,
  nome_atual text,
  nome_normalizado text
)
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
    f.id,
    'franqueados'::text as tabela,
    f.full_name as nome_atual,
    to_title_case(f.full_name) as nome_normalizado
  FROM franqueados f
  WHERE f.full_name != to_title_case(f.full_name)
    AND f.full_name IS NOT NULL
    AND trim(f.full_name) != ''
  
  UNION ALL
  
  -- Clientes
  SELECT 
    c.id::uuid,
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
    ci.id,
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
    cl.id,
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

-- Função para normalizar um nome individual
CREATE OR REPLACE FUNCTION public.normalizar_nome_pessoa(p_id uuid, p_tabela text)
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
    SELECT full_name INTO v_nome_atual FROM franqueados WHERE id = p_id;
    v_nome_normalizado := to_title_case(v_nome_atual);
    
    UPDATE franqueados 
    SET full_name = v_nome_normalizado, updated_at = now()
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    
  ELSIF p_tabela = 'clientes' THEN
    SELECT full_name INTO v_nome_atual FROM clientes WHERE id::uuid = p_id;
    v_nome_normalizado := to_title_case(v_nome_atual);
    
    UPDATE clientes 
    SET full_name = v_nome_normalizado, updated_at = now()
    WHERE id::uuid = p_id;
    
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    
  ELSIF p_tabela = 'colaboradores_interno' THEN
    SELECT employee_name INTO v_nome_atual FROM colaboradores_interno WHERE id = p_id;
    v_nome_normalizado := to_title_case(v_nome_atual);
    
    UPDATE colaboradores_interno 
    SET employee_name = v_nome_normalizado, updated_at = now()
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    
  ELSIF p_tabela = 'colaboradores_loja' THEN
    SELECT employee_name INTO v_nome_atual FROM colaboradores_loja WHERE id = p_id;
    v_nome_normalizado := to_title_case(v_nome_atual);
    
    UPDATE colaboradores_loja 
    SET employee_name = v_nome_normalizado, updated_at = now()
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    
  ELSE
    RAISE EXCEPTION 'Tabela inválida: %', p_tabela;
  END IF;

  -- Log da operação
  INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
  VALUES (
    auth.uid(),
    CASE WHEN p_tabela = 'franqueados' THEN p_id ELSE null END,
    'NORMALIZAR_NOME - tabela: ' || p_tabela || ' - de: "' || v_nome_atual || '" para: "' || v_nome_normalizado || '"',
    ARRAY['full_name', 'employee_name']
  );

  RETURN v_rows_affected > 0;
END;
$function$;

-- Função para normalizar todos os nomes
CREATE OR REPLACE FUNCTION public.normalizar_todos_nomes()
RETURNS json[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    nome_record RECORD;
    resultado json;
    resultados json[] := '{}';
    total_count integer := 0;
    success_count integer := 0;
    error_count integer := 0;
    error_message text;
BEGIN
    -- Verificar se o usuário é administrador
    IF NOT has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores podem executar esta função.';
    END IF;

    -- Log início da operação
    INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
    VALUES (
        auth.uid(),
        null,
        'NORMALIZACAO_NOMES_INICIADA',
        ARRAY['full_name', 'employee_name']
    );

    -- Processar cada registro
    FOR nome_record IN 
        SELECT * FROM get_nomes_para_normalizacao()
    LOOP
        total_count := total_count + 1;
        
        BEGIN
            -- Tentar normalizar o nome
            IF normalizar_nome_pessoa(nome_record.id, nome_record.tabela) THEN
                success_count := success_count + 1;
                resultado := json_build_object(
                    'id', nome_record.id,
                    'tabela', nome_record.tabela,
                    'nome_anterior', nome_record.nome_atual,
                    'nome_novo', nome_record.nome_normalizado,
                    'sucesso', true
                );
            ELSE
                error_count := error_count + 1;
                resultado := json_build_object(
                    'id', nome_record.id,
                    'tabela', nome_record.tabela,
                    'nome_anterior', nome_record.nome_atual,
                    'nome_novo', nome_record.nome_normalizado,
                    'sucesso', false
                );
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            error_message := SQLERRM;
            
            resultado := json_build_object(
                'id', nome_record.id,
                'tabela', nome_record.tabela,
                'nome_anterior', nome_record.nome_atual,
                'nome_novo', nome_record.nome_normalizado,
                'sucesso', false,
                'erro', error_message
            );
            
            -- Log do erro
            INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
            VALUES (
                auth.uid(),
                CASE WHEN nome_record.tabela = 'franqueados' THEN nome_record.id ELSE null END,
                'NORMALIZACAO_NOME_ERRO - ' || error_message,
                ARRAY['full_name', 'employee_name']
            );
        END;
        
        resultados := array_append(resultados, resultado);
    END LOOP;

    -- Log final da operação
    INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
    VALUES (
        auth.uid(),
        null,
        'NORMALIZACAO_NOMES_FINALIZADA - Total: ' || total_count || ' - Sucessos: ' || success_count || ' - Erros: ' || error_count,
        ARRAY['full_name', 'employee_name']
    );

    RETURN resultados;
END;
$function$;