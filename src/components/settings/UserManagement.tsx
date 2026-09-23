import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Users, UserCheck, UserX, Trash2, Search } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { usersList, toggleUserStatus, deleteUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  const handleDelete = (userId: string, fullName: string) => {
    if (window.confirm(`Are you sure you want to delete account "${fullName}" permanently?`)) {
      deleteUser(userId);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        u.full_name.toLowerCase().includes(q) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.department_name && u.department_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <Card className="shadow-md border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-slate-800 text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-700" /> User Accounts & Staff Management Module
          </CardTitle>
          <p className="text-xs text-slate-500">
            Manage hospital employee accounts, IT technician permissions, active status, and department assignments
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by full name, username, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800"
            >
              <option value="">All User Roles</option>
              <option value="admin">System Admin</option>
              <option value="technician">IT Technician</option>
              <option value="supervisor">Department Supervisor</option>
              <option value="employee">Hospital Employee</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">User & Username</th>
                <th className="p-3">Department & Location</th>
                <th className="p-3">Role / Position</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <p className="font-bold text-slate-900">{u.full_name}</p>
                    <p className="text-[11px] text-sky-800 font-mono">@{u.username || 'user'}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-slate-800">{u.department_name}</p>
                    <p className="text-[10px] text-slate-500">{u.location || 'Main Hospital'}</p>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
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
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Button
                      size="sm"
                      variant={u.is_active ? 'secondary' : 'success'}
                      onClick={() => toggleUserStatus(u.id)}
                    >
                      {u.is_active ? (
                        <>
                          <UserX className="w-3.5 h-3.5 mr-1 text-red-600" /> Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5 mr-1" /> Activate
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(u.id, u.full_name)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
