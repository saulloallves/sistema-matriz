-- Criar tabela para definir quais tabelas do sistema podem ter permissões
CREATE TABLE IF NOT EXISTS permission_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar tabela para permissões específicas por usuário e tabela
CREATE TABLE IF NOT EXISTS user_table_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL REFERENCES permission_tables(table_name) ON DELETE CASCADE,
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, table_name)
);

-- Criar tabela para permissões padrão por role e tabela
CREATE TABLE IF NOT EXISTS role_table_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  table_name TEXT NOT NULL REFERENCES permission_tables(table_name) ON DELETE CASCADE,
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role, table_name)
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE permission_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_table_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_table_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para permission_tables (apenas admins podem gerenciar)
CREATE POLICY "Admins podem visualizar permission_tables"
  ON permission_tables FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem inserir em permission_tables"
  ON permission_tables FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar permission_tables"
  ON permission_tables FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar de permission_tables"
  ON permission_tables FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Políticas RLS para user_table_permissions
CREATE POLICY "Admins podem visualizar user_table_permissions"
  ON user_table_permissions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuários podem ver suas próprias permissões"
  ON user_table_permissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins podem inserir em user_table_permissions"
  ON user_table_permissions FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar user_table_permissions"
  ON user_table_permissions FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar de user_table_permissions"
  ON user_table_permissions FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Políticas RLS para role_table_permissions
CREATE POLICY "Todos podem visualizar role_table_permissions"
  ON role_table_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem inserir em role_table_permissions"
  ON role_table_permissions FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar role_table_permissions"
  ON role_table_permissions FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar de role_table_permissions"
  ON role_table_permissions FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Função para verificar permissão específica em uma tabela
CREATE OR REPLACE FUNCTION has_table_permission(
  _user_id UUID,
  _table_name TEXT,
  _permission TEXT -- 'create', 'read', 'update', 'delete'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
  has_permission BOOLEAN;
BEGIN
  -- Admin sempre tem permissão total
  IF has_role(_user_id, 'admin') THEN
    RETURN true;
  END IF;

  -- Obter o role do usuário
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = _user_id
  LIMIT 1;

  -- Verificar permissão específica do usuário (override)
  CASE _permission
    WHEN 'create' THEN
      SELECT can_create INTO has_permission
      FROM user_table_permissions
      WHERE user_id = _user_id AND table_name = _table_name;
    WHEN 'read' THEN
      SELECT can_read INTO has_permission
      FROM user_table_permissions
      WHERE user_id = _user_id AND table_name = _table_name;
    WHEN 'update' THEN
      SELECT can_update INTO has_permission
      FROM user_table_permissions
      WHERE user_id = _user_id AND table_name = _table_name;
    WHEN 'delete' THEN
      SELECT can_delete INTO has_permission
      FROM user_table_permissions
      WHERE user_id = _user_id AND table_name = _table_name;
  END CASE;

  -- Se há permissão específica, usar ela
  IF has_permission IS NOT NULL THEN
    RETURN has_permission;
  END IF;

  -- Se não há permissão específica, verificar permissão do role
  CASE _permission
    WHEN 'create' THEN
      SELECT can_create INTO has_permission
      FROM role_table_permissions
      WHERE role = user_role AND table_name = _table_name;
    WHEN 'read' THEN
      SELECT can_read INTO has_permission
      FROM role_table_permissions
      WHERE role = user_role AND table_name = _table_name;
    WHEN 'update' THEN
      SELECT can_update INTO has_permission
      FROM role_table_permissions
      WHERE role = user_role AND table_name = _table_name;
    WHEN 'delete' THEN
      SELECT can_delete INTO has_permission
      FROM role_table_permissions
      WHERE role = user_role AND table_name = _table_name;
  END CASE;

  -- Retornar permissão do role ou false se não encontrada
  RETURN COALESCE(has_permission, false);
END;
$$;

-- Função para obter todas as permissões de um usuário
CREATE OR REPLACE FUNCTION get_user_permissions(_user_id UUID)
RETURNS TABLE(
  table_name TEXT,
  can_create BOOLEAN,
  can_read BOOLEAN,
  can_update BOOLEAN,
  can_delete BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Admin tem acesso total a tudo
  IF has_role(_user_id, 'admin') THEN
    RETURN QUERY
    SELECT 
      pt.table_name,
      true as can_create,
      true as can_read,
      true as can_update,
      true as can_delete
    FROM permission_tables pt;
    RETURN;
  END IF;

  -- Obter role do usuário
  SELECT ur.role INTO user_role
  FROM user_roles ur
  WHERE ur.user_id = _user_id
  LIMIT 1;

  -- Retornar combinação de permissões específicas e do role
  RETURN QUERY
  SELECT 
    pt.table_name,
    COALESCE(utp.can_create, rtp.can_create, false) as can_create,
    COALESCE(utp.can_read, rtp.can_read, false) as can_read,
    COALESCE(utp.can_update, rtp.can_update, false) as can_update,
    COALESCE(utp.can_delete, rtp.can_delete, false) as can_delete
  FROM permission_tables pt
  LEFT JOIN user_table_permissions utp ON utp.table_name = pt.table_name AND utp.user_id = _user_id
  LEFT JOIN role_table_permissions rtp ON rtp.table_name = pt.table_name AND rtp.role = user_role;
END;
$$;

-- Inserir tabelas do sistema que podem ter permissões
INSERT INTO permission_tables (table_name, display_name, description) VALUES
  ('unidades', 'Unidades', 'Gerenciamento de unidades franqueadas'),
  ('franqueados', 'Franqueados', 'Cadastro e gestão de franqueados'),
  ('franqueados_unidades', 'Vínculos Franqueados-Unidades', 'Relacionamento entre franqueados e unidades'),
  ('clientes', 'Clientes', 'Base de clientes do sistema'),
  ('colaboradores_interno', 'Colaboradores Internos', 'Colaboradores da estrutura interna'),
  ('colaboradores_loja', 'Colaboradores de Loja', 'Colaboradores das unidades franqueadas'),
  ('senhas', 'Senhas', 'Gerenciamento de senhas e credenciais'),
  ('webhook_subscriptions', 'Webhooks', 'Configuração de webhooks do sistema'),
  ('profiles', 'Usuários', 'Gerenciamento de perfis de usuário')
ON CONFLICT (table_name) DO NOTHING;

-- Inserir permissões padrão para o role 'operador' (somente leitura)
INSERT INTO role_table_permissions (role, table_name, can_create, can_read, can_update, can_delete)
SELECT 'operador', table_name, false, true, false, false
FROM permission_tables
ON CONFLICT (role, table_name) DO NOTHING;

-- Inserir permissões padrão para o role 'user' (leitura limitada)
INSERT INTO role_table_permissions (role, table_name, can_create, can_read, can_update, can_delete)
SELECT 'user', table_name, false, false, false, false
FROM permission_tables
ON CONFLICT (role, table_name) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_permission_tables_updated_at
  BEFORE UPDATE ON permission_tables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_table_permissions_updated_at
  BEFORE UPDATE ON user_table_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_table_permissions_updated_at
  BEFORE UPDATE ON role_table_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();