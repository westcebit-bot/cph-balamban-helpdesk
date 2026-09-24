import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Ticket as TicketIcon, 
  PlusCircle, 
  Wrench, 
  HardDrive, 
  FileText, 
  ShieldAlert, 
  Settings, 
  Users,
  User
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { role, user } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: role === 'admin' ? 'Admin Dashboard' : role === 'technician' ? 'Tech Workspace' : role === 'supervisor' ? 'Dept Dashboard' : 'My Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'technician', 'supervisor', 'employee'],
    },
    {
      id: 'tickets',
      label: role === 'employee' ? 'My Tickets' : role === 'supervisor' ? 'Department Tickets' : 'All IT Tickets',
      icon: TicketIcon,
      roles: ['admin', 'technician', 'supervisor', 'employee'],
    },
    {
      id: 'submit-ticket',
      label: 'Submit New Ticket',
      icon: PlusCircle,
      roles: ['admin', 'technician', 'supervisor', 'employee'],
    },
    {
      id: 'tech-queue',
      label: 'Technician Queue',
      icon: Wrench,
      roles: ['admin', 'technician'],
    },
    {
      id: 'assets',
      label: 'IT Asset Registry',
      icon: HardDrive,
      roles: ['admin', 'technician', 'supervisor'],
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: FileText,
      roles: ['admin', 'technician', 'supervisor'],
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: Users,
      roles: ['admin'],
    },
    {
      id: 'audit',
      label: 'System Audit Logs',
      icon: ShieldAlert,
      roles: ['admin'],
    },
    {
      id: 'profile-settings',
      label: 'My Profile & Security',
      icon: User,
      roles: ['admin', 'technician', 'supervisor', 'employee'],
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between shrink-0 shadow-lg">
      <div className="p-4">
        {/* User Card */}
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 mb-6">
          <div className="flex items-center space-x-3">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-sky-400/40" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-sm shadow-xs border border-sky-400/40">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="font-semibold text-white text-xs truncate">{user?.full_name}</p>
              <p className="text-[10px] text-sky-400 capitalize font-medium">{user?.role} &bull; {user?.department_name}</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Hospital Footer Info & Version Badge */}
      <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-400 bg-slate-950/60">
        <div className="flex items-center justify-between mb-1">
          <p className="font-extrabold text-sky-400 uppercase tracking-wider">CPH – Balamban</p>
          <span className="bg-sky-900 text-sky-200 px-1.5 py-0.5 rounded text-[9px] font-bold border border-sky-700/80">
            v2.0
          </span>
        </div>
        <p className="text-[10px] text-slate-400">Integrated IT Helpdesk System</p>
        <p className="mt-1 text-[9px] text-slate-500 font-mono">Build: 2026.09.24 &bull; RA 10173</p>
      </div>
    </aside>
  );
};
