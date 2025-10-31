-- Insere os registros de todos os módulos do sistema na tabela permission_tables.
-- Isso serve como a fonte da verdade para o sistema de permissões.
-- ON CONFLICT garante que a operação não falhe se os registros já existirem.

INSERT INTO public.permission_tables (table_name, display_name, description) VALUES
('unidades', 'Unidades', 'Gerenciamento de unidades/lojas'),
('franqueados', 'Franqueados', 'Gerenciamento de franqueados'),
('franqueados_unidades', 'Vínculos Franqueado-Unidade', 'Associação entre franqueados e unidades'),
('franqueados_filhos', 'Filhos de Franqueados', 'Gerenciamento de dependentes de franqueados'),
('clientes', 'Clientes', 'Gerenciamento de clientes das unidades'),
('clientes_filhos', 'Filhos de Clientes', 'Gerenciamento de dependentes de clientes'),
('colaboradores_loja', 'Colaboradores de Loja', 'Gerenciamento de funcionários das unidades'),
('colaboradores_interno', 'Colaboradores Internos', 'Gerenciamento de funcionários da matriz'),
('cargos_loja', 'Cargos de Loja', 'Gerenciamento de cargos para colaboradores de loja'),
('senhas', 'Senhas', 'Gerenciador de senhas de sistemas corporativos'),
('permissoes', 'Permissões', 'Configuração de níveis de acesso e permissões'),
('unidades_grupos_whatsapp', 'Grupos WhatsApp', 'Gerenciamento de grupos de WhatsApp por unidade'),
('evento_seguidores', 'Evento Seguidores', 'Visualização de dados de eventos e seguidores'),
('profiles', 'Usuários do Sistema', 'Gerenciamento de contas de usuário do sistema'),
('audit_log', 'Logs de Auditoria', 'Visualização de logs de alterações no sistema'),
('webhook_subscriptions', 'Webhooks', 'Configuração de webhooks para integração em tempo real')
ON CONFLICT (table_name) DO NOTHING;