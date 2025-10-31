-- Recria a função get_user_permissions com a nova assinatura de retorno,
-- alinhada à estrutura simplificada de permissões.

CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS TABLE(table_name text, has_access boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
BEGIN
  -- Admin tem acesso total a tudo.
  IF has_role(_user_id, 'admin') THEN
    RETURN QUERY
    SELECT 
      t.table_name::text,
      true as has_access
    FROM information_schema.tables t
    WHERE t.table_schema = 'public';
    RETURN;
  END IF;

  -- Lógica para outros perfis (não-admins).
  -- Obter role do usuário
  SELECT ur.role INTO user_role
  FROM user_roles ur
  WHERE ur.user_id = _user_id
  LIMIT 1;

  -- Retornar combinação de permissões específicas e do role
  RETURN QUERY
  SELECT 
    pt.table_name,
    COALESCE(utp.has_access, rtp.has_access, false) as has_access
  FROM permission_tables pt
  LEFT JOIN user_table_permissions utp ON utp.table_name = pt.table_name AND utp.user_id = _user_id
  LEFT JOIN role_table_permissions rtp ON rtp.table_name = pt.table_name AND rtp.role = user_role;
END;
$function$