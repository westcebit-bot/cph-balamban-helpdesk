import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { INITIAL_USERS, INITIAL_DEPARTMENTS } from '../data/initialDemoData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface RegisterPayload {
  full_name: string;
  username: string;
  password?: string;
  department_id: string;
  role?: UserRole;
  employee_id?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  usersList: UserProfile[];
  switchUser: (userId: string) => void;
  loginWithUsername: (username: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  registerAccount: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('cph_helpdesk_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUserId = localStorage.getItem('cph_helpdesk_current_user_id');
    const found = usersList.find((u) => u.id === savedUserId);
    return found || usersList[0];
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('cph_helpdesk_users', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cph_helpdesk_current_user_id', user.id);
    } else {
      localStorage.removeItem('cph_helpdesk_current_user_id');
    }
  }, [user]);

  const switchUser = (userId: string) => {
    const target = usersList.find((u) => u.id === userId);
    if (target) {
      setUser(target);
    }
  };

  const loginWithUsername = async (usernameInput: string, _password?: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const q = usernameInput.trim().toLowerCase();
      const found = usersList.find(
        (u) => u.username.toLowerCase() === q || (u.email && u.email.toLowerCase() === q)
      );

      if (found) {
        setUser(found);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, message: 'Invalid username or password. User account not found.' };
      }
    } catch (err) {
      setIsLoading(false);
      return { success: false, message: 'An authentication error occurred.' };
    }
  };

  const registerAccount = async (payload: RegisterPayload): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const q = payload.username.trim().toLowerCase();
      const exists = usersList.some((u) => u.username.toLowerCase() === q);

      if (exists) {
        setIsLoading(false);
        return { success: false, message: 'Username already taken. Please choose another username.' };
      }

      const dept = INITIAL_DEPARTMENTS.find((d) => d.id === payload.department_id);

      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        username: payload.username.trim(),
        email: `${payload.username.trim()}@cphbalamban.gov.ph`,
        full_name: payload.full_name.trim(),
        employee_id: payload.employee_id?.trim(),
        role: payload.role || 'employee',
        department_id: payload.department_id,
        department_name: dept?.name || 'Hospital Department',
        is_active: true,
      };

      setUsersList((prev) => [newUser, ...prev]);
      setUser(newUser);
      setIsLoading(false);

      return { success: true };
    } catch (err) {
      setIsLoading(false);
      return { success: false, message: 'Failed to create user account.' };
    }
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'employee',
        usersList,
        switchUser,
        loginWithUsername,
        registerAccount,
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
