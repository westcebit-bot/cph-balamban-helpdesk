import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Shield, Key, Mail, Lock, CheckCircle2, UserCheck, Wrench, Building2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { demoUsers, switchUser, loginWithEmail, isLoading } = useAuth();

  const [email, setEmail] = useState('admin.reyes@cphbalamban.gov.ph');
  const [password, setPassword] = useState('admin123');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const targetUser = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser) {
      switchUser(targetUser.id);
      setSuccessMessage(`Logged in successfully as ${targetUser.full_name} (${targetUser.role.toUpperCase()})`);
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 1000);
    } else {
      const success = await loginWithEmail(email);
      if (success) {
        setSuccessMessage('Logged in successfully!');
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
        }, 1000);
      } else {
        setErrorMessage('User not found. Please select from registered accounts below.');
      }
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    const u = demoUsers.find((user) => user.id === userId);
    setSuccessMessage(`Logged in as ${u?.full_name} (${u?.role.toUpperCase()})`);
    setTimeout(() => {
      onClose();
      setSuccessMessage('');
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CPH-Balamban IT System Login Portal" maxWidth="2xl">
      <div className="space-y-6 text-slate-800">
        {/* Header Notice */}
        <div className="bg-sky-950 text-white p-4 rounded-lg flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-sky-950 font-bold flex items-center justify-center text-sm">
              CPH
            </div>
            <div>
              <h4 className="font-bold text-sm">Cebu Provincial Hospital – Balamban</h4>
              <p className="text-xs text-sky-200">IT Helpdesk & ITSM Authentication Service</p>
            </div>
          </div>
          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Active DB Connected</span>
        </div>

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs font-bold">
            {errorMessage}
          </div>
        )}

        {/* Form & Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-sky-700" /> Standard User Login
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-sky-500"
                  placeholder="name@cphbalamban.gov.ph"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
              Sign In to IT Portal
            </Button>
          </form>

          {/* Accounts Reference Card */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-sky-700" /> Demo Accounts & Credentials
            </h4>
            <p className="text-[11px] text-slate-500">
              Click any account below for instant evaluation:
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setEmail(u.email);
                    setPassword(u.role === 'admin' ? 'admin123' : 'user123');
                    handleQuickLogin(u.id);
                  }}
                  className="w-full text-left p-2 bg-white rounded border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition-all text-xs flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{u.full_name}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">{u.email}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    u.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : u.role === 'technician'
                      ? 'bg-amber-100 text-amber-800'
                      : u.role === 'supervisor'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
