export type UserRole = 'admin' | 'technician' | 'supervisor' | 'employee';

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  full_name: string;
  employee_id?: string;
  role: UserRole;
  department_id: string;
  department_name: string;
  phone?: string;
  location?: string;
  is_active: boolean;
  avatar_url?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TicketStatus = 
  | 'NEW' 
  | 'OPEN' 
  | 'ASSIGNED' 
  | 'IN PROGRESS' 
  | 'ON HOLD' 
  | 'RESOLVED' 
  | 'CLOSED';

export type DeviceType = 
  | 'Desktop Computer'
  | 'Laptop'
  | 'Printer'
  | 'Scanner'
  | 'Network / LAN'
  | 'Internet Connection'
  | 'Telephone'
  | 'Server'
  | 'Hospital Information System'
  | 'PhilHealth eClaims / iHOMIS+'
  | 'Other IT Equipment';

export interface TicketCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  subcategories?: TicketSubcategory[];
}

export interface TicketSubcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
}

export interface Ticket {
  id: string;
  ticket_number: string; // e.g. CPH-IT-2026-00001
  title: string;
  description: string;
  requester_id: string;
  requester_name: string;
  requester_email?: string;
  department_id: string;
  department_name: string;
  unit?: string;
  contact_number: string;
  category_id: string;
  category_name: string;
  subcategory_id?: string;
  subcategory_name?: string;
  priority: TicketPriority;
  status: TicketStatus;
  device_type: DeviceType;
  location: string;
  asset_tag?: string;
  assigned_technician_id?: string;
  assigned_technician_name?: string;
  on_hold_reason?: string;
  resolution_summary?: string;
  created_at: string;
  updated_at: string;
  first_responded_at?: string;
  resolved_at?: string;
  closed_at?: string;
  reopened_count?: number;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  comment: string;
  is_internal: boolean;
  created_at: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_by: string;
  uploaded_by_name: string;
  created_at: string;
}

export interface TicketStatusHistory {
  id: string;
  ticket_id: string;
  old_status?: TicketStatus;
  new_status: TicketStatus;
  changed_by: string;
  changed_by_name: string;
  reason?: string;
  created_at: string;
}

export interface ITAsset {
  id: string;
  asset_tag: string;
  device_name: string;
  device_type: DeviceType;
  brand: string;
  model: string;
  serial_number: string;
  department_id: string;
  department_name?: string;
  location: string;
  assigned_employee_id?: string;
  assigned_employee_name?: string;
  acquisition_date: string;
  warranty_expiration?: string;
  status: 'Active' | 'In Repair' | 'Maintenance' | 'Retired' | 'Decommissioned';
  remarks?: string;
  created_at?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  target_table: string;
  target_id?: string;
  details: string | Record<string, any>;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface SLASetting {
  priority: TicketPriority;
  response_target_minutes: number;
  resolution_target_minutes: number;
}

export interface SLAStatus {
  response_target_minutes: number;
  resolution_target_minutes: number;
  response_elapsed_minutes: number;
  resolution_elapsed_minutes: number;
  is_response_breached: boolean;
  is_resolution_breached: boolean;
  response_remaining_minutes: number;
  resolution_remaining_minutes: number;
}
