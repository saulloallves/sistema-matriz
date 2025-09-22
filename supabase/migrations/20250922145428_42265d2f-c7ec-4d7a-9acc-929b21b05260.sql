-- Habilitar RLS na tabela franqueados e criar políticas de segurança
ALTER TABLE public.franqueados ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados visualizem franqueados
CREATE POLICY "Usuários autenticados podem ver franqueados" 
ON public.franqueados 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Política para permitir que admins gerenciem franqueados
CREATE POLICY "Admins podem gerenciar franqueados" 
ON public.franqueados 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));