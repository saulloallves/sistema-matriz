-- Adicionar coluna nickname à tabela webhook_subscriptions
ALTER TABLE public.webhook_subscriptions 
ADD COLUMN nickname text NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.webhook_subscriptions.nickname IS 'Apelido amigável do webhook para facilitar identificação no frontend';