-- Habilitar RLS nas tabelas sem políticas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes_filhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franqueados_filhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores_interno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores_loja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargos_loja ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes (usuários autenticados podem gerenciar)
CREATE POLICY "Usuários autenticados podem ver clientes" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir clientes" ON public.clientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar clientes" ON public.clientes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar clientes" ON public.clientes FOR DELETE TO authenticated USING (true);

-- Políticas para clientes_filhos
CREATE POLICY "Usuários autenticados podem ver filhos de clientes" ON public.clientes_filhos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir filhos de clientes" ON public.clientes_filhos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar filhos de clientes" ON public.clientes_filhos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar filhos de clientes" ON public.clientes_filhos FOR DELETE TO authenticated USING (true);

-- Políticas para franqueados_filhos
CREATE POLICY "Usuários autenticados podem ver filhos de franqueados" ON public.franqueados_filhos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem inserir filhos de franqueados" ON public.franqueados_filhos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados podem atualizar filhos de franqueados" ON public.franqueados_filhos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuários autenticados podem deletar filhos de franqueados" ON public.franqueados_filhos FOR DELETE TO authenticated USING (true);

-- Políticas para colaboradores_interno (apenas admins)
CREATE POLICY "Admins podem gerenciar colaboradores internos" ON public.colaboradores_interno FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Políticas para colaboradores_loja (apenas admins)
CREATE POLICY "Admins podem gerenciar colaboradores de loja" ON public.colaboradores_loja FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Políticas para cargos_loja (apenas admins)
CREATE POLICY "Admins podem gerenciar cargos de loja" ON public.cargos_loja FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Políticas para senhas (apenas admins)
CREATE POLICY "Admins podem gerenciar senhas" ON public.senhas FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Políticas para permissoes (apenas admins)
CREATE POLICY "Admins podem gerenciar permissões" ON public.permissoes FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));