import React from 'react';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { TicketList } from '../tickets/TicketList';
import { PlusCircle, Ticket as TicketIcon, CheckCircle2, Clock } from 'lucide-react';

export const EmployeeDashboard: React.FC<{ onOpenNewTicket: () => void }> = ({ onOpenNewTicket }) => {
  const { user } = useAuth();
  const { tickets } = useTickets();

  const myTickets = tickets.filter(
    (t) =>
      t.requester_id === user?.id ||
      (t.requester_name && user?.full_name && t.requester_name.toLowerCase() === user.full_name.toLowerCase()) ||
      (t.requester_email && user?.email && t.requester_email.toLowerCase() === user.email.toLowerCase())
  );
  const activeCount = myTickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const resolvedCount = myTickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-sky-900 text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Hospital Employee Self-Service Portal</h2>
          <p className="text-xs text-sky-200 mt-1">
            Welcome, <strong>{user?.full_name}</strong> &bull; {user?.department_name}
          </p>
        </div>
        <Button onClick={onOpenNewTicket} variant="primary" className="bg-amber-400 hover:bg-amber-500 text-sky-950 font-bold">
          <PlusCircle className="w-4 h-4 mr-1.5" /> Submit New IT Request
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-sky-600">
          <span className="text-[10px] font-bold text-slate-400 uppercase">My Active Requests</span>
          <p className="text-2xl font-extrabold text-sky-900 mt-1">{activeCount}</p>
          <span className="text-[10px] text-sky-600 font-semibold mt-1 block">In progress by IT</span>
        </Card>

        <Card className="p-4 border-l-4 border-emerald-600">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Resolved Issues</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{resolvedCount}</p>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Successfully closed</span>
        </Card>

        <Card className="p-4 border-l-4 border-purple-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Tickets Submitted</span>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{myTickets.length}</p>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">Lifetime requests</span>
        </Card>
      </div>

      {/* My Tickets List */}
      <TicketList titleOverride="My IT Tickets Tracker" />
    </div>
  );
};
