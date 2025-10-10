-- Função para buscar contatos que precisam de normalização
CREATE OR REPLACE FUNCTION public.get_contatos_para_normalizacao()
RETURNS TABLE(
  franqueado_id uuid,
  nome_franqueado text,
  contato_atual text,
  contato_normalizado text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verifica se o usuário é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem executar esta função.';
  END IF;

  RETURN QUERY
  SELECT 
    f.id as franqueado_id,
    f.full_name as nome_franqueado,
    f.contact as contato_atual,
    regexp_replace(f.contact, '[^0-9]', '', 'g') as contato_normalizado
  FROM franqueados f
  WHERE f.contact ~ '[^0-9]'
  ORDER BY f.full_name;
END;
$function$;

-- Função para normalizar o contato de um franqueado específico
CREATE OR REPLACE FUNCTION public.normalizar_contato_franqueado(p_franqueado_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_contato_atual text;
  v_contato_normalizado text;
BEGIN
  -- Verifica se o usuário é admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem executar esta função.';
  END IF;

  -- Busca o contato atual e calcula o normalizado
  SELECT 
    f.contact,
    regexp_replace(f.contact, '[^0-9]', '', 'g')
  INTO v_contato_atual, v_contato_normalizado
  FROM franqueados f
  WHERE f.id = p_franqueado_id
    AND f.contact ~ '[^0-9]';

  -- Se não encontrou ou já está normalizado, retorna false
  IF v_contato_normalizado IS NULL OR v_contato_atual = v_contato_normalizado THEN
    RETURN false;
  END IF;

  -- Atualiza o contato na tabela franqueados
  UPDATE franqueados 
  SET 
    contact = v_contato_normalizado,
    updated_at = now()
  WHERE id = p_franqueado_id;

  -- Log da operação
  INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
  VALUES (
    auth.uid(), 
    p_franqueado_id, 
    'NORMALIZAR_CONTATO - de: "' || v_contato_atual || '" para: "' || v_contato_normalizado || '"',
    ARRAY['contact']
  );

  RETURN true;
END;
$function$;

-- Função para normalizar todos os contatos
CREATE OR REPLACE FUNCTION public.normalizar_todos_contatos()
RETURNS json[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    franqueado_record RECORD;
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
        'NORMALIZACAO_CONTATOS_INICIADA',
        ARRAY['contact']
    );

    -- Buscar todos os franqueados que precisam normalização
    FOR franqueado_record IN 
        SELECT 
            f.id,
            f.full_name,
            f.contact as contato_atual,
            regexp_replace(f.contact, '[^0-9]', '', 'g') as contato_normalizado
        FROM franqueados f
        WHERE f.contact ~ '[^0-9]'
        ORDER BY f.full_name
    LOOP
        total_count := total_count + 1;
        
        BEGIN
            -- Tentar atualizar o contato individual
            UPDATE franqueados 
            SET 
                contact = franqueado_record.contato_normalizado,
                updated_at = now()
            WHERE id = franqueado_record.id;
            
            -- Verificar se a atualização foi bem-sucedida
            IF FOUND THEN
                success_count := success_count + 1;
                resultado := json_build_object(
                    'franqueado_id', franqueado_record.id,
                    'nome_franqueado', franqueado_record.full_name,
                    'contato_anterior', franqueado_record.contato_atual,
                    'contato_novo', franqueado_record.contato_normalizado,
                    'sucesso', true
                );
                
                -- Log da normalização individual bem-sucedida
                INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
                VALUES (
                    auth.uid(),
                    franqueado_record.id,
                    'NORMALIZACAO_CONTATO_SUCESSO - de: "' || franqueado_record.contato_atual || '" para: "' || franqueado_record.contato_normalizado || '"',
                    ARRAY['contact']
                );
            ELSE
                error_count := error_count + 1;
                error_message := 'Nenhuma linha foi atualizada para franqueado_id: ' || franqueado_record.id;
                
                resultado := json_build_object(
                    'franqueado_id', franqueado_record.id,
                    'nome_franqueado', franqueado_record.full_name,
                    'contato_anterior', franqueado_record.contato_atual,
                    'contato_novo', franqueado_record.contato_normalizado,
                    'sucesso', false
                );
                
                -- Log do erro
                INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
                VALUES (
                    auth.uid(),
                    franqueado_record.id,
                    'NORMALIZACAO_CONTATO_ERRO - ' || error_message,
                    ARRAY['contact']
                );
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            error_message := SQLERRM;
            
            resultado := json_build_object(
                'franqueado_id', franqueado_record.id,
                'nome_franqueado', franqueado_record.full_name,
                'contato_anterior', franqueado_record.contato_atual,
                'contato_novo', franqueado_record.contato_normalizado,
                'sucesso', false
            );
            
            -- Log do erro com detalhes da exceção
            INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
            VALUES (
                auth.uid(),
                franqueado_record.id,
                'NORMALIZACAO_CONTATO_ERRO - ' || error_message || ' - SQLSTATE: ' || SQLSTATE,
                ARRAY['contact']
            );
        END;
        
        resultados := array_append(resultados, resultado);
    END LOOP;

    -- Log final da operação
    INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
    VALUES (
        auth.uid(),
        null,
        'NORMALIZACAO_CONTATOS_FINALIZADA - Total: ' || total_count || ' - Sucessos: ' || success_count || ' - Erros: ' || error_count,
        ARRAY['contact']
    );

    RETURN resultados;
END;
$function$;