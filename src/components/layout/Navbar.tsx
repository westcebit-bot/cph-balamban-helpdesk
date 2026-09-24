import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Bell, 
  LogOut, 
  CheckCheck,
  LogIn
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface NavbarProps {
  onOpenNewTicket: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewTicket, onOpenLoginModal }) => {
  const { user, role, logout } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const userNotifications = notifications.filter((n) => {
    if (role === 'admin' || role === 'technician') return true;
    if (n.user_id && user?.id && n.user_id === user.id) return true;
    if (!n.user_id) return true;
    return false;
  });

  const displayUnreadCount = userNotifications.filter((n) => !n.is_read).length;
  const [showNotifs, setShowNotifs] = useState(false);

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'admin':
        return <span className="bg-purple-900 text-purple-200 border border-purple-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">System Admin</span>;
      case 'technician':
        return <span className="bg-amber-900 text-amber-200 border border-amber-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">IT Technician</span>;
      case 'supervisor':
        return <span className="bg-sky-900 text-sky-200 border border-sky-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Supervisor</span>;
      default:
        return <span className="bg-emerald-900 text-emerald-200 border border-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Employee</span>;
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

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenNewTicket}
              className="bg-amber-400 hover:bg-amber-500 text-sky-950 font-bold px-3.5 py-1.5 rounded-md text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ New IT Ticket</span>
            </button>

            {/* Login Portal Button (Only visible when user is NOT logged in) */}
            {!user && (
              <button
                onClick={onOpenLoginModal}
                className="bg-sky-900 hover:bg-sky-800 text-amber-300 font-bold px-3 py-1.5 rounded-md text-xs border border-sky-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login Portal</span>
              </button>
            )}

            {/* Logged in User Profile Info */}
            {user && (
              <div className="flex items-center space-x-2 bg-sky-900/80 px-3 py-1 rounded-md border border-sky-800">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-sky-500" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-xs border border-sky-500">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-white block leading-none">{user.full_name}</span>
                  <span className="text-[10px] text-sky-300 font-medium block mt-0.5">{user.department_name}</span>
                </div>
                {getRoleBadge(role)}
              </div>
            )}

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-sky-100 hover:text-white rounded-full hover:bg-sky-800 transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {displayUnreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                    {displayUnreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl py-2 text-slate-800 border border-slate-200 z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h4 className="font-bold text-xs uppercase text-slate-700">Notifications</h4>
                    {displayUnreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-sky-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {userNotifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-500">No notifications</p>
                    ) : (
                      userNotifications.map((n) => (
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
              title="Logout / Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
