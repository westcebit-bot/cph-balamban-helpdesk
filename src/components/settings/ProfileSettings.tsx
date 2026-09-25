import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { User, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { user, updateUserProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  // Keep state initialized for active user profile
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user?.id]);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result;
        if (typeof dataUrl === 'string') {
          setAvatarUrl(dataUrl);
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 250;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.85);
              setAvatarUrl(compressed);
            }
          };
          img.src = dataUrl;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      updateUserProfile(user.id, {
        full_name: fullName,
        phone,
        location,
        avatar_url: avatarUrl,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('Password must be at least 4 characters long.');
      return;
    }

    if (user) {
      updateUserProfile(user.id, { password: newPassword });
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* User Header Profile Banner */}
      <div className="bg-sky-950 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-sky-700 text-white font-extrabold flex items-center justify-center text-2xl border-2 border-amber-400 shadow-md">
                {fullName?.charAt(0) || user?.full_name?.charAt(0) || 'U'}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold">{fullName || user?.full_name}</h2>
            <p className="text-xs text-sky-200">
              @{user?.username} &bull; {user?.department_name} ({user?.role?.toUpperCase()})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Update Profile & Avatar */}
        <Card className="shadow-md border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-sky-700" /> My Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {profileSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Profile details updated and saved permanently!
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Profile Avatar / Picture</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border p-2 rounded bg-white text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Contact Phone / Extension</label>
                <input
                  type="text"
                  placeholder="e.g. Loc 105 or 0917-xxx-xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border p-2 rounded bg-white text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Office / Station Location</label>
                <input
                  type="text"
                  placeholder="e.g. Main Hospital Building 1F Room 102"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border p-2 rounded bg-white text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Save Profile Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Module 2: Change Password */}
        <Card className="shadow-md border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-700" /> Change Security Password
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {passwordSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Password updated successfully!
              </div>
            )}

            {passwordError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-2.5 rounded text-xs font-bold">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border p-2 pr-9 rounded bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border p-2 pr-9 rounded bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border p-2 rounded bg-white text-xs"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
