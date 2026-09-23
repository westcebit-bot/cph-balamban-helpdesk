import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Bell, 
  User, 
  LogOut, 
  Shield, 
  Wrench, 
  Building2, 
  UserCheck, 
  CheckCheck, 
  Check,
  LogIn
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface NavbarProps {
  onOpenNewTicket: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewTicket, onOpenLoginModal }) => {
  const { user, role, demoUsers, switchUser, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleIcon = (r: string) => {
    switch (r) {
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-purple-400" />;
      case 'technician':
        return <Wrench className="w-3.5 h-3.5 text-amber-400" />;
      case 'supervisor':
        return <Building2 className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <UserCheck className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <nav className="bg-sky-950 text-white shadow-md sticky top-0 z-40 w-full border-b border-sky-900">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-lg border border-white/10 flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-amber-400 text-sky-950 font-bold flex items-center justify-center text-xs shadow-xs">
                CPH
              </div>
              <span className="font-extrabold text-sm tracking-wide hidden sm:inline-block">
                CPH-BALAMBAN IT HELPDESK
              </span>
            </div>
          </div>

          {/* Actions & Login */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenNewTicket}
              className="bg-amber-400 hover:bg-amber-500 text-sky-950 font-bold px-3.5 py-1.5 rounded-md text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ New IT Ticket</span>
            </button>

            {/* Login Modal Button */}
            <button
              onClick={onOpenLoginModal}
              className="bg-sky-900 hover:bg-sky-800 text-amber-300 font-bold px-3 py-1.5 rounded-md text-xs border border-sky-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login Portal & Credentials</span>
            </button>

            {/* Quick Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="bg-sky-900 hover:bg-sky-800 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 border border-sky-800 transition-all cursor-pointer"
                title="Click to switch role"
              >
                {getRoleIcon(role)}
                <span className="capitalize hidden md:inline font-bold">{user?.full_name}</span>
                <span className="text-[10px] bg-sky-900 text-sky-200 px-1.5 py-0.5 rounded uppercase font-mono">{role}</span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl py-2 text-slate-800 border border-slate-200 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <p className="text-[11px] font-bold text-slate-500 uppercase">Quick Role Switch</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {demoUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-sky-50 transition-colors ${
                          user?.id === u.id ? 'bg-sky-100 font-bold text-sky-900' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-semibold leading-tight">{u.full_name}</p>
                            <p className="text-[10px] text-slate-500 capitalize">{u.role} &bull; {u.department_name}</p>
                          </div>
                        </div>
                        {user?.id === u.id && <Check className="w-4 h-4 text-sky-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-sky-100 hover:text-white rounded-full hover:bg-sky-800 transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl py-2 text-slate-800 border border-slate-200 z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h4 className="font-bold text-xs uppercase text-slate-700">Notifications</h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-sky-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-500">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                            !n.is_read ? 'bg-sky-50/70 border-l-3 border-sky-600' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{formatDate(n.created_at)}</span>
                          </div>
                          <p className="mt-1 text-slate-600 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 text-sky-200 hover:text-white hover:bg-sky-800 rounded-lg transition-colors cursor-pointer"
              title="Logout / Reset"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
