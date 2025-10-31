-- =====================================================
-- TABELA: comunicacoes
-- Descrição: Armazena logs de auditoria de todas as comunicações
--            enviadas via WhatsApp, Email, SMS, etc.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.comunicacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados do evento
  event_type TEXT NOT NULL, -- Tipo do evento (ex: 'onboarding_notification', 'password_reset', etc)
  user_action TEXT, -- Ação do usuário que gerou a comunicação
  
  -- Canal de comunicação
  canal TEXT NOT NULL CHECK (canal IN ('whatsapp', 'email', 'sms')),
  
  -- Destinatário
  destinatario TEXT NOT NULL, -- Telefone ou email do destinatário
  
  -- Conteúdo
  conteudo TEXT NOT NULL, -- Conteúdo da mensagem
  assunto TEXT, -- Assunto (apenas para email)
  
  -- Status
  status TEXT NOT NULL DEFAULT 'enviado' CHECK (status IN ('enviado', 'erro', 'pendente')),
  
  -- Rastreamento externo
  external_id TEXT, -- ID retornado pela API externa (Z-API, Brevo, etc)
  
  -- Metadados
  metadata JSONB, -- Dados adicionais em formato JSON
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Índices para melhor performance
  CONSTRAINT comunicacoes_destinatario_check CHECK (char_length(destinatario) > 0)
);

-- =====================================================
-- ÍNDICES
-- =====================================================

-- Índice para busca por canal
CREATE INDEX IF NOT EXISTS idx_comunicacoes_canal 
  ON public.comunicacoes(canal);

-- Índice para busca por status
CREATE INDEX IF NOT EXISTS idx_comunicacoes_status 
  ON public.comunicacoes(status);

-- Índice para busca por data
CREATE INDEX IF NOT EXISTS idx_comunicacoes_created_at 
  ON public.comunicacoes(created_at DESC);

-- Índice para busca por destinatário
CREATE INDEX IF NOT EXISTS idx_comunicacoes_destinatario 
  ON public.comunicacoes(destinatario);

-- Índice para busca por tipo de evento
CREATE INDEX IF NOT EXISTS idx_comunicacoes_event_type 
  ON public.comunicacoes(event_type);

-- Índice composto para busca por canal + data
CREATE INDEX IF NOT EXISTS idx_comunicacoes_canal_data 
  ON public.comunicacoes(canal, created_at DESC);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.comunicacoes ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem visualizar comunicações
CREATE POLICY "Admins podem visualizar todas as comunicações"
  ON public.comunicacoes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );

-- Política: Service role pode inserir (para Edge Functions)
CREATE POLICY "Service role pode inserir comunicações"
  ON public.comunicacoes
  FOR INSERT
  WITH CHECK (true); -- Service role bypassa RLS, mas política é necessária

-- Política: Admins podem deletar comunicações antigas
CREATE POLICY "Admins podem deletar comunicações"
  ON public.comunicacoes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE public.comunicacoes IS 
  'Tabela de auditoria para todas as comunicações enviadas pelo sistema (WhatsApp, Email, SMS)';

COMMENT ON COLUMN public.comunicacoes.event_type IS 
  'Tipo de evento que originou a comunicação (ex: onboarding_notification, password_reset)';

COMMENT ON COLUMN public.comunicacoes.canal IS 
  'Canal utilizado para envio (whatsapp, email, sms)';

COMMENT ON COLUMN public.comunicacoes.destinatario IS 
  'Telefone ou email do destinatário';

COMMENT ON COLUMN public.comunicacoes.conteudo IS 
  'Conteúdo completo da mensagem enviada';

COMMENT ON COLUMN public.comunicacoes.status IS 
  'Status do envio (enviado, erro, pendente)';

COMMENT ON COLUMN public.comunicacoes.external_id IS 
  'ID de rastreamento retornado pela API externa (Z-API messageId, Brevo messageId, etc)';

COMMENT ON COLUMN public.comunicacoes.metadata IS 
  'Dados adicionais em formato JSON (erros, respostas da API, etc)';
