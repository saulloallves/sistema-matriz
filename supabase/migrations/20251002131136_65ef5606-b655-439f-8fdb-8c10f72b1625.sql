-- Adicionar campo de cargo como texto para colaboradores internos
ALTER TABLE colaboradores_interno 
ADD COLUMN position_name text;

-- Tornar position_id nullable pois agora usaremos position_name
ALTER TABLE colaboradores_interno 
ALTER COLUMN position_id DROP NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN colaboradores_interno.position_name IS 'Nome do cargo do colaborador interno (texto livre)';
COMMENT ON COLUMN colaboradores_interno.position_id IS 'Deprecated - usar position_name para colaboradores internos';