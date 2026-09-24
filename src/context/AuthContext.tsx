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

const SYSTEM_BUILD_VERSION = 'v2.0_UNIFIED_USERS_SYNC_V13';

const isBlockedUser = (u: UserProfile | string): boolean => {
  if (typeof u === 'string') {
    const q = u.trim().toLowerCase();
    return q === 'admin' || q === 'admin123' || q === 'usr-admin-1' || q === 'admin.reyes@cphbalamban.gov.ph';
  }
  const uName = (u.username || '').toLowerCase();
  const fName = (u.full_name || '').toLowerCase();
  const email = (u.email || '').toLowerCase();
  return (
    uName === 'admin' ||
    uName === 'admin123' ||
    u.id === 'usr-admin-1' ||
    fName.includes('antonio reyes') ||
    email.includes('admin.reyes')
  );
};

const sanitizeUsers = (list: UserProfile[]): UserProfile[] => {
  return list.filter((u) => !isBlockedUser(u));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Force reset outdated browser cache when a new build/update is deployed
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    const currentVer = localStorage.getItem('cph_helpdesk_build_version');
    if (currentVer !== SYSTEM_BUILD_VERSION) {
      localStorage.setItem('cph_helpdesk_build_version', SYSTEM_BUILD_VERSION);
      localStorage.removeItem('cph_helpdesk_users');
      localStorage.removeItem('cph_helpdesk_current_user_id');
      localStorage.removeItem('cph_helpdesk_deleted_users');
      return sanitizeUsers(INITIAL_USERS);
    }

    const saved = localStorage.getItem('cph_helpdesk_users');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeUsers(parsed);
        }
      } catch (e) {
        console.error('Error parsing stored users:', e);
      }
    }
    return sanitizeUsers(INITIAL_USERS);
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUserId = localStorage.getItem('cph_helpdesk_current_user_id');
    if (savedUserId) {
      const found = usersList.find((u) => u.id === savedUserId && !isBlockedUser(u));
      if (found) return found;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Track deleted user IDs and usernames so deleted accounts can NEVER log in again
  const [deletedUserIds, setDeletedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('cph_helpdesk_deleted_users');
    const defaultBlocked = ['admin', 'admin123', 'usr-admin-1', 'admin.reyes@cphbalamban.gov.ph'];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return Array.from(new Set([...defaultBlocked, ...parsed]));
        }
      } catch (e) {}
    }
    return defaultBlocked;
  });

  // Sync usersList to localStorage & BroadcastChannel whenever usersList changes
  useEffect(() => {
    localStorage.setItem('cph_helpdesk_users', JSON.stringify(usersList));
    try {
      const ch = new BroadcastChannel('cph_helpdesk_users_sync');
      ch.postMessage({ type: 'USERS_SYNC', timestamp: Date.now() });
      ch.close();
    } catch (e) {}
  }, [usersList]);

  // Sync current user ID to localStorage whenever current user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('cph_helpdesk_current_user_id', user.id);
    } else {
      localStorage.removeItem('cph_helpdesk_current_user_id');
    }
  }, [user]);

  // Supabase Cloud Realtime DB Sync for Users
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    const fetchCloudUsers = async () => {
      try {
        const { data, error } = await client.from('user_profiles').select('*');
        if (!error && data && data.length > 0) {
          const sanitized = sanitizeUsers(data);
          setUsersList(sanitized);
          localStorage.setItem('cph_helpdesk_users', JSON.stringify(sanitized));
        } else if (!error && data && data.length === 0) {
          await client.from('user_profiles').upsert(sanitizeUsers(INITIAL_USERS));
        }
      } catch (err) {
        console.warn('[Supabase Sync] Users fetch fallback:', err);
      }
    };

    fetchCloudUsers();

    const channel = client
      .channel('public-users-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_profiles' },
        () => {
          fetchCloudUsers();
        }
      )
      .subscribe();

    return () => {
      if (client && channel) {
        client.removeChannel(channel);
      }
    };
  }, []);

  // Real-time synchronization across normal browser tabs
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('cph_helpdesk_users_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'USERS_SYNC') {
          const savedUsers = localStorage.getItem('cph_helpdesk_users');
          if (savedUsers) {
            try {
              const parsed = JSON.parse(savedUsers);
              if (Array.isArray(parsed)) setUsersList(sanitizeUsers(parsed));
            } catch (err) {}
          }
        }
      };
    } catch (e) {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cph_helpdesk_users' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setUsersList(sanitizeUsers(parsed));
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
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) channel.close();
    };
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

    if (isSupabaseConfigured && supabase) {
      supabase.from('user_profiles').delete().eq('id', userId).then(({ error }) => {
        if (error) console.warn('[Supabase Delete User Error]:', error);
      });
    }

    // If active user was deleted, log out
    if (user && user.id === userId) {
      setUser(null);
    }
  };

  // Toggle active/inactive status
  const toggleUserStatus = (userId: string) => {
    let newStatus = false;
    setUsersList((prev) => {
      const updated = prev.map((u) => {
        if (u.id === userId) {
          newStatus = !u.is_active;
          return { ...u, is_active: newStatus };
        }
        return u;
      });
      localStorage.setItem('cph_helpdesk_users', JSON.stringify(updated));
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      supabase.from('user_profiles').update({ is_active: newStatus }).eq('id', userId).then(({ error }) => {
        if (error) console.warn('[Supabase Toggle User Status Error]:', error);
      });
    }

    if (user && user.id === userId) {
      setUser((prev) => (prev ? { ...prev, is_active: !prev.is_active } : null));
    }
  };

  const loginWithUsername = async (usernameInput: string, passwordInput?: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const q = usernameInput.trim().toLowerCase();

      // Check if user or username is in deleted blacklist or blocked list
      if (isBlockedUser(q) || deletedUserIds.includes(q)) {
        setIsLoading(false);
        return { success: false, message: 'This account (@admin) has been permanently deleted from the hospital system.' };
      }
      
      const found = usersList.find((u) => {
        const uName = (u.username || '').toLowerCase();
        const uEmail = (u.email || '').toLowerCase();
        return (uName === q || uEmail === q) && !deletedUserIds.includes(u.id) && !deletedUserIds.includes(uName);
      });

      if (found) {
        if (!found.is_active) {
          setIsLoading(false);
          return { success: false, message: 'This account is deactivated. Please contact your IT administrator.' };
        }
        if (found.password && passwordInput && found.password !== passwordInput) {
          setIsLoading(false);
          return { success: false, message: 'Invalid password. Please check your credentials.' };
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
        if (initialMatch.password && passwordInput && initialMatch.password !== passwordInput) {
          setIsLoading(false);
          return { success: false, message: 'Invalid password. Please check your credentials.' };
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
        password: payload.password,
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

      if (isSupabaseConfigured && supabase) {
        supabase.from('user_profiles').insert([newUser]).then(({ error }) => {
          if (error) console.warn('[Supabase Insert User Error]:', error);
        });
      }

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
