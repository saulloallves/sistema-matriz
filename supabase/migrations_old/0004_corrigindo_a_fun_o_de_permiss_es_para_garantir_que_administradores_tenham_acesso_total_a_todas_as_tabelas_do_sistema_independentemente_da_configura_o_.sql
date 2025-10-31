-- Reescreve a função get_user_permissions para garantir que administradores
-- tenham acesso a TODAS as tabelas no schema 'public', não apenas
-- àquelas listadas na tabela 'permission_tables'.

CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS TABLE(table_name text, can_create boolean, can_read boolean, can_update boolean, can_delete boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
BEGIN
  -- Admin tem acesso total a tudo, buscando diretamente do schema do banco.
  IF has_role(_user_id, 'admin') THEN
    RETURN QUERY
    SELECT 
      t.table_name::text,
      true as can_create,
      true as can_read,
      true as can_update,
      true as can_delete
    FROM information_schema.tables t
    WHERE t.table_schema = 'public';
    RETURN;
  END IF;

  -- Lógica para outros perfis (não-admins) permanece a mesma.
  -- Obter role do usuário
  SELECT ur.role INTO user_role
  FROM user_roles ur
  WHERE ur.user_id = _user_id
  LIMIT 1;

  -- Retornar combinação de permissões específicas e do role
  RETURN QUERY
  SELECT 
    pt.table_name,
    COALESCE(utp.can_create, rtp.can_create, false) as can_create,
    COALESCE(utp.can_read, rtp.can_read, false) as can_read,
    COALESCE(utp.can_update, rtp.can_update, false) as can_update,
    COALESCE(utp.can_delete, rtp.can_delete, false) as can_delete
  FROM permission_tables pt
  LEFT JOIN user_table_permissions utp ON utp.table_name = pt.table_name AND utp.user_id = _user_id
  LEFT JOIN role_table_permissions rtp ON rtp.table_name = pt.table_name AND rtp.role = user_role;
END;
$function$