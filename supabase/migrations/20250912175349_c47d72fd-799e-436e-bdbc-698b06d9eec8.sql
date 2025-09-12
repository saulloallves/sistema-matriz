-- Corrigir a função para ter search_path definido
CREATE OR REPLACE FUNCTION get_users_with_emails()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  full_name TEXT,
  phone_number TEXT,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by UUID,
  email TEXT
) 
LANGUAGE SQL 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.phone_number,
    p.status,
    p.notes,
    p.created_at,
    p.updated_at,
    p.created_by,
    au.email
  FROM profiles p
  LEFT JOIN auth.users au ON p.user_id = au.id
  ORDER BY p.created_at DESC;
$$;