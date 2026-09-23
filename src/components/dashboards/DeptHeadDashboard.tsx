import React from 'react';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { TicketList } from '../tickets/TicketList';
import { Building2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const DeptHeadDashboard: React.FC = () => {
  const { user } = useAuth();
  const { tickets } = useTickets();

  const deptTickets = tickets.filter((t) => t.department_id === user?.department_id);
  const activeCount = deptTickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const resolvedCount = deptTickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-sky-950 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Department Supervisor Portal</h2>
          <p className="text-xs text-sky-300 mt-1">
            Department: <strong>{user?.department_name}</strong> &bull; Supervisor: {user?.full_name}
          </p>
        </div>
        <div className="bg-sky-900 px-4 py-2 rounded-lg border border-sky-800 text-center">
          <span className="text-[10px] text-sky-300 uppercase font-bold block">Department Incidents</span>
          <span className="text-2xl font-black text-amber-400">{deptTickets.length}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-sky-600">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Department Tickets</span>
          <p className="text-2xl font-extrabold text-sky-900 mt-1">{activeCount}</p>
          <span className="text-[10px] text-sky-600 font-semibold mt-1 block">In progress or intake</span>
        </Card>

        <Card className="p-4 border-l-4 border-emerald-600">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Resolved / Closed</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{resolvedCount}</p>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Completed issues</span>
        </Card>

        <Card className="p-4 border-l-4 border-amber-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Resolution Review</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {deptTickets.filter((t) => t.status === 'RESOLVED').length}
          </p>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">Requires employee sign-off</span>
        </Card>
      </div>

      {/* Department Tickets List */}
      <TicketList titleOverride={`${user?.department_name} IT Support Requests`} />
    </div>
  );
};
