-- Atualizar a função get_franqueados_secure para funcionar sem a coluna user_id
CREATE OR REPLACE FUNCTION public.get_franqueados_secure()
 RETURNS TABLE(id uuid, full_name text, owner_type text, is_in_contract boolean, receives_prolabore boolean, prolabore_value numeric, availability text, created_at timestamp with time zone, cpf_rnm_masked text, contact_masked text, address_masked text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    f.id,
    f.full_name,
    f.owner_type,
    f.is_in_contract,
    f.receives_prolabore,
    f.prolabore_value,
    f.availability,
    f.created_at,
    -- Mask sensitive data based on user role
    CASE 
      WHEN has_role(auth.uid(), 'admin') THEN f.cpf_rnm
      ELSE CONCAT('***', RIGHT(f.cpf_rnm, 3))
    END as cpf_rnm_masked,
    CASE 
      WHEN has_role(auth.uid(), 'admin') THEN f.contact
      ELSE CONCAT('***', RIGHT(f.contact, 4))
    END as contact_masked,
    CASE 
      WHEN has_role(auth.uid(), 'admin') THEN f.address
      ELSE 'Endereço restrito'
    END as address_masked
  FROM franqueados f
  WHERE 
    -- Admin can see all, outros usuários autenticados também podem ver
    has_role(auth.uid(), 'admin') OR auth.uid() IS NOT NULL;
$function$;