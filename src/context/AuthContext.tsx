'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (name: string, email: string, password: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  hydrated: false,
  login: async () => ({ error: null }),
  register: async () => ({ error: null }),
  logout: async () => {},
});

function translateError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
    return 'Email ou senha incorretos.';
  }
  if (m.includes('email already registered') || m.includes('user already registered')) {
    return 'Este email já está cadastrado.';
  }
  if (m.includes('password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (m.includes('email not confirmed')) {
    return 'Email não confirmado. Verifique sua caixa de entrada.';
  }
  if (m.includes('too many requests') || m.includes('rate limit')) {
    return 'Muitas tentativas. Aguarde um momento e tente novamente.';
  }
  return 'Ocorreu um erro. Tente novamente.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser({
          id: data.session.user.id,
          name:
            data.session.user.user_metadata?.display_name ||
            data.session.user.email?.split('@')[0] ||
            '',
          email: data.session.user.email || '',
        });
      }
      setHydrated(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name:
            session.user.user_metadata?.display_name ||
            session.user.email?.split('@')[0] ||
            '',
          email: session.user.email || '',
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: translateError(error.message) };
    return { error: null };
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ error: string | null; needsConfirmation?: boolean }> => {
    const supabase = getSupabaseClient();
    const username = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name, username },
      },
    });

    if (error) return { error: translateError(error.message) };
    if (!data.session) return { error: null, needsConfirmation: true };
    return { error: null };
  };

  const logout = async (): Promise<void> => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!user, user, hydrated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
