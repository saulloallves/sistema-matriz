-- Primeiro, remove a função existente para evitar erros de tipo de retorno.
DROP FUNCTION IF EXISTS public.get_user_permissions(uuid);

-- Recria a função com a lógica corrigida.
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS TABLE(table_name text, has_access boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
BEGIN
  -- Admin tem acesso total a todos os módulos definidos em permission_tables.
  IF has_role(_user_id, 'admin') THEN
    RETURN QUERY
    SELECT 
      pt.table_name,
      true as has_access
    FROM public.permission_tables pt;
    RETURN;
  END IF;

  -- Lógica para outros perfis (não-admins).
  -- Obter role do usuário
  SELECT ur.role INTO user_role
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
  LIMIT 1;

  -- Retornar combinação de permissões específicas e do role
  RETURN QUERY
  SELECT 
    pt.table_name,
    COALESCE(utp.has_access, rtp.has_access, false) as has_access
  FROM public.permission_tables pt
  LEFT JOIN public.user_table_permissions utp ON utp.table_name = pt.table_name AND utp.user_id = _user_id
  LEFT JOIN public.role_table_permissions rtp ON rtp.table_name = pt.table_name AND rtp.role = user_role;
END;
$function$