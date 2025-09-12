-- Create additional security measures for the franqueados table

-- 1. Create a security definer function to mask sensitive data for non-admins
CREATE OR REPLACE FUNCTION public.get_franqueados_secure()
RETURNS TABLE (
  id uuid,
  full_name text,
  owner_type text,
  is_in_contract boolean,
  receives_prolabore boolean,
  prolabore_value numeric,
  availability text,
  created_at timestamp with time zone,
  -- Masked sensitive fields for non-admins
  cpf_rnm_masked text,
  contact_masked text,
  address_masked text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
    -- Admin can see all
    has_role(auth.uid(), 'admin') 
    OR 
    -- Franchise owners can see their own data
    (has_role(auth.uid(), 'franqueado') AND f.user_id = auth.uid());
$$;

-- 2. Create audit log table for tracking access to sensitive data
CREATE TABLE public.franqueados_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  franqueado_id uuid REFERENCES franqueados(id),
  action text NOT NULL, -- 'view', 'edit', 'create', 'delete'
  accessed_fields text[], -- array of field names accessed
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.franqueados_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.franqueados_audit_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Everyone can insert audit logs (system generated)
CREATE POLICY "Insert audit logs"
ON public.franqueados_audit_log
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Create function to log access attempts
CREATE OR REPLACE FUNCTION public.log_franqueado_access(
  _franqueado_id uuid,
  _action text,
  _accessed_fields text[] DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO franqueados_audit_log (user_id, franqueado_id, action, accessed_fields)
  VALUES (auth.uid(), _franqueado_id, _action, _accessed_fields);
END;
$$;

-- 4. Create view for franchise owners to see only their data
CREATE OR REPLACE VIEW public.v_my_franqueado_data AS
SELECT 
  id,
  full_name,
  cpf_rnm,
  nationality,
  birth_date,
  address,
  contact,
  owner_type,
  availability,
  education,
  previous_profession,
  previous_salary_range,
  discovery_source,
  is_in_contract,
  receives_prolabore,
  prolabore_value,
  was_entrepreneur,
  has_other_activities,
  other_activities_description,
  was_referred,
  referrer_name,
  referrer_unit_code,
  profile_image,
  lgpd_term_accepted,
  confidentiality_term_accepted,
  system_term_accepted,
  created_at,
  updated_at
FROM franqueados
WHERE user_id = auth.uid();

-- 5. Enable password security in auth settings (this is informational)
-- Note: This needs to be done in Supabase dashboard under Auth > Settings > Password Security

-- 6. Create a function to check if current user can access sensitive fields
CREATE OR REPLACE FUNCTION public.can_access_sensitive_data(_franqueado_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    has_role(auth.uid(), 'admin') 
    OR 
    (_franqueado_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM franqueados 
      WHERE id = _franqueado_id 
        AND user_id = auth.uid() 
        AND has_role(auth.uid(), 'franqueado')
    ));
$$;