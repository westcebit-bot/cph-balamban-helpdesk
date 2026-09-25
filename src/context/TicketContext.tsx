import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Ticket, 
  TicketComment, 
  TicketAttachment, 
  ITAsset, 
  TicketCategory, 
  Department, 
  AuditLog, 
  TicketStatus, 
  TicketPriority,
  DeviceType
} from '../types';
import { 
  INITIAL_TICKETS, 
  INITIAL_ASSETS, 
  INITIAL_CATEGORIES, 
  INITIAL_DEPARTMENTS, 
  INITIAL_AUDIT_LOGS 
} from '../data/initialDemoData';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { pushCloudKVTickets, fetchCloudKVTickets } from '../lib/cloudSync';

interface NewTicketPayload {
  title: string;
  description: string;
  department_id: string;
  unit?: string;
  contact_number: string;
  category_id: string;
  subcategory_id?: string;
  priority: TicketPriority;
  device_type: DeviceType;
  location: string;
  asset_tag?: string;
  attachments?: File[];
}

interface TicketContextType {
  tickets: Ticket[];
  categories: TicketCategory[];
  departments: Department[];
  assets: ITAsset[];
  auditLogs: AuditLog[];
  comments: Record<string, TicketComment[]>;
  createTicket: (payload: NewTicketPayload) => Promise<Ticket>;
  deleteTicket: (ticketId: string) => Promise<boolean>;
  updateTicketStatus: (ticketId: string, status: TicketStatus, reasonOrSummary?: string) => Promise<boolean>;
  assignTicket: (ticketId: string, technicianId: string, technicianName?: string) => Promise<boolean>;
  reopenTicket: (ticketId: string, reason: string) => Promise<boolean>;
  addComment: (ticketId: string, comment: string, isInternal?: boolean) => Promise<boolean>;
  createAsset: (asset: Omit<ITAsset, 'id'>) => Promise<boolean>;
  updateAsset: (id: string, asset: Partial<ITAsset>) => Promise<boolean>;
  deleteAsset: (id: string) => Promise<boolean>;
  getTicketComments: (ticketId: string) => TicketComment[];
  getAssetHistory: (assetTag: string) => Ticket[];
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

const TICKET_BUILD_VERSION = 'v2.0_UNIFIED_TICKETS_V17';

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Load from local storage or defaults with persistent deletion tracking
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    localStorage.setItem('cph_helpdesk_ticket_build_ver', TICKET_BUILD_VERSION);
    const saved = localStorage.getItem('cph_helpdesk_tickets');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {}
    }
    const hasInitialized = localStorage.getItem('cph_helpdesk_initialized');
    if (hasInitialized === 'true') {
      return [];
    }
    localStorage.setItem('cph_helpdesk_initialized', 'true');
    return INITIAL_TICKETS;
  });

  const [categories, setCategories] = useState<TicketCategory[]>(() => {
    const saved = localStorage.getItem('cph_helpdesk_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);

  const [assets, setAssets] = useState<ITAsset[]>(() => {
    const saved = localStorage.getItem('cph_helpdesk_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('cph_helpdesk_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [comments, setComments] = useState<Record<string, TicketComment[]>>(() => {
    const saved = localStorage.getItem('cph_helpdesk_comments');
    if (saved) return JSON.parse(saved);
    // Initial sample comments
    return {
      'tkt-1': [
        {
          id: 'cmt-1',
          ticket_id: 'tkt-1',
          author_id: 'usr-tech-1',
          author_name: 'Mark Tan',
          author_role: 'technician',
          comment: 'Dispatched to ER 1F rack. Inspecting Cisco switch port lights and power supply.',
          is_internal: true,
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        }
      ]
    };
  });

  // Sync to local storage & broadcast across tabs
  useEffect(() => {
    localStorage.setItem('cph_helpdesk_tickets', JSON.stringify(tickets));
    try {
      const ch = new BroadcastChannel('cph_helpdesk_sync');
      ch.postMessage({ type: 'TICKET_SYNC', timestamp: Date.now() });
      ch.close();
    } catch (e) {}
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('cph_helpdesk_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('cph_helpdesk_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('cph_helpdesk_comments', JSON.stringify(comments));
    try {
      const ch = new BroadcastChannel('cph_helpdesk_sync');
      ch.postMessage({ type: 'TICKET_SYNC', timestamp: Date.now() });
      ch.close();
    } catch (e) {}
  }, [comments]);

  // Real-time synchronization across normal browser tabs
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('cph_helpdesk_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'TICKET_SYNC') {
          const savedTickets = localStorage.getItem('cph_helpdesk_tickets');
          if (savedTickets) {
            try { setTickets(JSON.parse(savedTickets)); } catch (err) {}
          }
          const savedComments = localStorage.getItem('cph_helpdesk_comments');
          if (savedComments) {
            try { setComments(JSON.parse(savedComments)); } catch (err) {}
          }
        }
      };
    } catch (e) {
      // BroadcastChannel optional fallback
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cph_helpdesk_tickets' && e.newValue) {
        try { setTickets(JSON.parse(e.newValue)); } catch (err) {}
      }
      if (e.key === 'cph_helpdesk_assets' && e.newValue) {
        try { setAssets(JSON.parse(e.newValue)); } catch (err) {}
      }
      if (e.key === 'cph_helpdesk_comments' && e.newValue) {
        try { setComments(JSON.parse(e.newValue)); } catch (err) {}
      }
      if (e.key === 'cph_helpdesk_audit_logs' && e.newValue) {
        try { setAuditLogs(JSON.parse(e.newValue)); } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) channel.close();
    };
  }, []);

  // Cloud DB & Relay Sync Hydration (Supports Supabase & Cloud KV Relay for isolated browser profiles)
  useEffect(() => {
    const fetchCloudTickets = async () => {
      let cloudData: Ticket[] | null = null;

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            cloudData = data;
          }
        } catch (e) {}
      }

      if (!cloudData) {
        cloudData = await fetchCloudKVTickets();
      }

      if (cloudData && Array.isArray(cloudData)) {
        setTickets((prevLocal) => {
          const map = new Map<string, Ticket>();
          cloudData.forEach((t: Ticket) => map.set(t.id, t));
          prevLocal.forEach((t: Ticket) => {
            if (!map.has(t.id)) map.set(t.id, t);
          });
          const merged = Array.from(map.values());
          merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          localStorage.setItem('cph_helpdesk_tickets', JSON.stringify(merged));
          localStorage.setItem('cph_helpdesk_initialized', 'true');
          return merged;
        });
      }
    };

    const fetchCloudComments = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.from('ticket_comments').select('*');
          if (!error && data && data.length > 0) {
            const grouped: Record<string, TicketComment[]> = {};
            data.forEach((c: TicketComment) => {
              if (!grouped[c.ticket_id]) grouped[c.ticket_id] = [];
              grouped[c.ticket_id].push(c);
            });
            setComments(grouped);
            localStorage.setItem('cph_helpdesk_comments', JSON.stringify(grouped));
          }
        } catch (err) {}
      }
    };

    fetchCloudTickets();
    fetchCloudComments();

    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('public-tickets-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
          fetchCloudTickets();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket_comments' }, () => {
          fetchCloudComments();
        })
        .subscribe();
    }

    const pollInterval = setInterval(() => {
      fetchCloudTickets();
      fetchCloudComments();
    }, 2500);

    return () => {
      clearInterval(pollInterval);
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const addAuditLog = (action: string, targetTable: string, targetId?: string, details?: any) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      user_id: user?.id,
      user_name: user?.full_name || 'System User',
      action,
      target_table: targetTable,
      target_id: targetId,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const createTicket = async (payload: NewTicketPayload): Promise<Ticket> => {
    const year = new Date().getFullYear();
    const count = tickets.length + 1;
    const ticketNumber = `CPH-IT-${year}-${String(count).padStart(5, '0')}`;

    const cat = categories.find((c) => c.id === payload.category_id);
    const subcat = cat?.subcategories?.find((s) => s.id === payload.subcategory_id);
    const dept = departments.find((d) => d.id === payload.department_id);

    const newTicket: Ticket = {
      id: `tkt-${Date.now()}`,
      ticket_number: ticketNumber,
      title: payload.title,
      description: payload.description,
      requester_id: user?.id || 'usr-employee-1',
      requester_name: user?.full_name || 'Hospital Employee',
      requester_email: user?.email,
      department_id: payload.department_id,
      department_name: dept?.name || 'Hospital Dept',
      unit: payload.unit,
      contact_number: payload.contact_number,
      category_id: payload.category_id,
      category_name: cat?.name || 'General',
      subcategory_id: payload.subcategory_id,
      subcategory_name: subcat?.name,
      priority: payload.priority,
      status: 'NEW',
      device_type: payload.device_type,
      location: payload.location,
      asset_tag: payload.asset_tag,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTickets((prev) => {
      const updated = [newTicket, ...prev];
      localStorage.setItem('cph_helpdesk_tickets', JSON.stringify(updated));
      localStorage.setItem('cph_helpdesk_initialized', 'true');
      pushCloudKVTickets(updated);
      return updated;
    });

    addAuditLog('Ticket Created', 'tickets', newTicket.id, { ticket_number: ticketNumber, priority: payload.priority });

    // Sync to Supabase Cloud immediately if configured
    if (isSupabaseConfigured && supabase) {
      supabase.from('tickets').upsert([newTicket]).then(({ error }) => {
        if (error) console.warn('[Supabase Upsert Ticket Error]:', error);
      });
    }

    // Send notifications to Admin and IT Staff
    if (payload.priority === 'Critical') {
      addNotification({
        user_id: 'usr-superadmin',
        title: '⚠️ CRITICAL TICKET SUBMITTED',
        message: `${ticketNumber}: ${payload.title} in ${dept?.name}`,
        link: newTicket.id,
      });
    }
    addNotification({
      user_id: 'usr-tech-1',
      title: 'New IT Ticket Created',
      message: `${ticketNumber} (${payload.priority}): ${payload.title}`,
      link: newTicket.id,
    });

    return newTicket;
  };

  const updateTicketStatus = async (ticketId: string, newStatus: TicketStatus, reasonOrSummary?: string): Promise<boolean> => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return false;

    const now = new Date().toISOString();
    const oldStatus = target.status;

    let updatedTicketObj: Ticket = { ...target };
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const updated: Ticket = {
            ...t,
            status: newStatus,
            updated_at: now,
            first_responded_at: t.first_responded_at || (newStatus !== 'NEW' ? now : undefined),
            resolved_at: newStatus === 'RESOLVED' ? now : t.resolved_at,
            closed_at: newStatus === 'CLOSED' ? now : t.closed_at,
            on_hold_reason: newStatus === 'ON HOLD' ? reasonOrSummary : t.on_hold_reason,
            resolution_summary: newStatus === 'RESOLVED' ? reasonOrSummary : t.resolution_summary,
          };
          updatedTicketObj = updated;
          return updated;
        }
        return t;
      })
    );

    addAuditLog(`Status Changed (${oldStatus} ➔ ${newStatus})`, 'tickets', ticketId, { reasonOrSummary });

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('tickets')
        .upsert([updatedTicketObj])
        .then(({ error }) => {
          if (error) console.warn('[Supabase Status Upsert Error]:', error);
        });
    }

    // Notify requester
    addNotification({
      user_id: target.requester_id,
      title: `Ticket Status Updated: ${newStatus}`,
      message: `${target.ticket_number} is now ${newStatus}`,
      link: target.id,
    });

    return true;
  };

  const assignTicket = async (ticketId: string, technicianId: string, technicianName?: string): Promise<boolean> => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return false;

    const assignedName = technicianName || (user?.id === technicianId ? user.full_name : 'IT Technician');

    const updatedTicketObj: Ticket = {
      ...target,
      assigned_technician_id: technicianId,
      assigned_technician_name: assignedName,
      status: target.status === 'NEW' ? 'ASSIGNED' : target.status,
      updated_at: new Date().toISOString(),
    };

    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? updatedTicketObj : t))
    );

    addAuditLog('Ticket Assigned', 'tickets', ticketId, { technician: assignedName });

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('tickets')
        .upsert([updatedTicketObj])
        .then(({ error }) => {
          if (error) console.warn('[Supabase Assign Ticket Error]:', error);
        });
    }

    addNotification({
      user_id: technicianId,
      title: 'Ticket Assigned to You',
      message: `You were assigned ${target.ticket_number}: ${target.title}`,
      link: target.id,
    });

    return true;
  };

  const reopenTicket = async (ticketId: string, reason: string): Promise<boolean> => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return false;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: 'IN PROGRESS',
            reopened_count: (t.reopened_count || 0) + 1,
            updated_at: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('tickets')
        .update({
          status: 'IN PROGRESS',
          reopened_count: (target.reopened_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .then(({ error }) => {
          if (error) console.warn('[Supabase Reopen Ticket Error]:', error);
        });
    }

    addComment(ticketId, `[TICKET REOPENED] Reason: ${reason}`, false);
    addAuditLog('Ticket Reopened', 'tickets', ticketId, { reason });

    return true;
  };

  const addComment = async (ticketId: string, commentText: string, isInternal = false): Promise<boolean> => {
    const newComment: TicketComment = {
      id: `cmt-${Date.now()}`,
      ticket_id: ticketId,
      author_id: user?.id || 'usr-1',
      author_name: user?.full_name || 'Staff Member',
      author_role: user?.role || 'employee',
      comment: commentText,
      is_internal: isInternal,
      created_at: new Date().toISOString(),
    };

    setComments((prev) => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), newComment],
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('ticket_comments').insert([newComment]).then(({ error }) => {
        if (error) console.warn('[Supabase Comment Insert Error]:', error);
      });
    }

    return true;
  };

  const createAsset = async (assetData: Omit<ITAsset, 'id'>): Promise<boolean> => {
    const newAsset: ITAsset = {
      ...assetData,
      id: `ast-${Date.now()}`,
    };
    setAssets((prev) => [newAsset, ...prev]);
    addAuditLog('IT Asset Created', 'it_assets', newAsset.id, { asset_tag: assetData.asset_tag });
    return true;
  };

  const updateAsset = async (id: string, assetData: Partial<ITAsset>): Promise<boolean> => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...assetData } : a))
    );
    addAuditLog('IT Asset Updated', 'it_assets', id, assetData);
    return true;
  };

  const deleteAsset = async (id: string): Promise<boolean> => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    addAuditLog('IT Asset Deleted', 'it_assets', id);
    return true;
  };

  const deleteTicket = async (ticketId: string): Promise<boolean> => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return false;

    setTickets((prev) => {
      const updated = prev.filter((t) => t.id !== ticketId);
      localStorage.setItem('cph_helpdesk_tickets', JSON.stringify(updated));
      localStorage.setItem('cph_helpdesk_initialized', 'true');
      pushCloudKVTickets(updated);
      return updated;
    });
    addAuditLog('Ticket Force Deleted', 'tickets', ticketId, { ticket_number: target.ticket_number, title: target.title });

    if (isSupabaseConfigured && supabase) {
      supabase.from('tickets').delete().eq('id', ticketId).then(({ error }) => {
        if (error) console.warn('[Supabase Delete Ticket Error]:', error);
      });
    }

    return true;
  };

  const getTicketComments = (ticketId: string) => {
    return comments[ticketId] || [];
  };

  const getAssetHistory = (assetTag: string) => {
    return tickets.filter((t) => t.asset_tag === assetTag);
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        categories,
        departments,
        assets,
        auditLogs,
        comments,
        createTicket,
        deleteTicket,
        updateTicketStatus,
        assignTicket,
        reopenTicket,
        addComment,
        createAsset,
        updateAsset,
        deleteAsset,
        getTicketComments,
        getAssetHistory,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
