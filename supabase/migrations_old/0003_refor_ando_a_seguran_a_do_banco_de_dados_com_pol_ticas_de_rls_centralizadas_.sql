-- PARTE 2: REFORÇAR A SEGURANÇA COM RLS CENTRALIZADO
-- Este script remove as políticas de segurança antigas e permissivas
-- e as substitui por novas políticas rigorosas que usam a função
-- 'has_table_permission' para centralizar o controle de acesso.

-- Tabela: franqueados
ALTER TABLE public.franqueados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem ver franqueados" ON public.franqueados;
DROP POLICY IF EXISTS "Admins podem gerenciar franqueados" ON public.franqueados;
CREATE POLICY "Allow SELECT on franqueados based on permissions" ON public.franqueados FOR SELECT USING (public.has_table_permission(auth.uid(), 'franqueados', 'read'));
CREATE POLICY "Allow INSERT on franqueados based on permissions" ON public.franqueados FOR INSERT WITH CHECK (public.has_table_permission(auth.uid(), 'franqueados', 'create'));
CREATE POLICY "Allow UPDATE on franqueados based on permissions" ON public.franqueados FOR UPDATE USING (public.has_table_permission(auth.uid(), 'franqueados', 'update'));
CREATE POLICY "Allow DELETE on franqueados based on permissions" ON public.franqueados FOR DELETE USING (public.has_table_permission(auth.uid(), 'franqueados', 'delete'));

-- Tabela: unidades
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem ver unidades" ON public.unidades;
DROP POLICY IF EXISTS "Admins podem gerenciar unidades" ON public.unidades;
DROP POLICY IF EXISTS "Anon pode inserir unidades" ON public.unidades;
CREATE POLICY "Allow SELECT on unidades based on permissions" ON public.unidades FOR SELECT USING (public.has_table_permission(auth.uid(), 'unidades', 'read'));
CREATE POLICY "Allow INSERT on unidades based on permissions" ON public.unidades FOR INSERT WITH CHECK (public.has_table_permission(auth.uid(), 'unidades', 'create'));
CREATE POLICY "Allow UPDATE on unidades based on permissions" ON public.unidades FOR UPDATE USING (public.has_table_permission(auth.uid(), 'unidades', 'update'));
CREATE POLICY "Allow DELETE on unidades based on permissions" ON public.unidades FOR DELETE USING (public.has_table_permission(auth.uid(), 'unidades', 'delete'));

-- Tabela: franqueados_unidades
ALTER TABLE public.franqueados_unidades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins podem gerenciar franqueados_unidades" ON public.franqueados_unidades;
CREATE POLICY "Allow SELECT on franqueados_unidades based on permissions" ON public.franqueados_unidades FOR SELECT USING (public.has_table_permission(auth.uid(), 'franqueados_unidades', 'read'));
CREATE POLICY "Allow INSERT on franqueados_unidades based on permissions" ON public.franqueados_unidades FOR INSERT WITH CHECK (public.has_table_permission(auth.uid(), 'franqueados_unidades', 'create'));
CREATE POLICY "Allow UPDATE on franqueados_unidades based on permissions" ON public.franqueados_unidades FOR UPDATE USING (public.has_table_permission(auth.uid(), 'franqueados_unidades', 'update'));
CREATE POLICY "Allow DELETE on franqueados_unidades based on permissions" ON public.franqueados_unidades FOR DELETE USING (public.has_table_permission(auth.uid(), 'franqueados_unidades', 'delete'));

-- Tabela: colaboradores_loja
ALTER TABLE public.colaboradores_loja ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins podem gerenciar colaboradores de loja" ON public.colaboradores_loja;
CREATE POLICY "Allow SELECT on colaboradores_loja based on permissions" ON public.colaboradores_loja FOR SELECT USING (public.has_table_permission(auth.uid(), 'colaboradores_loja', 'read'));
CREATE POLICY "Allow INSERT on colaboradores_loja based on permissions" ON public.colaboradores_loja FOR INSERT WITH CHECK (public.has_table_permission(auth.uid(), 'colaboradores_loja', 'create'));
CREATE POLICY "Allow UPDATE on colaboradores_loja based on permissions" ON public.colaboradores_loja FOR UPDATE USING (public.has_table_permission(auth.uid(), 'colaboradores_loja', 'update'));
CREATE POLICY "Allow DELETE on colaboradores_loja based on permissions" ON public.colaboradores_loja FOR DELETE USING (public.has_table_permission(auth.uid(), 'colaboradores_loja', 'delete'));

-- Tabela: colaboradores_interno
ALTER TABLE public.colaboradores_interno ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins podem gerenciar colaboradores internos" ON public.colaboradores_interno;
CREATE POLICY "Allow SELECT on colaboradores_interno based on permissions" ON public.colaboradores_interno FOR SELECT USING (public.has_table_permission(auth.uid(), 'colaboradores_interno', 'read'));
CREATE POLICY "Allow INSERT on colaboradores_interno based on permissions" ON public.colaboradores_interno FOR INSERT WITH CHECK (public.has_table_permission(auth.uid(), 'colaboradores_interno', 'create'));
CREATE POLICY "Allow UPDATE on colaboradores_interno based on permissions" ON public.colaboradores_interno FOR UPDATE USING (public.has_table_permission(auth.uid(), 'colaboradores_interno', 'update'));
CREATE POLICY "Allow DELETE on colaboradores_interno based on permissions" ON public.colaboradores_interno FOR DELETE USING (public.has_table_permission(auth.uid(), 'colaboradores_interno', 'delete'));

-- Tabela: senhas
ALTER TABLE public.senhas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins podem gerenciar senhas" ON public.senhas;
CREATE POLICY "Allow SELECT on senhas based on permissions" ON public.senhas FOR SELECT USING (public.has_table_permission(auth.uid(), 'senhas', 'read'));
CREATE POLICY "Allow INSERT on senhas based on permissions" ON public.senhas FOR INSERT WITH CHECK (public.has_table_permission(auth.uid(), 'senhas', 'create'));
CREATE POLICY "Allow UPDATE on senhas based on permissions" ON public.senhas FOR UPDATE USING (public.has_table_permission(auth.uid(), 'senhas', 'update'));
CREATE POLICY "Allow DELETE on senhas based on permissions" ON public.senhas FOR DELETE USING (public.has_table_permission(auth.uid(), 'senhas', 'delete'));

-- Tabela: clientes
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem ver clientes" ON public.clientes;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir clientes" ON public.clientes;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar clientes" ON public.clientes;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar clientes" ON public.clientes;
CREATE POLICY "Allow SELECT on clientes based on permissions" ON public.clientes FOR SELECT USING (public.has_table_permission(auth.uid(), 'clientes', 'read'));
CREATE POLICY "Allow INSERT on clientes based on permissions" ON public.clientes FOR INSERT WITH CHECK (public.has_table_permission(auth.uid(), 'clientes', 'create'));
CREATE POLICY "Allow UPDATE on clientes based on permissions" ON public.clientes FOR UPDATE USING (public.has_table_permission(auth.uid(), 'clientes', 'update'));
CREATE POLICY "Allow DELETE on clientes based on permissions" ON public.clientes FOR DELETE USING (public.has_table_permission(auth.uid(), 'clientes', 'delete'));

-- Tabela: clientes_filhos
ALTER TABLE public.clientes_filhos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem ver filhos de clientes" ON public.clientes_filhos;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir filhos de clientes" ON public.clientes_filhos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar filhos de clientes" ON public.clientes_filhos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar filhos de clientes" ON public.clientes_filhos;
CREATE POLICY "Allow SELECT on clientes_filhos based on permissions" ON public.clientes_filhos FOR SELECT USING (public.has_table_permission(auth.uid(), 'clientes_filhos', 'read'));
CREATE POLICY "Allow INSERT on clientes_filhos based on permissions" ON public.clientes_filhos FOR INSERT WITH CHECK (public.has_table_permission(auth.uid(), 'clientes_filhos', 'create'));
CREATE POLICY "Allow UPDATE on clientes_filhos based on permissions" ON public.clientes_filhos FOR UPDATE USING (public.has_table_permission(auth.uid(), 'clientes_filhos', 'update'));
CREATE POLICY "Allow DELETE on clientes_filhos based on permissions" ON public.clientes_filhos FOR DELETE USING (public.has_table_permission(auth.uid(), 'clientes_filhos', 'delete'));

-- Tabela: franqueados_filhos
ALTER TABLE public.franqueados_filhos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem ver filhos de franqueados" ON public.franqueados_filhos;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir filhos de franqueados" ON public.franqueados_filhos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar filhos de franqueados" ON public.franqueados_filhos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar filhos de franqueados" ON public.franqueados_filhos;
CREATE POLICY "Allow SELECT on franqueados_filhos based on permissions" ON public.franqueados_filhos FOR SELECT USING (public.has_table_permission(auth.uid(), 'franqueados_filhos', 'read'));
CREATE POLICY "Allow INSERT on franqueados_filhos based on permissions" ON public.franqueados_filhos FOR INSERT WITH CHECK (public.has_table_permission(auth.uid(), 'franqueados_filhos', 'create'));
CREATE POLICY "Allow UPDATE on franqueados_filhos based on permissions" ON public.franqueados_filhos FOR UPDATE USING (public.has_table_permission(auth.uid(), 'franqueados_filhos', 'update'));
CREATE POLICY "Allow DELETE on franqueados_filhos based on permissions" ON public.franqueados_filhos FOR DELETE USING (public.has_table_permission(auth.uid(), 'franqueados_filhos', 'delete'));

-- Tabela: cargos_loja
ALTER TABLE public.cargos_loja ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins podem gerenciar cargos de loja" ON public.cargos_loja;
CREATE POLICY "Allow SELECT on cargos_loja based on permissions" ON public.cargos_loja FOR SELECT USING (public.has_table_permission(auth.uid(), 'cargos_loja', 'read'));
CREATE POLICY "Allow INSERT on cargos_loja based on permissions" ON public.cargos_loja FOR INSERT WITH CHECK (public.has_table_permission(auth.uid(), 'cargos_loja', 'create'));
CREATE POLICY "Allow UPDATE on cargos_loja based on permissions" ON public.cargos_loja FOR UPDATE USING (public.has_table_permission(auth.uid(), 'cargos_loja', 'update'));
CREATE POLICY "Allow DELETE on cargos_loja based on permissions" ON public.cargos_loja FOR DELETE USING (public.has_table_permission(auth.uid(), 'cargos_loja', 'delete'));

-- Tabela: unidades_grupos_whatsapp
ALTER TABLE public.unidades_grupos_whatsapp ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem ver grupos whatsapp" ON public.unidades_grupos_whatsapp;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir grupos whatsapp" ON public.unidades_grupos_whatsapp;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar grupos whatsapp" ON public.unidades_grupos_whatsapp;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar grupos whatsapp" ON public.unidades_grupos_whatsapp;
CREATE POLICY "Allow SELECT on unidades_grupos_whatsapp based on permissions" ON public.unidades_grupos_whatsapp FOR SELECT USING (public.has_table_permission(auth.uid(), 'unidades_grupos_whatsapp', 'read'));
CREATE POLICY "Allow INSERT on unidades_grupos_whatsapp based on permissions" ON public.unidades_grupos_whatsapp FOR INSERT WITH CHECK (public.has_table_permission(auth.uid(), 'unidades_grupos_whatsapp', 'create'));
CREATE POLICY "Allow UPDATE on unidades_grupos_whatsapp based on permissions" ON public.unidades_grupos_whatsapp FOR UPDATE USING (public.has_table_permission(auth.uid(), 'unidades_grupos_whatsapp', 'update'));
CREATE POLICY "Allow DELETE on unidades_grupos_whatsapp based on permissions" ON public.unidades_grupos_whatsapp FOR DELETE USING (public.has_table_permission(auth.uid(), 'unidades_grupos_whatsapp', 'delete'));

-- Tabela: profiles
-- Esta tabela é especial. Usuários devem poder gerenciar seus próprios perfis,
-- mas o acesso de outros deve ser controlado pelo sistema de permissões.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem ver todos os profiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir profiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar profiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar profiles" ON public.profiles;

-- Política para permitir que usuários vejam/editem seus próprios perfis.
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para permitir acesso baseado em permissões (para admins/operadores).
-- Como as políticas são permissivas (combinadas com OR), um admin/operador com permissão
-- poderá ver/editar outros perfis, e um usuário normal ainda poderá ver/editar o seu próprio.
CREATE POLICY "Allow SELECT on profiles based on permissions" ON public.profiles FOR SELECT USING (public.has_table_permission(auth.uid(), 'profiles', 'read'));
CREATE POLICY "Allow INSERT on profiles based on permissions" ON public.profiles FOR INSERT WITH CHECK (public.has_table_permission(auth.uid(), 'profiles', 'create'));
CREATE POLICY "Allow UPDATE on profiles based on permissions" ON public.profiles FOR UPDATE USING (public.has_table_permission(auth.uid(), 'profiles', 'update'));
CREATE POLICY "Allow DELETE on profiles based on permissions" ON public.profiles FOR DELETE USING (public.has_table_permission(auth.uid(), 'profiles', 'delete'));