-- Criar função RPC segura para buscar vínculos franqueados-unidades
CREATE OR REPLACE FUNCTION public.get_franqueados_unidades_secure()
RETURNS TABLE(
  id bigint,
  franqueado_id uuid,
  unidade_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  franqueado_full_name text,
  franqueado_contact text,
  franqueado_contact_masked text,
  franqueado_owner_type text,
  franqueado_profile_image text,
  franqueado_is_in_contract boolean,
  unidade_group_code bigint,
  unidade_group_name text,
  unidade_city text,
  unidade_state text,
  unidade_store_model text,
  unidade_store_phase text,
  unidade_cnpj text,
  unidade_fantasy_name text,
  unidade_is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role app_role;
BEGIN
  -- Get current user role
  current_user_role := get_current_user_role();
  
  -- If user is admin, return all data unmasked
  IF current_user_role = 'admin' THEN
    RETURN QUERY
    SELECT 
      fu.id,
      fu.franqueado_id,
      fu.unidade_id,
      fu.created_at,
      fu.updated_at,
      f.full_name as franqueado_full_name,
      f.contact as franqueado_contact,
      f.contact as franqueado_contact_masked,
      f.owner_type as franqueado_owner_type,
      f.profile_image as franqueado_profile_image,
      f.is_in_contract as franqueado_is_in_contract,
      u.group_code as unidade_group_code,
      u.group_name as unidade_group_name,
      u.city as unidade_city,
      u.state as unidade_state,
      u.store_model as unidade_store_model,
      u.store_phase as unidade_store_phase,
      u.cnpj as unidade_cnpj,
      u.fantasy_name as unidade_fantasy_name,
      u.is_active as unidade_is_active
    FROM franqueados_unidades fu
    JOIN franqueados f ON fu.franqueado_id = f.id
    JOIN unidades u ON fu.unidade_id = u.id
    ORDER BY fu.created_at DESC;
  
  -- If user is franqueado, return limited data with masking
  ELSIF current_user_role = 'franqueado' THEN
    RETURN QUERY
    SELECT 
      fu.id,
      fu.franqueado_id,
      fu.unidade_id,
      fu.created_at,
      fu.updated_at,
      f.full_name as franqueado_full_name,
      -- Mask contact for other franqueados
      CASE 
        WHEN length(f.contact) > 4 
        THEN '****' || right(f.contact, 4)
        ELSE '****'
      END as franqueado_contact,
      CASE 
        WHEN length(f.contact) > 4 
        THEN '****' || right(f.contact, 4)
        ELSE '****'
      END as franqueado_contact_masked,
      f.owner_type as franqueado_owner_type,
      f.profile_image as franqueado_profile_image,
      false as franqueado_is_in_contract, -- Hide sensitive info
      u.group_code as unidade_group_code,
      u.group_name as unidade_group_name,
      u.city as unidade_city,
      u.state as unidade_state,
      u.store_model as unidade_store_model,
      u.store_phase as unidade_store_phase,
      null::text as unidade_cnpj, -- Hide sensitive info
      u.fantasy_name as unidade_fantasy_name,
      u.is_active as unidade_is_active
    FROM franqueados_unidades fu
    JOIN franqueados f ON fu.franqueado_id = f.id
    JOIN unidades u ON fu.unidade_id = u.id
    ORDER BY fu.created_at DESC;
    
  -- For other roles, return very limited data
  ELSE
    RETURN QUERY
    SELECT 
      fu.id,
      fu.franqueado_id,
      fu.unidade_id,
      fu.created_at,
      fu.updated_at,
      f.full_name as franqueado_full_name,
      '****' as franqueado_contact,
      '****' as franqueado_contact_masked,
      f.owner_type as franqueado_owner_type,
      null::text as franqueado_profile_image,
      false as franqueado_is_in_contract,
      u.group_code as unidade_group_code,
      u.group_name as unidade_group_name,
      u.city as unidade_city,
      u.state as unidade_state,
      null::text as unidade_store_model,
      null::text as unidade_store_phase,
      null::text as unidade_cnpj,
      u.fantasy_name as unidade_fantasy_name,
      u.is_active as unidade_is_active
    FROM franqueados_unidades fu
    JOIN franqueados f ON fu.franqueado_id = f.id
    JOIN unidades u ON fu.unidade_id = u.id
    ORDER BY fu.created_at DESC;
  END IF;
END;
$$;

-- Atualizar políticas RLS para franqueados_unidades
DROP POLICY IF EXISTS "Usuários autenticados podem ver franqueados_unidades" ON public.franqueados_unidades;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir franqueados_unidades" ON public.franqueados_unidades;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar franqueados_unidades" ON public.franqueados_unidades;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar franqueados_unidades" ON public.franqueados_unidades;

-- Apenas admins podem gerenciar vínculos diretamente
CREATE POLICY "Admins podem gerenciar franqueados_unidades" 
ON public.franqueados_unidades 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Função para log de acesso a vínculos
CREATE OR REPLACE FUNCTION public.log_vinculo_access(_vinculo_id bigint, _action text, _accessed_fields text[] DEFAULT NULL::text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
  VALUES (auth.uid(), null, _action || ' - vinculo_id: ' || _vinculo_id::text, _accessed_fields);
END;
$$;