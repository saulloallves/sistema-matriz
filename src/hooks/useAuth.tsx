import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Verificar se o usuário está ativo após fazer login
          setTimeout(async () => {
            await checkUserStatus(session.user.id);
          }, 0);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Verificar se o usuário está ativo na sessão existente
        setTimeout(async () => {
          await checkUserStatus(session.user.id);
        }, 0);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserStatus = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('status')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erro ao verificar status do usuário:', error);
        return;
      }

      if (profile?.status === 'inativo') {
        toast.error('Sua conta foi desativada. Entre em contato com o administrador.');
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Erro ao verificar status do usuário:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      // Verificar imediatamente se o usuário está ativo
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('status')
          .eq('user_id', data.user.id)
          .single();

        if (profileError) {
          console.error('Erro ao verificar status do usuário:', profileError);
          toast.error('Erro ao verificar permissões do usuário');
          await supabase.auth.signOut();
          return { error: profileError };
        }

        if (profile?.status === 'inativo') {
          toast.error('Sua conta foi desativada. Entre em contato com o administrador.');
          await supabase.auth.signOut();
          return { error: { message: 'Conta desativada' } };
        }
      }

      toast.success('Login realizado com sucesso!');
      return { error: null };
    } catch (error: any) {
      toast.error('Erro inesperado durante o login');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro durante o logout');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};