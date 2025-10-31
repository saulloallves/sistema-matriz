CREATE OR REPLACE FUNCTION public.get_franqueados_secure()
 RETURNS TABLE(id uuid, full_name text, contact text, contact_masked text, owner_type text, is_in_contract boolean, receives_prolabore boolean, prolabore_value numeric, availability text, created_at timestamp with time zone, profile_image text, cpf_rnm text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_role app_role;
BEGIN
  -- Get current user role
  current_user_role := get_current_user_role();
  
  -- If user is admin or operador, return all data unmasked
  IF current_user_role = 'admin' OR current_user_role = 'operador' THEN
    RETURN QUERY
    SELECT 
      f.id,
      f.full_name,
      f.contact,
      f.contact as contact_masked,
      f.owner_type,
      f.is_in_contract,
      f.receives_prolabore,
      f.prolabore_value,
      f.availability,
      f.created_at,
      f.profile_image,
      f.cpf_rnm
    FROM franqueados f
    ORDER BY f.created_at DESC;
  
  -- If user is franqueado, return limited data with masking
  ELSIF current_user_role = 'franqueado' THEN
    RETURN QUERY
    SELECT 
      f.id,
      f.full_name,
      -- Mask contact for other franqueados
      CASE 
        WHEN length(f.contact) > 4 
        THEN '****' || right(f.contact, 4)
        ELSE '****'
      END as contact,
      CASE 
        WHEN length(f.contact) > 4 
        THEN '****' || right(f.contact, 4)
        ELSE '****'
      END as contact_masked,
      f.owner_type,
      f.is_in_contract,
      -- Hide sensitive financial info
      false as receives_prolabore,
      null::numeric as prolabore_value,
      null::text as availability,
      f.created_at,
      f.profile_image,
      -- Mask CPF for other franqueados
      CASE
        WHEN f.cpf_rnm IS NOT NULL AND length(f.cpf_rnm) > 5
        THEN left(f.cpf_rnm, 3) || '...' || right(f.cpf_rnm, 2)
        ELSE '***'
      END as cpf_rnm
    FROM franqueados f
    ORDER BY f.created_at DESC;
    
  -- For other roles, return very limited data
  ELSE
    RETURN QUERY
    SELECT 
      f.id,
      f.full_name,
      '****' as contact,
      '****' as contact_masked,
      f.owner_type,
      false as is_in_contract,
      false as receives_prolabore,
      null::numeric as prolabore_value,
      null::text as availability,
      f.created_at,
      null::text as profile_image,
      '***' as cpf_rnm
    FROM franqueados f
    ORDER BY f.created_at DESC;
  END IF;
END;
$function$