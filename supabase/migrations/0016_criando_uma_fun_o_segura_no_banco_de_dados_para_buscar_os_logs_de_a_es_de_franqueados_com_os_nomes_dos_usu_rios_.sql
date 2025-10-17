CREATE OR REPLACE FUNCTION public.get_franqueados_audit_logs_with_user_names()
RETURNS TABLE(
    id uuid,
    user_id uuid,
    user_full_name text,
    franqueado_id uuid,
    action text,
    accessed_fields text[],
    ip_address text,
    user_agent text,
    created_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Apenas administradores podem executar esta função.
    IF NOT has_role(auth.uid(), 'admin') THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        fal.id,
        fal.user_id,
        p.full_name AS user_full_name,
        fal.franqueado_id,
        fal.action,
        fal.accessed_fields,
        fal.ip_address,
        fal.user_agent,
        fal.created_at
    FROM
        public.franqueados_audit_log fal
    LEFT JOIN
        public.profiles p ON fal.user_id = p.user_id
    ORDER BY
        fal.created_at DESC;
END;
$$;