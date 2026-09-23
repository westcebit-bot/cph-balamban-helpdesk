import React from 'react';
import { useTickets } from '../../context/TicketContext';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { ShieldAlert, Clock, User, Activity } from 'lucide-react';

export const AuditLogsList: React.FC = () => {
  const { auditLogs } = useTickets();

  return (
    <Card className="shadow-md border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-200">
        <CardTitle className="text-slate-800 text-lg font-bold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" /> System Immutable Audit Trail
        </CardTitle>
        <p className="text-xs text-slate-500">
          Security audit logs recording user authentication, ticket modifications, status overrides, and administrative actions
        </p>
      </CardHeader>

      <CardContent className="p-4">
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action Performed</th>
                <th className="p-3">Target Table</th>
                <th className="p-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{formatDate(log.created_at)}</td>
                  <td className="p-3 font-bold text-slate-800 whitespace-nowrap">{log.user_name || 'System User'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-600">{log.target_table}</td>
                  <td className="p-3 text-slate-700 max-w-md truncate font-mono text-[11px]">
                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
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
