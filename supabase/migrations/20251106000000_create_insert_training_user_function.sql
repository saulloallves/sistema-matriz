-- Função para inserir usuário no schema treinamento
-- Usada pela Edge Function approve-onboarding-request
CREATE OR REPLACE FUNCTION public.insert_training_user(user_data JSONB)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  cpf TEXT,
  email TEXT,
  phone TEXT,
  unit_code TEXT,
  role TEXT,
  user_type TEXT,
  active BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = treinamento, public
AS $$
DECLARE
  inserted_id BIGINT;
BEGIN
  -- Inserir no schema treinamento
  INSERT INTO treinamento.users (
    name,
    cpf,
    email,
    phone,
    position,
    user_type,
    active,
    unit_code,
    role,
    approval_status,
    approved_by,
    approved_at,
    visible_password,
    unit_codes,
    nomes_unidades
  )
  VALUES (
    user_data->>'name',
    user_data->>'cpf',
    user_data->>'email',
    user_data->>'phone',
    (user_data->>'position')::TEXT,
    user_data->>'user_type',
    (user_data->>'active')::BOOLEAN,
    user_data->>'unit_code',
    user_data->>'role',
    user_data->>'approval_status',
    (user_data->>'approved_by')::UUID,
    (user_data->>'approved_at')::TIMESTAMPTZ,
    user_data->>'visible_password',
    ARRAY(SELECT jsonb_array_elements_text(user_data->'unit_codes')),
    user_data->>'nomes_unidades'
  )
  RETURNING 
    treinamento.users.id,
    treinamento.users.name,
    treinamento.users.cpf,
    treinamento.users.email,
    treinamento.users.phone,
    treinamento.users.unit_code,
    treinamento.users.role,
    treinamento.users.user_type,
    treinamento.users.active,
    treinamento.users.created_at
  INTO inserted_id;

  -- Retornar o registro inserido
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.cpf,
    u.email,
    u.phone,
    u.unit_code,
    u.role,
    u.user_type,
    u.active,
    u.created_at
  FROM treinamento.users u
  WHERE u.id = inserted_id;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION public.insert_training_user IS 'Insere um novo usuário no schema treinamento. Usado pela Edge Function de aprovação de onboarding.';
