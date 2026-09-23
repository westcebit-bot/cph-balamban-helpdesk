import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketContext';
import type { UserRole } from '../../types';
import { Button } from '../ui/Button';
import { User, Lock, Eye, EyeOff, CheckCircle2, UserPlus, LogIn, Building, ShieldCheck } from 'lucide-react';
import cphLogo from '../../assets/cph_logo.png';

export const LoginPage: React.FC = () => {
  const { loginWithUsername, registerAccount, isLoading } = useAuth();
  const { departments } = useTickets();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regDepartmentId, setRegDepartmentId] = useState(departments[0]?.id || '');
  const [regRole, setRegRole] = useState<UserRole>('employee');
  const [regEmployeeId, setRegEmployeeId] = useState('');

  // Alerts
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginUsername.trim() || !loginPassword) {
      setErrorMessage('Please enter your username and password.');
      return;
    }

    const res = await loginWithUsername(loginUsername, loginPassword);
    if (res.success) {
      setSuccessMessage('Authenticating...');
    } else {
      setErrorMessage(res.message || 'Invalid username or password.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regFullName.trim() || !regUsername.trim() || !regPassword || !regDepartmentId) {
      setErrorMessage('Please fill out all required fields, including Department.');
      return;
    }

    const res = await registerAccount({
      full_name: regFullName,
      username: regUsername,
      password: regPassword,
      department_id: regDepartmentId,
      role: regRole,
      employee_id: regEmployeeId,
    });

    if (res.success) {
      setSuccessMessage('Account registered successfully! Logging in...');
    } else {
      setErrorMessage(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Graphic Accent */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Official Centered CPH Balamban Logo Header Wrapper */}
        <div className="flex flex-col items-center justify-center text-center p-6 bg-sky-950 text-white border-b border-sky-900">
          <img
            src={cphLogo}
            alt="Cebu Provincial Hospital – Balamban Seal"
            className="w-24 h-24 object-contain mb-3 drop-shadow-md border-4 border-amber-400 rounded-full bg-white p-1"
          />
          <h2 className="text-lg font-extrabold uppercase tracking-wide text-white">
            CEBU PROVINCIAL HOSPITAL – BALAMBAN
          </h2>
          <p className="text-xs text-sky-200 mt-1 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> IT Helpdesk & ITSM Portal
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-3 text-xs font-bold text-center cursor-pointer transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-sky-600 text-sky-900 bg-white shadow-2xs font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In (Log In)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-3 text-xs font-bold text-center cursor-pointer transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-sky-600 text-sky-900 bg-white shadow-2xs font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Create Account
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Alerts */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs font-bold">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 font-medium"
                    placeholder="Enter your username (e.g. admin or juan.delacruz)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 font-medium"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full h-11 text-xs font-bold shadow-md bg-sky-800 hover:bg-sky-900" isLoading={isLoading}>
                Sign In to Hospital Portal
              </Button>
            </form>
          )}

          {/* Registration Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name (First & Last Name) *</label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 font-medium"
                  placeholder="e.g. Dr. Maria Santos or Nurse Juan dela Cruz"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 font-medium"
                    placeholder="e.g. maria.santos"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 font-medium"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    title={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-sky-700" /> Hospital Department (Required) *
                </label>
                <select
                  value={regDepartmentId}
                  onChange={(e) => setRegDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 bg-white font-medium"
                  required
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Position / Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 bg-white font-medium"
                  >
                    <option value="employee">Hospital Employee</option>
                    <option value="supervisor">Department Supervisor</option>
                    <option value="technician">IT Technician</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID (Optional)</label>
                  <input
                    type="text"
                    value={regEmployeeId}
                    onChange={(e) => setRegEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 font-medium"
                    placeholder="e.g. CPH-EMP-501"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full h-11 text-xs font-bold shadow-md bg-sky-800 hover:bg-sky-900" isLoading={isLoading}>
                Register & Sign In
              </Button>
            </form>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-[11px] text-slate-500 text-center">
          Province of Cebu &bull; CPH-Balamban IT Department &bull; RA 10173 Protected
        </div>
      </div>
    </div>
  );
};
