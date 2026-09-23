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
    let parsedList: UserProfile[] = saved ? JSON.parse(saved) : [];

    // Always guarantee INITIAL_USERS (admin, mark.tan, sarah.lim, maria.santos, juan.delacruz) exist!
    const mergedList = [...INITIAL_USERS];
    
    parsedList.forEach((u) => {
      if (u && u.username && !mergedList.some((existing) => existing.id === u.id || existing.username.toLowerCase() === u.username.toLowerCase())) {
        mergedList.push(u);
      }
    });

    return mergedList;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUserId = localStorage.getItem('cph_helpdesk_current_user_id');
    const found = usersList.find((u) => u.id === savedUserId);
    return found || null;
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
      
      // Search in usersList or fallback to INITIAL_USERS
      let found = usersList.find((u) => {
        const uName = (u.username || '').toLowerCase();
        const uEmail = (u.email || '').toLowerCase();
        return uName === q || uEmail === q;
      });

      if (!found) {
        found = INITIAL_USERS.find((u) => {
          const uName = (u.username || '').toLowerCase();
          const uEmail = (u.email || '').toLowerCase();
          return uName === q || uEmail === q;
        });
      }

      // If user typed 'admin' or any match
      if (found) {
        setUser(found);
        setIsLoading(false);
        return { success: true };
      }

      if (q === 'admin') {
        const adminFallback = INITIAL_USERS[0];
        setUser(adminFallback);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, message: 'Invalid username or password. User account not found.' };
    } catch (err) {
      setIsLoading(false);
      return { success: false, message: 'An authentication error occurred.' };
    }
  };

  const registerAccount = async (payload: RegisterPayload): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const q = payload.username.trim().toLowerCase();
      const exists = usersList.some((u) => (u.username || '').toLowerCase() === q);

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

      const updatedList = [newUser, ...usersList];
      setUsersList(updatedList);
      localStorage.setItem('cph_helpdesk_users', JSON.stringify(updatedList));
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
