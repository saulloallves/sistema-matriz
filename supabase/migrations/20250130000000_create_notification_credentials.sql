-- Criar tabela para armazenar credenciais de notificação
CREATE TABLE IF NOT EXISTS notification_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Z-API (WhatsApp)
  zapi_instance_id TEXT,
  zapi_instance_token TEXT,
  zapi_client_token TEXT,
  zapi_base_url TEXT DEFAULT 'https://api.z-api.io',
  
  -- Brevo (E-mail)
  brevo_api_key TEXT,
  brevo_default_from TEXT DEFAULT 'noreply@crescieperdi.com.br',
  brevo_default_from_name TEXT DEFAULT 'Sistema Matriz - Cresci e Perdi',
  
  -- Metadados
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_notification_credentials_updated_at 
ON notification_credentials(updated_at DESC);

-- Função para manter apenas um registro (sempre sobrescrever)
CREATE OR REPLACE FUNCTION ensure_single_notification_credential()
RETURNS TRIGGER AS $$
BEGIN
  -- Deletar todos os registros existentes antes de inserir o novo
  DELETE FROM notification_credentials WHERE id != NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para garantir apenas um registro
DROP TRIGGER IF EXISTS ensure_single_credential_trigger ON notification_credentials;
CREATE TRIGGER ensure_single_credential_trigger
  AFTER INSERT ON notification_credentials
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_notification_credential();

-- RLS Policies
ALTER TABLE notification_credentials ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ler as credenciais
CREATE POLICY "Admins can read notification credentials"
  ON notification_credentials
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Apenas admins podem atualizar/inserir credenciais
CREATE POLICY "Admins can update notification credentials"
  ON notification_credentials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Inserir registro inicial vazio (opcional)
INSERT INTO notification_credentials (
  zapi_base_url,
  brevo_default_from,
  brevo_default_from_name
) VALUES (
  'https://api.z-api.io',
  'noreply@crescieperdi.com.br',
  'Sistema Matriz - Cresci e Perdi'
) ON CONFLICT DO NOTHING;

-- Comentários
COMMENT ON TABLE notification_credentials IS 'Armazena credenciais para serviços de notificação (Z-API e Brevo)';
COMMENT ON COLUMN notification_credentials.zapi_instance_id IS 'ID da instância Z-API para WhatsApp';
COMMENT ON COLUMN notification_credentials.zapi_instance_token IS 'Token da instância Z-API';
COMMENT ON COLUMN notification_credentials.zapi_client_token IS 'Token do cliente Z-API';
COMMENT ON COLUMN notification_credentials.brevo_api_key IS 'API Key do Brevo para envio de e-mails';
