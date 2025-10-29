-- Adiciona a tabela onboarding_requests ao sistema de permissões
-- Isso permitirá que admins tenham acesso automático e outros roles possam ser configurados

INSERT INTO public.permission_tables (table_name, display_name, description)
VALUES (
  'onboarding_requests',
  'Aprovação de Cadastros',
  'Gerenciamento de solicitações de cadastro de franqueados e unidades vindas do sistema de onboarding'
)
ON CONFLICT (table_name) DO NOTHING;

-- Opcional: Conceder acesso ao role 'operador' também
-- Descomente as linhas abaixo se quiser que operadores também vejam
-- INSERT INTO public.role_table_permissions (role, table_name, has_access)
-- VALUES ('operador', 'onboarding_requests', true)
-- ON CONFLICT (role, table_name) DO UPDATE SET has_access = true;
