-- Adicionar coluna is_active na tabela unidades
ALTER TABLE public.unidades 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Criar índice para melhor performance nas consultas
CREATE INDEX idx_unidades_is_active ON public.unidades(is_active);