CREATE OR REPLACE FUNCTION public.get_users_with_emails()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  phone_number text,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.raw_user_meta_data->>'full_name' AS full_name,
    u.raw_user_meta_data->>'phone_number' AS phone_number, -- Correção final para buscar a chave exata
    u.email::text
  FROM
    auth.users u
  ORDER BY
    u.created_at DESC;
END;
$$;

-- Garante que a role de serviço (usada pelas Edge Functions) possa executar esta função.
GRANT EXECUTE ON FUNCTION public.get_users_with_emails() TO service_role;
