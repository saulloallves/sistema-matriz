-- 1. Função para buscar franqueados sem senha que possuem unidade vinculada
CREATE OR REPLACE FUNCTION public.get_franqueados_para_geracao_senha()
RETURNS TABLE(franqueado_id uuid, franqueado_nome text, unidade_group_code bigint)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado. Apenas administradores podem executar esta função.';
  END IF;

  RETURN QUERY
  SELECT DISTINCT ON (f.id)
      f.id,
      f.full_name,
      u.group_code
  FROM 
      franqueados f
  JOIN 
      franqueados_unidades fu ON f.id = fu.franqueado_id
  JOIN 
      unidades u ON fu.unidade_id = u.id
  WHERE 
      f.systems_password IS NULL
  ORDER BY 
      f.id, fu.created_at ASC; -- Garante que pegamos a primeira unidade vinculada
END;
$$;

-- 2. Função para gerar a senha para um franqueado específico
CREATE OR REPLACE FUNCTION public.gerar_senha_para_franqueado(p_franqueado_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_group_code bigint;
  v_senha_numerica numeric;
  v_codigo_part text;
  v_random_part text;
  v_senha_texto text := '';
  i integer;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  -- Encontra o código da primeira unidade vinculada
  SELECT u.group_code INTO v_group_code
  FROM franqueados_unidades fu
  JOIN unidades u ON fu.unidade_id = u.id
  WHERE fu.franqueado_id = p_franqueado_id
  ORDER BY fu.created_at ASC
  LIMIT 1;

  IF v_group_code IS NULL THEN
    RETURN false; -- Não pode gerar senha sem unidade vinculada
  END IF;

  -- Lógica de geração de senha (intercalada)
  v_codigo_part := lpad(v_group_code::text, 4, '0');
  v_random_part := lpad(floor(random() * 10000)::int::text, 4, '0');

  FOR i IN 1..4 LOOP
    v_senha_texto := v_senha_texto || substr(v_random_part, i, 1) || substr(v_codigo_part, i, 1);
  END LOOP;

  v_senha_numerica := v_senha_texto::numeric;

  -- Atualiza o franqueado com a nova senha
  UPDATE franqueados
  SET systems_password = v_senha_numerica
  WHERE id = p_franqueado_id;

  RETURN true;
END;
$$;

-- 3. Função para gerar senhas para todos os franqueados elegíveis
CREATE OR REPLACE FUNCTION public.gerar_senhas_franqueados_em_lote()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  rec record;
  success_count integer := 0;
  failure_count integer := 0;
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  FOR rec IN SELECT * FROM public.get_franqueados_para_geracao_senha() LOOP
    IF public.gerar_senha_para_franqueado(rec.franqueado_id) THEN
      success_count := success_count + 1;
    ELSE
      failure_count := failure_count + 1;
    END IF;
  END LOOP;

  RETURN json_build_object('sucessos', success_count, 'falhas', failure_count);
END;
$$;