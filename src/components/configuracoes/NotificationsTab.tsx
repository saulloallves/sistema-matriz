import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import { Send, MessageSquare, Mail, Settings, ChevronDown, Key, TestTube } from 'lucide-react';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import toast from 'react-hot-toast';

export const NotificationsTab = () => {
  const { 
    isLoading,
    isSaving,
    isTesting, 
    getSettings,
    saveSettings,
    testWhatsApp, 
    testEmail 
  } = useNotificationSettings();

  // Estados para Z-API (WhatsApp)
  const [zapiSettings, setZapiSettings] = useState({
    instance_id: '',
    instance_token: '',
    client_token: '',
    base_url: 'https://api.z-api.io',
  });

  // Estados para Brevo (E-mail)
  const [brevoSettings, setBrevoSettings] = useState({
    api_key: '',
    default_from: 'noreply@crescieperdi.com.br',
    default_from_name: 'Sistema Matriz - Cresci e Perdi',
  });

  // Estados para testes
  const [testWhatsAppData, setTestWhatsAppData] = useState({
    phone: '',
    message: '🧪 Teste de envio de mensagem WhatsApp via Sistema Matriz.\n\nSe você recebeu esta mensagem, a integração está funcionando corretamente! ✅',
  });

  const [testEmailData, setTestEmailData] = useState({
    email: '',
    subject: 'Teste de Envio - Sistema Matriz',
    message: 'Esta é uma mensagem de teste enviada pelo Sistema Matriz.\n\nSe você recebeu este e-mail, a integração com o Brevo está funcionando corretamente!',
  });

  // Carregar configurações existentes ao montar o componente
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      if (settings) {
        setZapiSettings({
          instance_id: settings.zapi_instance_id || '',
          instance_token: settings.zapi_instance_token || '',
          client_token: settings.zapi_client_token || '',
          base_url: settings.zapi_base_url || 'https://api.z-api.io',
        });
        setBrevoSettings({
          api_key: settings.brevo_api_key || '',
          default_from: settings.brevo_default_from || 'noreply@crescieperdi.com.br',
          default_from_name: settings.brevo_default_from_name || 'Sistema Matriz - Cresci e Perdi',
        });
      }
    };
    loadSettings();
  }, [getSettings]);

  const handleSaveZapiSettings = async () => {
    // Validações
    if (!zapiSettings.instance_id || !zapiSettings.instance_token || !zapiSettings.client_token) {
      toast.error('Preencha todos os campos obrigatórios do Z-API');
      return;
    }

    const success = await saveSettings({
      zapi_instance_id: zapiSettings.instance_id,
      zapi_instance_token: zapiSettings.instance_token,
      zapi_client_token: zapiSettings.client_token,
      zapi_base_url: zapiSettings.base_url,
    });

    if (success) {
      toast.success('Configurações do Z-API salvas com sucesso!');
    }
  };

  const handleSaveBrevoSettings = async () => {
    if (!brevoSettings.api_key) {
      toast.error('A API Key do Brevo é obrigatória');
      return;
    }

    const success = await saveSettings({
      brevo_api_key: brevoSettings.api_key,
      brevo_default_from: brevoSettings.default_from,
      brevo_default_from_name: brevoSettings.default_from_name,
    });

    if (success) {
      toast.success('Configurações do Brevo salvas com sucesso!');
    }
  };

  const handleTestWhatsApp = async () => {
    if (!testWhatsAppData.phone) {
      toast.error('Informe um número de telefone para teste');
      return;
    }

    // Limpar telefone (apenas números)
    const cleanPhone = testWhatsAppData.phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10 || cleanPhone.length > 13) {
      toast.error('Número de telefone inválido. Use o formato: 5511999999999');
      return;
    }

    await testWhatsApp({
      phone: cleanPhone,
      message: testWhatsAppData.message,
    });
  };

  const handleTestEmail = async () => {
    if (!testEmailData.email) {
      toast.error('Informe um e-mail para teste');
      return;
    }

    // Validação básica de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmailData.email)) {
      toast.error('E-mail inválido');
      return;
    }

    await testEmail({
      email: testEmailData.email,
      subject: testEmailData.subject,
      message: testEmailData.message,
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <CircularProgress size={24} />
          <Typography>Carregando configurações...</Typography>
        </Box>
      )}

      <Alert severity="info" icon={<Settings />}>
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
          Gestão de Credenciais de Notificações
        </Typography>
        <Typography variant="body2" component="div">
          Configure aqui as credenciais para envio de mensagens via WhatsApp (Z-API) e E-mail (Brevo).
          As configurações são salvas no banco de dados e utilizadas automaticamente pelas Edge Functions.
        </Typography>
      </Alert>

      {/* Z-API (WhatsApp) Configuration */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <MessageSquare size={24} color="#25D366" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Configuração Z-API (WhatsApp)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure as credenciais da instância Z-API para envio de mensagens WhatsApp
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Instance ID"
                value={zapiSettings.instance_id}
                onChange={(e) => setZapiSettings({ ...zapiSettings, instance_id: e.target.value })}
                placeholder="sua-instancia-id"
                helperText="ID da instância Z-API"
                InputProps={{
                  startAdornment: <Key size={18} style={{ marginRight: 8, color: '#999' }} />,
                }}
              />

              <TextField
                fullWidth
                label="Instance Token"
                type="password"
                value={zapiSettings.instance_token}
                onChange={(e) => setZapiSettings({ ...zapiSettings, instance_token: e.target.value })}
                placeholder="seu-instance-token"
                helperText="Token da instância Z-API"
                InputProps={{
                  startAdornment: <Key size={18} style={{ marginRight: 8, color: '#999' }} />,
                }}
              />

              <TextField
                fullWidth
                label="Client Token"
                type="password"
                value={zapiSettings.client_token}
                onChange={(e) => setZapiSettings({ ...zapiSettings, client_token: e.target.value })}
                placeholder="seu-client-token"
                helperText="Token do cliente Z-API"
                InputProps={{
                  startAdornment: <Key size={18} style={{ marginRight: 8, color: '#999' }} />,
                }}
              />

              <TextField
                fullWidth
                label="Base URL"
                value={zapiSettings.base_url}
                onChange={(e) => setZapiSettings({ ...zapiSettings, base_url: e.target.value })}
                placeholder="https://api.z-api.io"
                helperText="URL base da API Z-API"
              />
            </Box>

            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Variáveis de ambiente necessárias no Supabase:</strong>
              </Typography>
              <Box component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, mt: 1, mb: 0 }}>
                ZAPI_INSTANCE_ID={zapiSettings.instance_id || '<seu-valor>'}<br />
                ZAPI_INSTANCE_TOKEN={zapiSettings.instance_token || '<seu-valor>'}<br />
                ZAPI_CLIENT_TOKEN={zapiSettings.client_token || '<seu-valor>'}<br />
                ZAPI_BASE_URL={zapiSettings.base_url || 'https://api.z-api.io'}
              </Box>
            </Alert>

            <Button
              variant="contained"
              color="primary"
              startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <Settings />}
              onClick={handleSaveZapiSettings}
              disabled={isSaving}
              fullWidth
            >
              {isSaving ? 'Salvando...' : 'Salvar Configurações Z-API'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Brevo (E-mail) Configuration */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Mail size={24} color="#0092FF" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Configuração Brevo (E-mail)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure as credenciais do Brevo (SendInBlue) para envio de e-mails
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="API Key"
              type="password"
              value={brevoSettings.api_key}
              onChange={(e) => setBrevoSettings({ ...brevoSettings, api_key: e.target.value })}
              placeholder="xkeysib-..."
              helperText="API Key do Brevo (encontre em Account → SMTP & API → API Keys)"
              InputProps={{
                startAdornment: <Key size={18} style={{ marginRight: 8, color: '#999' }} />,
              }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="E-mail Remetente Padrão"
                type="email"
                value={brevoSettings.default_from}
                onChange={(e) => setBrevoSettings({ ...brevoSettings, default_from: e.target.value })}
                placeholder="noreply@crescieperdi.com.br"
                helperText="E-mail que aparecerá como remetente"
              />

              <TextField
                fullWidth
                label="Nome do Remetente Padrão"
                value={brevoSettings.default_from_name}
                onChange={(e) => setBrevoSettings({ ...brevoSettings, default_from_name: e.target.value })}
                placeholder="Sistema Matriz - Cresci e Perdi"
                helperText="Nome que aparecerá como remetente"
              />
            </Box>

            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Variáveis de ambiente necessárias no Supabase:</strong>
              </Typography>
              <Box component="pre" sx={{ fontFamily: 'monospace', fontSize: 12, mt: 1, mb: 0 }}>
                BREVO_API_KEY={brevoSettings.api_key || '<seu-valor>'}<br />
                BREVO_DEFAULT_FROM={brevoSettings.default_from}<br />
                BREVO_DEFAULT_FROM_NAME={brevoSettings.default_from_name}
              </Box>
            </Alert>

            <Button
              variant="contained"
              color="primary"
              startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <Settings />}
              onClick={handleSaveBrevoSettings}
              disabled={isSaving}
              fullWidth
            >
              {isSaving ? 'Salvando...' : 'Salvar Configurações Brevo'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ my: 2 }} />

      {/* Test Section */}
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TestTube size={24} color="#E3A024" />
        Testes de Envio
      </Typography>

      {/* WhatsApp Test */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MessageSquare size={20} color="#25D366" />
            <Typography variant="h6">Teste de Envio WhatsApp</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info">
              Informe um número de telefone válido (com DDI) para testar o envio. Exemplo: 5511999999999
            </Alert>

            <TextField
              fullWidth
              label="Número de Telefone"
              value={testWhatsAppData.phone}
              onChange={(e) => setTestWhatsAppData({ ...testWhatsAppData, phone: e.target.value })}
              placeholder="5511999999999"
              helperText="Formato: DDI + DDD + Número (apenas números)"
              sx={{ maxWidth: { md: '50%' } }}
            />

            <TextField
              fullWidth
              label="Mensagem de Teste"
              multiline
              rows={4}
              value={testWhatsAppData.message}
              onChange={(e) => setTestWhatsAppData({ ...testWhatsAppData, message: e.target.value })}
              placeholder="Digite a mensagem de teste..."
            />

            <Button
              variant="contained"
              color="success"
              startIcon={isTesting ? <CircularProgress size={20} color="inherit" /> : <Send />}
              onClick={handleTestWhatsApp}
              disabled={isTesting}
              fullWidth
            >
              {isTesting ? 'Enviando...' : 'Enviar Teste WhatsApp'}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Email Test */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Mail size={20} color="#0092FF" />
            <Typography variant="h6">Teste de Envio E-mail</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info">
              Informe um endereço de e-mail válido para testar o envio via Brevo.
            </Alert>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="E-mail Destinatário"
                type="email"
                value={testEmailData.email}
                onChange={(e) => setTestEmailData({ ...testEmailData, email: e.target.value })}
                placeholder="teste@exemplo.com"
                helperText="E-mail que receberá a mensagem de teste"
              />

              <TextField
                fullWidth
                label="Assunto"
                value={testEmailData.subject}
                onChange={(e) => setTestEmailData({ ...testEmailData, subject: e.target.value })}
                placeholder="Teste de Envio"
              />
            </Box>

            <TextField
              fullWidth
              label="Mensagem de Teste"
              multiline
              rows={4}
              value={testEmailData.message}
              onChange={(e) => setTestEmailData({ ...testEmailData, message: e.target.value })}
              placeholder="Digite a mensagem de teste..."
            />

            <Button
              variant="contained"
              color="primary"
              startIcon={isTesting ? <CircularProgress size={20} color="inherit" /> : <Send />}
              onClick={handleTestEmail}
              disabled={isTesting}
              fullWidth
            >
              {isTesting ? 'Enviando...' : 'Enviar Teste E-mail'}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
