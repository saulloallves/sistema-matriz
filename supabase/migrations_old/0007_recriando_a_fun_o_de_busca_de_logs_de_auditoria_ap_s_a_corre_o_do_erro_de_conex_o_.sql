-- Recria a função get_audit_logs_with_user_names para buscar logs de auditoria
-- com os nomes dos usuários, garantindo que a função exista no banco de dados.

CREATE OR REPLACE FUNCTION public.get_audit_logs_with_user_names()
RETURNS TABLE(
    id uuid,
    "timestamp" timestamptz,
    user_id uuid,
    user_full_name text,
    action public.action_type,
    table_name text,
    record_id text,
    old_record_data jsonb,
    new_record_data jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Apenas administradores podem executar esta função.
    IF NOT has_role(auth.uid(), 'admin') THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        a.id,
        a.timestamp,
        a.user_id,
        p.full_name AS user_full_name,
        a.action,
        a.table_name,
        a.record_id,
        a.old_record_data,
        a.new_record_data
    FROM
        public.audit_log a
    LEFT JOIN
        public.profiles p ON a.user_id = p.user_id
    ORDER BY
        a.timestamp DESC;
END;
$$;