-- Primeiro, remover a função existente
DROP FUNCTION IF EXISTS normalizar_todas_unidades();

-- Recriar a função com melhor tratamento de erros e logging
CREATE OR REPLACE FUNCTION normalizar_todas_unidades()
RETURNS json[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    unidade_record RECORD;
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
        'NORMALIZACAO_TODAS_INICIADA',
        ARRAY['group_name']
    );

    -- Buscar todas as unidades que precisam ser normalizadas
    FOR unidade_record IN 
        SELECT 
            u.group_code,
            u.group_name as nome_atual,
            uo.group_name as nome_correto
        FROM unidades u
        INNER JOIN unidades_old uo ON u.group_code = uo.group_code
        WHERE u.group_name != uo.group_name
            AND uo.group_name IS NOT NULL
            AND trim(uo.group_name) != ''
        ORDER BY u.group_code
    LOOP
        total_count := total_count + 1;
        
        BEGIN
            -- Tentar atualizar a unidade individual
            UPDATE unidades 
            SET 
                group_name = unidade_record.nome_correto,
                updated_at = now()
            WHERE group_code = unidade_record.group_code;
            
            -- Verificar se a atualização foi bem-sucedida
            IF FOUND THEN
                success_count := success_count + 1;
                resultado := json_build_object(
                    'group_code', unidade_record.group_code,
                    'nome_anterior', unidade_record.nome_atual,
                    'nome_novo', unidade_record.nome_correto,
                    'sucesso', true
                );
                
                -- Log da normalização individual bem-sucedida
                INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
                VALUES (
                    auth.uid(),
                    null,
                    'NORMALIZACAO_UNIDADE_SUCESSO - group_code: ' || unidade_record.group_code || ' - de: "' || unidade_record.nome_atual || '" para: "' || unidade_record.nome_correto || '"',
                    ARRAY['group_name']
                );
            ELSE
                error_count := error_count + 1;
                error_message := 'Nenhuma linha foi atualizada para group_code: ' || unidade_record.group_code;
                
                resultado := json_build_object(
                    'group_code', unidade_record.group_code,
                    'nome_anterior', unidade_record.nome_atual,
                    'nome_novo', unidade_record.nome_correto,
                    'sucesso', false
                );
                
                -- Log do erro
                INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
                VALUES (
                    auth.uid(),
                    null,
                    'NORMALIZACAO_UNIDADE_ERRO - ' || error_message,
                    ARRAY['group_name']
                );
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            error_message := SQLERRM;
            
            resultado := json_build_object(
                'group_code', unidade_record.group_code,
                'nome_anterior', unidade_record.nome_atual,
                'nome_novo', unidade_record.nome_correto,
                'sucesso', false
            );
            
            -- Log do erro com detalhes da exceção
            INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
            VALUES (
                auth.uid(),
                null,
                'NORMALIZACAO_UNIDADE_ERRO - group_code: ' || unidade_record.group_code || ' - ' || error_message || ' - SQLSTATE: ' || SQLSTATE,
                ARRAY['group_name']
            );
        END;
        
        resultados := array_append(resultados, resultado);
    END LOOP;

    -- Log final da operação
    INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
    VALUES (
        auth.uid(),
        null,
        'NORMALIZACAO_TODAS_FINALIZADA - Total: ' || total_count || ' - Sucessos: ' || success_count || ' - Erros: ' || error_count,
        ARRAY['group_name']
    );

    RETURN resultados;
END;
$$;