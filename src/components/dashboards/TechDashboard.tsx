import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { TicketList } from '../tickets/TicketList';
import { Wrench, CheckCircle2, AlertTriangle, Clock, UserCheck, Inbox } from 'lucide-react';

export const TechDashboard: React.FC = () => {
  const { user } = useAuth();
  const { tickets, assignTicket, updateTicketStatus } = useTickets();

  const [techStatus, setTechStatus] = useState<'Available' | 'Busy' | 'Unavailable'>('Available');

  const myAssigned = tickets.filter(
    (t) => t.assigned_technician_id === user?.id && t.status !== 'RESOLVED' && t.status !== 'CLOSED'
  );
  const unassigned = tickets.filter(
    (t) => !t.assigned_technician_id && t.status !== 'RESOLVED' && t.status !== 'CLOSED'
  );
  const inProgress = myAssigned.filter((t) => t.status === 'IN PROGRESS');
  const onHold = myAssigned.filter((t) => t.status === 'ON HOLD');

  return (
    <div className="space-y-6">
      {/* Technician Banner */}
      <div className="bg-sky-900 text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-amber-400 text-sky-950 font-black flex items-center justify-center text-lg shadow-md border-2 border-amber-300">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Technician Workspace & Helpdesk Queue</h2>
            <p className="text-xs text-sky-200">
              Welcome back, <strong>{user?.full_name}</strong> &bull; IT Helpdesk Technician
            </p>
          </div>
        </div>

        {/* Technician Availability Toggle */}
        <div className="flex items-center gap-2 bg-sky-950 px-4 py-2 rounded-lg border border-sky-800">
          <span className="text-xs font-bold text-sky-200 uppercase mr-2">Availability:</span>
          {(['Available', 'Busy', 'Unavailable'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setTechStatus(s)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                techStatus === s
                  ? s === 'Available'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : s === 'Busy'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-red-500 text-white shadow-xs'
                  : 'bg-sky-900 text-sky-300 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tech Workload KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-indigo-600">
          <span className="text-[10px] font-bold text-slate-400 uppercase">My Assigned Active</span>
          <p className="text-2xl font-extrabold text-indigo-900 mt-1">{myAssigned.length}</p>
          <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">In your queue</span>
        </Card>

        <Card className="p-4 border-l-4 border-amber-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Work In Progress</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{inProgress.length}</p>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">Currently troubleshooting</span>
        </Card>

        <Card className="p-4 border-l-4 border-purple-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">On Hold</span>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">{onHold.length}</p>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">Awaiting parts/vendor</span>
        </Card>

        <Card className="p-4 border-l-4 border-sky-600">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Unassigned Queue</span>
          <p className="text-2xl font-extrabold text-sky-700 mt-1">{unassigned.length}</p>
          <span className="text-[10px] text-sky-600 font-semibold mt-1 block">Ready for intake</span>
        </Card>
      </div>

      {/* Quick Unassigned Intake Section */}
      {unassigned.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="bg-amber-100/50 py-3">
            <CardTitle className="text-amber-950 text-sm font-bold flex items-center gap-2">
              <Inbox className="w-4 h-4 text-amber-700" /> Unassigned IT Tickets ({unassigned.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unassigned.map((t) => (
                <div key={t.id} className="bg-white p-3.5 rounded-lg border border-slate-200 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-sky-900">{t.ticket_number}</span>
                    <h5 className="font-bold text-xs text-slate-900 mt-0.5 line-clamp-1">{t.title}</h5>
                    <p className="text-[10px] text-slate-500">{t.department_name} &bull; {t.priority} Priority</p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => user?.id && assignTicket(t.id, user.id)}
                  >
                    Accept Ticket
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technician Ticket List Workspace */}
      <TicketList
        initialFilter={{ assignedToMe: true }}
        titleOverride="My Assigned Tickets Workspace"
      />
    </div>
  );
};
