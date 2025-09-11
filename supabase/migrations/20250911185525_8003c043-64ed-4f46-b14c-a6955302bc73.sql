-- Alterar a coluna store_imp_phase para permitir valores NULL
-- pois este campo só é obrigatório quando store_phase = 'implantacao'
ALTER TABLE public.unidades 
ALTER COLUMN store_imp_phase DROP NOT NULL;