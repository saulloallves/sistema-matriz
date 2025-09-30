-- Habilitar RLS na tabela webhook_subscriptions
ALTER TABLE public.webhook_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para admins visualizarem todos os webhooks
CREATE POLICY "Admins podem visualizar webhooks"
ON public.webhook_subscriptions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Política para admins criarem webhooks
CREATE POLICY "Admins podem criar webhooks"
ON public.webhook_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Política para admins atualizarem webhooks
CREATE POLICY "Admins podem atualizar webhooks"
ON public.webhook_subscriptions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Política para admins removerem webhooks
CREATE POLICY "Admins podem remover webhooks"
ON public.webhook_subscriptions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Comentário explicativo
COMMENT ON TABLE public.webhook_subscriptions IS 'Tabela para armazenar as configurações de webhooks que receberão eventos de sincronização real-time das tabelas do sistema';