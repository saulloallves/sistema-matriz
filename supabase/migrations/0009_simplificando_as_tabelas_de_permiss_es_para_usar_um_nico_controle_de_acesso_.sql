-- Altera as tabelas de permissões para um modelo de acesso simplificado.
-- Remove as colunas granulares de CRUD (create, read, update, delete).
-- Adiciona uma única coluna 'has_access' para controlar o acesso total a uma tela.

-- Tabela: role_table_permissions
ALTER TABLE public.role_table_permissions DROP COLUMN can_create;
ALTER TABLE public.role_table_permissions DROP COLUMN can_read;
ALTER TABLE public.role_table_permissions DROP COLUMN can_update;
ALTER TABLE public.role_table_permissions DROP COLUMN can_delete;
ALTER TABLE public.role_table_permissions ADD COLUMN has_access BOOLEAN NOT NULL DEFAULT false;

-- Tabela: user_table_permissions
ALTER TABLE public.user_table_permissions DROP COLUMN can_create;
ALTER TABLE public.user_table_permissions DROP COLUMN can_read;
ALTER TABLE public.user_table_permissions DROP COLUMN can_update;
ALTER TABLE public.user_table_permissions DROP COLUMN can_delete;
ALTER TABLE public.user_table_permissions ADD COLUMN has_access BOOLEAN NOT NULL DEFAULT false;