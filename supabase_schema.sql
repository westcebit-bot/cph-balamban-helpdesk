-- CPH-Balamban Helpdesk & ITSM Ticketing System
-- Complete Supabase PostgreSQL Schema & Realtime Setup

-- 1. Create User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT,
  email TEXT,
  full_name TEXT NOT NULL,
  employee_id TEXT,
  role TEXT NOT NULL DEFAULT 'employee',
  department_id TEXT NOT NULL,
  department_name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Tickets Table
CREATE TABLE IF NOT EXISTS public.tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requester_id TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT,
  department_id TEXT NOT NULL,
  department_name TEXT NOT NULL,
  unit TEXT,
  contact_number TEXT,
  category_id TEXT NOT NULL,
  category_name TEXT NOT NULL,
  subcategory_id TEXT,
  subcategory_name TEXT,
  priority TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'NEW',
  device_type TEXT,
  location TEXT,
  asset_tag TEXT,
  assigned_technician_id TEXT,
  assigned_technician_name TEXT,
  first_responded_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  on_hold_reason TEXT,
  resolution_summary TEXT,
  reopened_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Ticket Comments Table
CREATE TABLE IF NOT EXISTS public.ticket_comments (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) & Public Access Policies for Anon Users
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public full access to user_profiles" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to tickets" ON public.tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to ticket_comments" ON public.ticket_comments FOR ALL USING (true) WITH CHECK (true);

-- 5. Enable Supabase Postgres Realtime for Instant Cross-Browser Synchronization
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_comments;
