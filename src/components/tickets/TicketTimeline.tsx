import React from 'react';
import { Ticket, TicketComment } from '../../types';
import { formatDate } from '../../lib/utils';
import { Clock, User, ShieldCheck, AlertCircle, Wrench, MessageSquare } from 'lucide-react';

interface TicketTimelineProps {
  ticket: Ticket;
  comments: TicketComment[];
}

export const TicketTimeline: React.FC<TicketTimelineProps> = ({ ticket, comments }) => {
  return (
    <div className="space-y-6">
      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
        <Clock className="w-4 h-4 text-sky-700" /> Ticket Audit & Troubleshooting Timeline
      </h4>

      <div className="relative border-l-2 border-sky-200 ml-3 pl-6 space-y-6">
        {/* Ticket Created */}
        <div className="relative">
          <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs shadow-xs">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800">Ticket Submitted</span>
              <span className="text-[10px] text-slate-400 font-mono">{formatDate(ticket.created_at)}</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Submitted by <strong>{ticket.requester_name}</strong> ({ticket.department_name})
            </p>
          </div>
        </div>

        {/* First Responded / Assigned */}
        {ticket.first_responded_at && (
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shadow-xs">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">Technician Assigned</span>
                <span className="text-[10px] text-slate-400 font-mono">{formatDate(ticket.first_responded_at)}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Assigned to IT Staff: <strong>{ticket.assigned_technician_name || 'IT Technician'}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Comments & Notes */}
        {comments.map((cmt) => (
          <div key={cmt.id} className="relative">
            <div className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs ${
              cmt.is_internal ? 'bg-amber-500 text-white' : 'bg-sky-500 text-white'
            }`}>
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div className={`p-3 rounded-lg border text-xs ${
              cmt.is_internal ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  {cmt.author_name}
                  {cmt.is_internal && (
                    <span className="bg-amber-200 text-amber-900 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                      Internal IT Note
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{formatDate(cmt.created_at)}</span>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{cmt.comment}</p>
            </div>
          </div>
        ))}

        {/* On Hold Reason */}
        {ticket.on_hold_reason && (
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs shadow-xs">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs">
              <span className="font-bold text-purple-950 block">Ticket Placed On Hold</span>
              <p className="text-purple-800 mt-0.5">{ticket.on_hold_reason}</p>
            </div>
          </div>
        )}

        {/* Resolution */}
        {ticket.resolved_at && (
          <div className="relative">
            <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950">Ticket Resolved</span>
                <span className="text-[10px] text-emerald-700 font-mono">{formatDate(ticket.resolved_at)}</span>
              </div>
              <p className="text-emerald-900 font-medium mt-1">Resolution Summary:</p>
              <p className="text-emerald-800 mt-0.5">{ticket.resolution_summary || 'Resolved by IT staff'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
