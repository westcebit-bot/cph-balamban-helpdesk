import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialDemoData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  demoUsers: UserProfile[];
  switchUser: (userId: string) => void;
  loginWithEmail: (email: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('cph_helpdesk_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUserId = localStorage.getItem('cph_helpdesk_current_user_id');
    const found = usersList.find((u) => u.id === savedUserId);
    return found || usersList[0]; // Default to Admin for immediate exploration
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('cph_helpdesk_users', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cph_helpdesk_current_user_id', user.id);
    }
  }, [user]);

  // Handle Supabase auth state if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const client = supabase;

    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        client
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setUser(data as UserProfile);
          });
      }
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        client
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setUser(data as UserProfile);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const switchUser = (userId: string) => {
    const target = usersList.find((u) => u.id === userId);
    if (target) {
      setUser(target);
    }
  };

  const loginWithEmail = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOtp({ email });
        setIsLoading(false);
        return !error;
      } else {
        const found = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (found) {
          setUser(found);
          setIsLoading(false);
          return true;
        }
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
    }
    setUser(usersList.find((u) => u.role === 'employee') || usersList[0]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'employee',
        demoUsers: usersList,
        switchUser,
        loginWithEmail,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
