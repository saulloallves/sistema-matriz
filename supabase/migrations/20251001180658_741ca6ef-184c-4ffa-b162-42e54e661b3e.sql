-- Migração 1: Expandir enum app_role para incluir 'operador'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'operador' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'operador';
  END IF;
END $$;