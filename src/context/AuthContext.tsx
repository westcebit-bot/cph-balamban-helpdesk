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
  updateUserProfile: (userId: string, data: Partial<UserProfile>) => void;
  deleteUser: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
  loginWithUsername: (username: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  registerAccount: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load users from localStorage or initialize with INITIAL_USERS
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('cph_helpdesk_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing stored users:', e);
      }
    }
    return INITIAL_USERS;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUserId = localStorage.getItem('cph_helpdesk_current_user_id');
    if (savedUserId) {
      const found = usersList.find((u) => u.id === savedUserId);
      if (found) return found;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync usersList to localStorage whenever usersList changes
  useEffect(() => {
    localStorage.setItem('cph_helpdesk_users', JSON.stringify(usersList));
  }, [usersList]);

  // Sync current user ID to localStorage whenever current user changes
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

  // Update profile details and persist immediately
  const updateUserProfile = (userId: string, data: Partial<UserProfile>) => {
    setUsersList((prev) => {
      const updated = prev.map((u) => {
        if (u.id === userId) {
          return { ...u, ...data };
        }
        return u;
      });
      localStorage.setItem('cph_helpdesk_users', JSON.stringify(updated));
      return updated;
    });

    // Update active user state if updating current logged-in user
    if (user && user.id === userId) {
      setUser((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  // Permanently delete user account
  const deleteUser = (userId: string) => {
    setUsersList((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      localStorage.setItem('cph_helpdesk_users', JSON.stringify(updated));
      return updated;
    });

    // If active user was deleted, log out
    if (user && user.id === userId) {
      setUser(null);
    }
  };

  // Toggle active/inactive status
  const toggleUserStatus = (userId: string) => {
    setUsersList((prev) => {
      const updated = prev.map((u) => {
        if (u.id === userId) {
          return { ...u, is_active: !u.is_active };
        }
        return u;
      });
      localStorage.setItem('cph_helpdesk_users', JSON.stringify(updated));
      return updated;
    });

    if (user && user.id === userId) {
      setUser((prev) => (prev ? { ...prev, is_active: !prev.is_active } : null));
    }
  };

  const loginWithUsername = async (usernameInput: string, _password?: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const q = usernameInput.trim().toLowerCase();
      
      const found = usersList.find((u) => {
        const uName = (u.username || '').toLowerCase();
        const uEmail = (u.email || '').toLowerCase();
        return uName === q || uEmail === q;
      });

      if (found) {
        setUser(found);
        setIsLoading(false);
        return { success: true };
      }

      // Admin fallback if list was empty
      if (q === 'admin') {
        const adminFallback = INITIAL_USERS[0];
        setUser(adminFallback);
        setUsersList((prev) => (prev.some((u) => u.id === adminFallback.id) ? prev : [adminFallback, ...prev]));
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
        updateUserProfile,
        deleteUser,
        toggleUserStatus,
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
