-- Reescreve a função has_table_permission para a nova lógica de acesso.
-- A função agora ignora a operação (CRUD) e apenas verifica se o usuário
-- tem a flag 'has_access' para a tabela, seja por permissão individual ou de perfil.

CREATE OR REPLACE FUNCTION public.has_table_permission(_user_id uuid, _table_name text, _permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
  has_permission BOOLEAN;
BEGIN
  -- Admin sempre tem permissão total
  IF has_role(_user_id, 'admin') THEN
    RETURN true;
  END IF;

  -- 1. Verificar permissão específica do usuário (override)
  SELECT utp.has_access INTO has_permission
  FROM user_table_permissions utp
  WHERE utp.user_id = _user_id AND utp.table_name = _table_name;

  IF has_permission IS NOT NULL THEN
    RETURN has_permission;
  END IF;

  -- 2. Se não há permissão específica, verificar permissão do perfil
  SELECT ur.role INTO user_role
  FROM user_roles ur
  WHERE ur.user_id = _user_id
  LIMIT 1;

  IF user_role IS NULL THEN
    RETURN false; -- Usuário sem perfil não tem acesso
  END IF;

  SELECT rtp.has_access INTO has_permission
  FROM role_table_permissions rtp
  WHERE rtp.role = user_role AND rtp.table_name = _table_name;

  -- Retornar permissão do perfil ou false se não encontrada
  RETURN COALESCE(has_permission, false);
END;
$function$