-- ============================================================================
-- CEBU PROVINCIAL HOSPITAL - BALAMBAN (CPH-BALAMBAN)
-- IT HELPDESK TICKETING SYSTEM DATABASE SCHEMA
-- PostgreSQL / Supabase Migration 01_schema.sql
-- ============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    employee_id TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'technician', 'supervisor', 'employee')),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    phone TEXT,
    location TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TICKET CATEGORIES & SUBCATEGORIES
CREATE TABLE IF NOT EXISTS public.ticket_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.ticket_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_id, name)
);

-- 4. IT ASSETS REGISTRY TABLE
CREATE TABLE IF NOT EXISTS public.it_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_tag TEXT NOT NULL UNIQUE,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    location TEXT,
    assigned_employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    acquisition_date DATE,
    warranty_expiration DATE,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'In Repair', 'Maintenance', 'Retired', 'Decommissioned')),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TICKETS SEQUENCE GENERATOR & TABLE
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1 INCREMENT 1;

CREATE OR REPLACE FUNCTION generate_cph_ticket_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    seq_val INT;
    new_ticket_num TEXT;
BEGIN
    current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    seq_val := NEXTVAL('ticket_number_seq');
    new_ticket_num := 'CPH-IT-' || current_year || '-' || LPAD(seq_val::TEXT, 5, '0');
    RETURN new_ticket_num;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number TEXT NOT NULL UNIQUE DEFAULT generate_cph_ticket_number(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    unit TEXT,
    contact_number TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.ticket_categories(id) ON DELETE RESTRICT,
    subcategory_id UUID REFERENCES public.ticket_subcategories(id) ON DELETE SET NULL,
    priority TEXT NOT NULL CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'OPEN', 'ASSIGNED', 'IN PROGRESS', 'ON HOLD', 'RESOLVED', 'CLOSED')),
    device_type TEXT NOT NULL,
    location TEXT NOT NULL,
    asset_tag TEXT,
    assigned_technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    on_hold_reason TEXT,
    resolution_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    first_responded_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- 6. TICKET COMMENTS / TROUBLESHOOTING NOTES
CREATE TABLE IF NOT EXISTS public.ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TICKET ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TICKET STATUS HISTORY & AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.ticket_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SYSTEM & SLA SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES ON ALL TABLES
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.it_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies for reference data
CREATE POLICY "Allow public read departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Allow public read categories" ON public.ticket_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read subcategories" ON public.ticket_subcategories FOR SELECT USING (true);

-- RLS: Profiles
CREATE POLICY "Allow authenticated read profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow user or admin update profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

-- RLS: Tickets
CREATE POLICY "Tickets Select Policy" ON public.tickets FOR SELECT USING (
    auth.uid() = requester_id OR
    assigned_technician_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'technician')) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'supervisor' AND department_id = public.tickets.department_id)
);

CREATE POLICY "Tickets Insert Policy" ON public.tickets FOR INSERT WITH CHECK (
    auth.uid() = requester_id
);

CREATE POLICY "Tickets Update Policy" ON public.tickets FOR UPDATE USING (
    auth.uid() = requester_id OR
    assigned_technician_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'technician')) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'supervisor' AND department_id = public.tickets.department_id)
);

-- RLS: IT Assets
CREATE POLICY "Assets Select Policy" ON public.it_assets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Assets Modify Policy" ON public.it_assets FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'technician'))
);

-- RLS: Notifications
CREATE POLICY "Notifications Self Policy" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- SEED DEFAULT DEPARTMENTS
INSERT INTO public.departments (name, code, description) VALUES
('Medical Records', 'MEDREC', 'Patient records and archives'),
('Billing & Cashier', 'BILLING', 'Hospital financial operations'),
('PhilHealth & Claims', 'PHILHEALTH', 'eClaims and insurance processing'),
('Nursing Service', 'NURSING', 'Wards and clinical nursing staff'),
('Emergency Room', 'ER', 'Urgent care and trauma'),
('Laboratory', 'LAB', 'Pathology and diagnostic testing'),
('Pharmacy', 'PHARM', 'Medicine dispensing'),
('Radiology', 'RAD', 'X-Ray and diagnostic imaging'),
('Administration', 'ADMIN', 'Executive offices and HR'),
('IT Department', 'IT', 'Information Technology & Systems')
ON CONFLICT (code) DO NOTHING;

-- SEED TICKET CATEGORIES
INSERT INTO public.ticket_categories (name, description) VALUES
('Hardware', 'Desktop, laptop, printer, monitor, scanner issues'),
('Software', 'OS, MS Office, desktop software, antivirus'),
('Network and Connectivity', 'Wi-Fi, LAN, Internet, DNS, Network switch issues'),
('Hospital Information Systems', 'iHOMIS+, PhilHealth eClaims, Billing system'),
('User Account and Access', 'Password reset, user creation, permissions'),
('IT Equipment and Services', 'Equipment setup, transfer, preventive maintenance'),
('Other IT Concerns', 'General inquiries and miscellaneous requests')
ON CONFLICT (name) DO NOTHING;
