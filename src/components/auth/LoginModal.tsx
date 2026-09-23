import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Shield, Key, Mail, Lock, CheckCircle2 } from 'lucide-react';

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
      setSuccessMessage(`Authenticated successfully as ${targetUser.full_name} (${targetUser.role.toUpperCase()})`);
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
        setErrorMessage('User authentication failed. Please verify your email and password.');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CPH-Balamban IT System Login Portal" maxWidth="md">
      <div className="space-y-6 text-slate-800">
        {/* Hospital Branding Header */}
        <div className="bg-sky-950 text-white p-4 rounded-lg flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-sky-950 font-bold flex items-center justify-center text-sm shadow-xs">
              CPH
            </div>
            <div>
              <h4 className="font-bold text-sm">Cebu Provincial Hospital – Balamban</h4>
              <p className="text-xs text-sky-200">IT Helpdesk & ITSM Authentication</p>
            </div>
          </div>
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

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-sky-500"
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
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full h-10 text-xs font-bold" isLoading={isLoading}>
            Sign In to IT Helpdesk Portal
          </Button>
        </form>

        {/* System Admin Credential Reference */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 uppercase text-[11px]">
            <Shield className="w-3.5 h-3.5 text-sky-700" /> System Administrator Account Credentials
          </div>
          <p className="text-[11px] text-slate-600 font-mono">
            <strong>Email:</strong> admin.reyes@cphbalamban.gov.ph
          </p>
          <p className="text-[11px] text-slate-600 font-mono">
            <strong>Password:</strong> admin123
          </p>
        </div>
      </div>
    </Modal>
  );
};
