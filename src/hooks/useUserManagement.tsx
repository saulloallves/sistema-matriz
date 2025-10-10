import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface CreateUserData {
  full_name: string;
  email: string;
  phone_number: string;
  notes?: string;
  role?: string;
}

interface CreateUserResponse {
  success: boolean;
  user_id?: string;
  notifications?: {
    whatsapp: boolean;
    email: boolean;
  };
  message?: string;
  error?: string;
}

export const useUserManagement = () => {
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData): Promise<CreateUserResponse> => {
      const { data, error } = await supabase.functions.invoke('create-user-with-notifications', {
        body: userData
      });

      if (error) {
        throw new Error(error.message || 'Erro ao criar usuário');
      }

      // Se a edge function retornou um erro no próprio data
      if (data && !data.success && data.error) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Usuário criado com sucesso!');
        
        // Mostrar status das notificações
        if (data.notifications) {
          const { whatsapp, email } = data.notifications;
          
          if (whatsapp && email) {
            toast.success('Credenciais enviadas via WhatsApp e Email');
          } else if (whatsapp) {
            toast.success('Credenciais enviadas via WhatsApp');
            toast.error('Falha ao enviar email', { duration: 4000 });
          } else if (email) {
            toast.success('Credenciais enviadas via Email');
            toast.error('Falha ao enviar WhatsApp', { duration: 4000 });
          } else {
            toast.error('Falha ao enviar notificações. Usuário criado, mas credenciais não foram enviadas.', { duration: 6000 });
          }
        }
        
        // Invalidar cache de usuários se necessário
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    },
    onError: (error: Error) => {
      console.error('Erro ao criar usuário:', error);
      toast.error(error.message || 'Erro ao criar usuário');
    }
  });

  return {
    createUser: createUserMutation.mutate,
    isCreating: createUserMutation.isPending,
    error: createUserMutation.error,
    isSuccess: createUserMutation.isSuccess,
    reset: createUserMutation.reset
  };
};