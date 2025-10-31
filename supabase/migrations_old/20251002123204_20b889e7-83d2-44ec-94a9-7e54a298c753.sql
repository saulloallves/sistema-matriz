-- Habilitar RLS na tabela unidades
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados visualizarem unidades
CREATE POLICY "Usuários autenticados podem ver unidades"
ON unidades
FOR SELECT
TO authenticated
USING (true);

-- Política para admins gerenciarem unidades
CREATE POLICY "Admins podem gerenciar unidades"
ON unidades
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));