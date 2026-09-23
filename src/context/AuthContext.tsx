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
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
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

  // Track deleted user IDs and usernames so deleted accounts can NEVER log in again
  const [deletedUserIds, setDeletedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('cph_helpdesk_deleted_users');
    return saved ? JSON.parse(saved) : [];
  });

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

  // Real-time synchronization across normal browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cph_helpdesk_users' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setUsersList(parsed);
            const savedUserId = localStorage.getItem('cph_helpdesk_current_user_id');
            if (savedUserId) {
              const found = parsed.find((u: UserProfile) => u.id === savedUserId);
              setUser(found || null);
            }
          }
        } catch (err) {
          console.error('Failed to sync users across tabs:', err);
        }
      }
      if (e.key === 'cph_helpdesk_deleted_users' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setDeletedUserIds(parsed);
        } catch (err) {}
      }
      if (e.key === 'cph_helpdesk_current_user_id') {
        const savedUserId = e.newValue;
        if (!savedUserId) {
          setUser(null);
        } else {
          setUsersList((currentList) => {
            const found = currentList.find((u) => u.id === savedUserId);
            if (found) setUser(found);
            return currentList;
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  // Permanently delete user account & add to deleted blacklist
  const deleteUser = (userId: string) => {
    const target = usersList.find((u) => u.id === userId);

    setUsersList((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      localStorage.setItem('cph_helpdesk_users', JSON.stringify(updated));
      return updated;
    });

    setDeletedUserIds((prev) => {
      const updated = [
        ...prev, 
        userId, 
        target?.username?.toLowerCase() || '', 
        target?.email?.toLowerCase() || ''
      ].filter(Boolean);
      const unique = Array.from(new Set(updated));
      localStorage.setItem('cph_helpdesk_deleted_users', JSON.stringify(unique));
      return unique;
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

      // Check if user or username is in deleted blacklist
      if (deletedUserIds.includes(q)) {
        setIsLoading(false);
        return { success: false, message: 'This user account has been deleted and cannot log in.' };
      }
      
      const found = usersList.find((u) => {
        const uName = (u.username || '').toLowerCase();
        const uEmail = (u.email || '').toLowerCase();
        return (uName === q || uEmail === q) && !deletedUserIds.includes(u.id);
      });

      if (found) {
        if (!found.is_active) {
          setIsLoading(false);
          return { success: false, message: 'This account is deactivated. Please contact your IT administrator.' };
        }
        setUser(found);
        setIsLoading(false);
        return { success: true };
      }

      // Fallback check in INITIAL_USERS only if NOT in deleted blacklist
      const initialMatch = INITIAL_USERS.find((u) => {
        const uName = (u.username || '').toLowerCase();
        const uEmail = (u.email || '').toLowerCase();
        return (uName === q || uEmail === q) && !deletedUserIds.includes(u.id) && !deletedUserIds.includes(uName);
      });

      if (initialMatch) {
        if (!initialMatch.is_active) {
          setIsLoading(false);
          return { success: false, message: 'This account is deactivated. Please contact your IT administrator.' };
        }
        setUser(initialMatch);
        setUsersList((prev) => {
          const exists = prev.some((u) => u.id === initialMatch.id || u.username.toLowerCase() === initialMatch.username.toLowerCase());
          if (!exists) {
            const updated = [initialMatch, ...prev];
            localStorage.setItem('cph_helpdesk_users', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
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
