import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

export interface WebhookSubscription {
  id: string;
  endpoint_url: string;
  secret: string | null;
  topic: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useWebhookSubscriptions = () => {
  const queryClient = useQueryClient();

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhook-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WebhookSubscription[];
    },
  });

  const createWebhook = useMutation({
    mutationFn: async (webhook: Omit<WebhookSubscription, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('webhook_subscriptions')
        .insert([webhook])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-subscriptions'] });
      toast.success('Webhook criado com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao criar webhook:', error);
      toast.error('Erro ao criar webhook: ' + error.message);
    },
  });

  const updateWebhook = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WebhookSubscription> }) => {
      const { data, error } = await supabase
        .from('webhook_subscriptions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-subscriptions'] });
      toast.success('Webhook atualizado com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar webhook:', error);
      toast.error('Erro ao atualizar webhook: ' + error.message);
    },
  });

  const deleteWebhook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('webhook_subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-subscriptions'] });
      toast.success('Webhook removido com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro ao remover webhook:', error);
      toast.error('Erro ao remover webhook: ' + error.message);
    },
  });

  const toggleWebhook = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { data, error } = await supabase
        .from('webhook_subscriptions')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['webhook-subscriptions'] });
      toast.success(`Webhook ${data.enabled ? 'ativado' : 'desativado'} com sucesso!`);
    },
    onError: (error: Error) => {
      console.error('Erro ao alternar webhook:', error);
      toast.error('Erro ao alternar webhook: ' + error.message);
    },
  });

  return {
    webhooks,
    isLoading,
    createWebhook: createWebhook.mutate,
    isCreating: createWebhook.isPending,
    updateWebhook: updateWebhook.mutate,
    isUpdating: updateWebhook.isPending,
    deleteWebhook: deleteWebhook.mutate,
    isDeleting: deleteWebhook.isPending,
    toggleWebhook: toggleWebhook.mutate,
    isToggling: toggleWebhook.isPending,
  };
};
