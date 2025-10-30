/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface NotificationSettings {
  // Z-API (WhatsApp)
  zapi_instance_id: string;
  zapi_instance_token: string;
  zapi_client_token: string;
  zapi_base_url: string;
  
  // Brevo (E-mail)
  brevo_api_key: string;
  brevo_default_from: string;
  brevo_default_from_name: string;
}

export interface TestMessagePayload {
  phone?: string;
  email?: string;
  message?: string;
  subject?: string;
}

export const useNotificationSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Buscar configurações atuais do banco de dados
  const getSettings = useCallback(async (): Promise<Partial<NotificationSettings>> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_credentials' as any)
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Erro ao buscar credenciais:', error);
        // Retornar valores padrão se não houver credenciais cadastradas
        return {
          zapi_instance_id: '',
          zapi_instance_token: '',
          zapi_client_token: '',
          zapi_base_url: 'https://api.z-api.io',
          brevo_api_key: '',
          brevo_default_from: 'noreply@crescieperdi.com.br',
          brevo_default_from_name: 'Sistema Matriz - Cresci e Perdi',
        };
      }

      return {
        zapi_instance_id: (data as any)?.zapi_instance_id || '',
        zapi_instance_token: (data as any)?.zapi_instance_token || '',
        zapi_client_token: (data as any)?.zapi_client_token || '',
        zapi_base_url: (data as any)?.zapi_base_url || 'https://api.z-api.io',
        brevo_api_key: (data as any)?.brevo_api_key || '',
        brevo_default_from: (data as any)?.brevo_default_from || 'noreply@crescieperdi.com.br',
        brevo_default_from_name: (data as any)?.brevo_default_from_name || 'Sistema Matriz - Cresci e Perdi',
      };
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast.error('Erro ao buscar configurações');
      return {};
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar configurações no banco de dados
  const saveSettings = useCallback(async (settings: Partial<NotificationSettings>): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Buscar o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return false;
      }

      // Buscar se já existe um registro
      const { data: existing } = await supabase
        .from('notification_credentials' as any)
        .select('id')
        .limit(1)
        .single();

      let result;
      
      if ((existing as any)?.id) {
        // Atualizar registro existente
        result = await supabase
          .from('notification_credentials' as any)
          .update({
            ...settings,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', (existing as any).id);
      } else {
        // Inserir novo registro
        result = await supabase
          .from('notification_credentials' as any)
          .insert({
            ...settings,
            updated_by: user.id,
          });
      }

      if (result.error) {
        console.error('Erro ao salvar credenciais:', result.error);
        toast.error('Erro ao salvar configurações');
        return false;
      }

      toast.success('Configurações salvas com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Testar envio de WhatsApp
  const testWhatsApp = useCallback(async (payload: TestMessagePayload) => {
    if (!payload.phone || !payload.message) {
      toast.error('Telefone e mensagem são obrigatórios');
      return false;
    }

    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('zapi-send-text', {
        body: {
          phone: payload.phone,
          message: payload.message,
        },
      });

      if (error) {
        console.error('Erro ao enviar WhatsApp:', error);
        toast.error('Erro ao enviar mensagem WhatsApp');
        return false;
      }

      if (data?.success) {
        toast.success('Mensagem WhatsApp enviada com sucesso!');
        return true;
      } else {
        toast.error(data?.error || 'Falha ao enviar WhatsApp');
        return false;
      }
    } catch (error) {
      console.error('Erro ao testar WhatsApp:', error);
      toast.error('Erro ao testar envio de WhatsApp');
      return false;
    } finally {
      setIsTesting(false);
    }
  }, []);

  // Testar envio de E-mail
  const testEmail = useCallback(async (payload: TestMessagePayload) => {
    if (!payload.email || !payload.subject || !payload.message) {
      toast.error('E-mail, assunto e mensagem são obrigatórios');
      return false;
    }

    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('brevo-send-email', {
        body: {
          to: payload.email,
          subject: payload.subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #E3A024, #42a5f5); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Teste de Envio de E-mail</h1>
              </div>
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
                <p style="color: #333; line-height: 1.6;">${payload.message.replace(/\n/g, '<br>')}</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
                <p style="color: #999; font-size: 14px; text-align: center; margin: 0;">
                  Sistema Matriz - Teste de Configuração
                </p>
              </div>
            </div>
          `,
          text: payload.message,
        },
      });

      if (error) {
        console.error('Erro ao enviar e-mail:', error);
        toast.error('Erro ao enviar e-mail');
        return false;
      }

      if (data?.success) {
        toast.success('E-mail enviado com sucesso!');
        return true;
      } else {
        toast.error(data?.error || 'Falha ao enviar e-mail');
        return false;
      }
    } catch (error) {
      console.error('Erro ao testar e-mail:', error);
      toast.error('Erro ao testar envio de e-mail');
      return false;
    } finally {
      setIsTesting(false);
    }
  }, []);

  return {
    isLoading,
    isTesting,
    isSaving,
    getSettings,
    saveSettings,
    testWhatsApp,
    testEmail,
  };
};
