-- Corrige as políticas de UPDATE para todas as tabelas, separando
-- a verificação de leitura (USING) da verificação de escrita (WITH CHECK).
-- Isso resolve o erro 406 Not Acceptable que ocorre para usuários não-admin
-- ao tentar atualizar registros.

-- Tabela: franqueados
DROP POLICY IF EXISTS "Allow UPDATE on franqueados based on permissions" ON public.franqueados;
CREATE POLICY "Allow UPDATE on franqueados based on permissions"
  ON public.franqueados FOR UPDATE
  USING (public.has_table_permission(auth.uid(), 'franqueados', 'read'))
  WITH CHECK (public.has_table_permission(auth.uid(), 'franqueados', 'update'));

-- Tabela: unidades
DROP POLICY IF EXISTS "Allow UPDATE on unidades based on permissions" ON public.unidades;
CREATE POLICY "Allow UPDATE on unidades based on permissions"
  ON public.unidades FOR UPDATE
  USING (public.has_table_permission(auth.uid(), 'unidades', 'read'))
  WITH CHECK (public.has_table_permission(auth.uid(), 'unidades', 'update'));

-- Tabela: franqueados_unidades
DROP POLICY IF EXISTS "Allow UPDATE on franqueados_unidades based on permissions" ON public.franqueados_unidades;
CREATE POLICY "Allow UPDATE on franqueados_unidades based on permissions"
  ON public.franqueados_unidades FOR UPDATE
  USING (public.has_table_permission(auth.uid(), 'franqueados_unidades', 'read'))
  WITH CHECK (public.has_table_permission(auth.uid(), 'franqueados_unidades', 'update'));

-- Tabela: colaboradores_loja
DROP POLICY IF EXISTS "Allow UPDATE on colaboradores_loja based on permissions" ON public.colaboradores_loja;
CREATE POLICY "Allow UPDATE on colaboradores_loja based on permissions"
  ON public.colaboradores_loja FOR UPDATE
  USING (public.has_table_permission(auth.uid(), 'colaboradores_loja', 'read'))
  WITH CHECK (public.has_table_permission(auth.uid(), 'colaboradores_loja', 'update'));

-- Tabela: colaboradores_interno
DROP POLICY IF EXISTS "Allow UPDATE on colaboradores_interno based on permissions" ON public.colaboradores_interno;
CREATE POLICY "Allow UPDATE on colaboradores_interno based on permissions"
  ON public.colaboradores_interno FOR UPDATE
  USING (public.has_table_permission(auth.uid(), 'colaboradores_interno', 'read'))
  WITH CHECK (public.has_table_permission(auth.uid(), 'colaboradores_interno', 'update'));

-- Tabela: senhas
DROP POLICY IF EXISTS "Allow UPDATE on senhas based on permissions" ON public.senhas;
CREATE POLICY "Allow UPDATE on senhas based on permissions"
  ON public.senhas FOR UPDATE
  USING (public.has_table_permission(auth.uid(), 'senhas', 'read'))
  WITH CHECK (public.has_table_permission(auth.uid(), 'senhas', 'update'));

-- Tabela: clientes
DROP POLICY IF EXISTS "Allow UPDATE on clientes based on permissions" ON public.clientes;
CREATE POLICY "Allow UPDATE on clientes based on permissions"
  ON public.clientes FOR UPDATE
  USING (public.has_table_permission(auth.uid(), 'clientes', 'read'))
  WITH CHECK (public.has_table_permission(auth.uid(), 'clientes', 'update'));

-- Tabela: clientes_filhos
DROP POLICY IF EXISTS "Allow UPDATE on clientes_filhos based on permissions" ON public.clientes_filhos;
CREATE POLICY "Allow UPDATE on clientes_filhos based on permissions"
  ON public.clientes_filhos FOR UPDATE
  USING (public.has_table_permission(auth.uid(), 'clientes_filhos', 'read'))
  WITH CHECK (public.has_table_permission(auth.uid(), 'clientes_filhos', 'update'));

-- Tabela: franqueados_filhos
DROP POLICY IF EXISTS "Allow UPDATE on franqueados_filhos based on permissions" ON public.franqueados_filhos;
CREATE POLICY "Allow UPDATE on franqueados_filhos based on permissions"
  ON public.franqueados_filhos FOR UPDATE
  USING (public.has_table_permission(auth.uid(), 'franqueados_filhos', 'read'))
  WITH CHECK (public.has_table_permission(auth.uid(), 'franqueados_filhos', 'update'));

-- Tabela: cargos_loja
DROP POLICY IF EXISTS "Allow UPDATE on cargos_loja based on permissions" ON public.cargos_loja;
CREATE POLICY "Allow UPDATE on cargos_loja based on permissions"
  ON public.cargos_loja FOR UPDATE
  USING (public.has_table_permission(auth.uid(), 'cargos_loja', 'read'))
  WITH CHECK (public.has_table_permission(auth.uid(), 'cargos_loja', 'update'));

-- Tabela: unidades_grupos_whatsapp
DROP POLICY IF EXISTS "Allow UPDATE on unidades_grupos_whatsapp based on permissions" ON public.unidades_grupos_whatsapp;
CREATE POLICY "Allow UPDATE on unidades_grupos_whatsapp based on permissions"
  ON public.unidades_grupos_whatsapp FOR UPDATE
  USING (public.has_table_permission(auth.uid(), 'unidades_grupos_whatsapp', 'read'))
  WITH CHECK (public.has_table_permission(auth.uid(), 'unidades_grupos_whatsapp', 'update'));

-- Tabela: profiles
DROP POLICY IF EXISTS "Allow UPDATE on profiles based on permissions" ON public.profiles;
CREATE POLICY "Allow UPDATE on profiles based on permissions"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id OR public.has_table_permission(auth.uid(), 'profiles', 'read'))
  WITH CHECK (auth.uid() = user_id OR public.has_table_permission(auth.uid(), 'profiles', 'update'));