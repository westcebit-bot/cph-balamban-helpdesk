import React, { useState } from 'react';
import { Ticket, TicketStatus } from '../../types';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { getStatusBadgeClass, getPriorityBadgeClass, formatDate } from '../../lib/utils';
import { SLABadge } from './SLABadge';
import { TicketTimeline } from './TicketTimeline';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { 
  User, 
  MapPin, 
  Phone, 
  Tag, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Wrench, 
  RotateCcw, 
  ShieldCheck, 
  Send,
  Trash2
} from 'lucide-react';

interface TicketDetailsProps {
  ticket: Ticket;
  onClose: () => void;
}

export const TicketDetails: React.FC<TicketDetailsProps> = ({ ticket, onClose }) => {
  const { user, role } = useAuth();
  const { updateTicketStatus, assignTicket, reopenTicket, addComment, getTicketComments, deleteTicket } = useTickets();

  const [activeTab, setActiveTab] = useState<'details' | 'timeline'>('details');
  const [newCommentText, setNewCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [modalAction, setModalAction] = useState<'hold' | 'resolve' | 'reopen' | null>(null);
  const [modalInput, setModalInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const comments = getTicketComments(ticket.id);

  const canManageStatus = role === 'admin' || role === 'technician';
  const isAssignedToMe = ticket.assigned_technician_id === user?.id;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    await addComment(ticket.id, newCommentText, isInternalComment);
    setNewCommentText('');
  };

  const handleStatusChange = async (status: TicketStatus, reason?: string) => {
    setIsProcessing(true);
    await updateTicketStatus(ticket.id, status, reason);
    setIsProcessing(false);
    setModalAction(null);
    setModalInput('');
  };

  const handleSelfAssign = async () => {
    if (user?.id) {
      await assignTicket(ticket.id, user.id);
    }
  };

  const handleReopenSubmit = async () => {
    if (!modalInput.trim()) return;
    setIsProcessing(true);
    await reopenTicket(ticket.id, modalInput);
    setIsProcessing(false);
    setModalAction(null);
    setModalInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-slate-900 text-white p-4 -m-6 mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm font-bold text-amber-300 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
              {ticket.ticket_number}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${getStatusBadgeClass(ticket.status)}`}>
              {ticket.status}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${getPriorityBadgeClass(ticket.priority)}`}>
              {ticket.priority} Priority
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-2">{ticket.title}</h2>
        </div>
        <SLABadge ticket={ticket} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-2 text-xs font-bold cursor-pointer transition-colors border-b-2 ${
            activeTab === 'details' ? 'border-sky-600 text-sky-800' : 'border-transparent text-slate-500'
          }`}
        >
          Ticket Overview & Controls
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-2 text-xs font-bold cursor-pointer transition-colors border-b-2 ${
            activeTab === 'timeline' ? 'border-sky-600 text-sky-800' : 'border-transparent text-slate-500'
          }`}
        >
          Timeline & Notes ({comments.length})
        </button>
      </div>

      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Action Toolbar for Technicians */}
          {canManageStatus && (
            <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-700" />
                <span className="text-xs font-bold text-sky-950">Technician Actions:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!ticket.assigned_technician_id && (
                  <Button size="sm" variant="primary" onClick={handleSelfAssign}>
                    Accept & Assign to Me
                  </Button>
                )}

                {ticket.status === 'ASSIGNED' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleStatusChange('IN PROGRESS')}
                  >
                    Start Troubleshooting Work
                  </Button>
                )}

                {ticket.status === 'IN PROGRESS' && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setModalAction('hold')}
                    >
                      Place On Hold
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => setModalAction('resolve')}
                    >
                      Mark as Resolved
                    </Button>
                  </>
                )}

                {ticket.status === 'ON HOLD' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleStatusChange('IN PROGRESS')}
                  >
                    Resume In Progress
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Close or Reopen controls for Employee/Supervisor */}
          {(ticket.requester_id === user?.id || role === 'supervisor' || role === 'admin') && (
            <div className="flex items-center gap-3">
              {ticket.status === 'RESOLVED' && (
                <>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleStatusChange('CLOSED')}
                  >
                    Confirm Resolution & Close Ticket
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setModalAction('reopen')}
                  >
                    Issue Unresolved (Reopen Ticket)
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Superadmin Control Bar */}
          {(role === 'admin' || user?.id === 'usr-superadmin') && (
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-700" />
                <span className="text-xs font-bold text-rose-950">Superadmin Control:</span>
              </div>
              <Button
                size="sm"
                variant="danger"
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to permanently delete ticket ${ticket.ticket_number}?`)) {
                    await deleteTicket(ticket.id);
                    onClose();
                  }
                }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Force Delete Ticket
              </Button>
            </div>
          )}

          {/* Ticket Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Requester</span>
              <p className="font-bold text-slate-800">{ticket.requester_name}</p>
              <p className="text-slate-500">{ticket.department_name} &bull; {ticket.unit || 'General'}</p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Contact Info</span>
              <p className="font-bold text-slate-800">{ticket.contact_number}</p>
              <p className="text-slate-500">{ticket.requester_email || 'No email registered'}</p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Issue Category</span>
              <p className="font-bold text-slate-800">{ticket.category_name}</p>
              <p className="text-slate-500">{ticket.subcategory_name || 'General Subcategory'}</p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Device / Service</span>
              <p className="font-bold text-slate-800">{ticket.device_type}</p>
              <p className="text-slate-500">{ticket.location}</p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">IT Asset Tag</span>
              <p className="font-bold text-sky-800 font-mono">{ticket.asset_tag || 'None Specified'}</p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Assigned Technician</span>
              <p className="font-bold text-slate-800">{ticket.assigned_technician_name || 'Unassigned Queue'}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Issue Description</h4>
            <div className="bg-white p-4 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <TicketTimeline ticket={ticket} comments={comments} />

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Add Comment or Troubleshooting Note</h4>
            <textarea
              rows={3}
              required
              placeholder="Write a comment, clarification, or troubleshooting action taken..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
            ></textarea>

            <div className="flex items-center justify-between mt-3">
              {canManageStatus ? (
                <label className="flex items-center gap-2 text-xs font-medium text-amber-900 bg-amber-100/70 px-2 py-1 rounded">
                  <input
                    type="checkbox"
                    checked={isInternalComment}
                    onChange={(e) => setIsInternalComment(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Internal IT Note (Hidden from employee)</span>
                </label>
              ) : <div />}

              <Button type="submit" variant="primary" size="sm">
                <Send className="w-3.5 h-3.5 mr-1" /> Post Note
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Action Modals */}
      {modalAction === 'hold' && (
        <Modal isOpen={true} onClose={() => setModalAction(null)} title="Place Ticket On Hold">
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">Please state the reason for placing this ticket on hold (e.g. Waiting for replacement parts, vendor escalation, or requester clarification).</p>
            <textarea
              rows={3}
              required
              placeholder="Enter on-hold justification..."
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 text-xs"
            ></textarea>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setModalAction(null)}>Cancel</Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isProcessing}
                onClick={() => handleStatusChange('ON HOLD', modalInput)}
              >
                Confirm On Hold
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {modalAction === 'resolve' && (
        <Modal isOpen={true} onClose={() => setModalAction(null)} title="Resolve Ticket">
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">Provide a summary of the technical resolution and actions taken to resolve the issue.</p>
            <textarea
              rows={3}
              required
              placeholder="Resolution details (e.g. Replaced RJ45 patch cord, re-installed printer driver v4.2, reset iHOMIS account)..."
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 text-xs"
            ></textarea>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setModalAction(null)}>Cancel</Button>
              <Button
                variant="success"
                size="sm"
                isLoading={isProcessing}
                onClick={() => handleStatusChange('RESOLVED', modalInput)}
              >
                Mark Ticket Resolved
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {modalAction === 'reopen' && (
        <Modal isOpen={true} onClose={() => setModalAction(null)} title="Reopen Ticket">
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">Please specify why the reported issue is not fully resolved.</p>
            <textarea
              rows={3}
              required
              placeholder="Explain why the problem persists..."
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 text-xs"
            ></textarea>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setModalAction(null)}>Cancel</Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isProcessing}
                onClick={handleReopenSubmit}
              >
                Reopen Ticket
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
