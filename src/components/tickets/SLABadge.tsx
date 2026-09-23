import React from 'react';
import { Ticket } from '../../types';
import { calculateSLAStatus, formatDuration } from '../../lib/sla';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SLABadge: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const sla = calculateSLAStatus(ticket);

  if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
    const isBreached = sla.is_resolution_breached;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
        isBreached 
          ? 'bg-red-50 text-red-700 border-red-200' 
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }`}>
        <CheckCircle2 className="w-3 h-3" />
        {isBreached ? 'Resolved (SLA Breached)' : 'Resolved (SLA Met)'}
      </span>
    );
  }

  const isBreached = sla.is_resolution_breached || sla.is_response_breached;
  const isApproaching = !isBreached && sla.resolution_remaining_minutes < 60;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
      isBreached
        ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
        : isApproaching
        ? 'bg-amber-100 text-amber-900 border-amber-300'
        : 'bg-sky-50 text-sky-800 border-sky-200'
    }`}>
      {isBreached ? (
        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
      )}
      <span>
        {isBreached
          ? `SLA BREACHED (${formatDuration(sla.resolution_remaining_minutes)})`
          : `SLA: ${formatDuration(sla.resolution_remaining_minutes)} remaining`}
      </span>
    </div>
  );
};
