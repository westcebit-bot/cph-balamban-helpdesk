import React, { useState } from 'react';
import { Ticket, TicketStatus, TicketPriority } from '../../types';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { getStatusBadgeClass, getPriorityBadgeClass, formatDate } from '../../lib/utils';
import { SLABadge } from './SLABadge';
import { TicketDetails } from './TicketDetails';
import { Modal } from '../ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Search, 
  Filter, 
  Eye, 
  Grid, 
  List as ListIcon, 
  Clock, 
  Building, 
  Tag, 
  User 
} from 'lucide-react';

interface TicketListProps {
  initialFilter?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedToMe?: boolean;
    unassignedOnly?: boolean;
  };
  titleOverride?: string;
}

export const TicketList: React.FC<TicketListProps> = ({ initialFilter, titleOverride }) => {
  const { user, role } = useAuth();
  const { tickets, departments, categories } = useTickets();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter?.status || '');
  const [priorityFilter, setPriorityFilter] = useState<string>(initialFilter?.priority || '');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [assignedFilter, setAssignedFilter] = useState<string>(
    initialFilter?.assignedToMe ? user?.id || '' : initialFilter?.unassignedOnly ? 'unassigned' : ''
  );

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Filtering logic
  const filteredTickets = tickets.filter((t) => {
    // Role-based visibility enforcement
    if (role === 'employee' && t.requester_id !== user?.id) {
      return false;
    }
    if (role === 'supervisor' && t.department_id !== user?.department_id && t.requester_id !== user?.id) {
      return false;
    }

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        t.ticket_number.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.requester_name.toLowerCase().includes(q) ||
        t.department_name.toLowerCase().includes(q) ||
        (t.asset_tag && t.asset_tag.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (departmentFilter && t.department_id !== departmentFilter) return false;
    if (categoryFilter && t.category_id !== categoryFilter) return false;
    if (assignedFilter === 'unassigned' && t.assigned_technician_id) return false;
    if (assignedFilter && assignedFilter !== 'unassigned' && t.assigned_technician_id !== assignedFilter) return false;

    return true;
  });

  return (
    <Card className="shadow-md border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-slate-800 text-lg font-bold">
            {titleOverride || (role === 'employee' ? 'My IT Tickets' : role === 'supervisor' ? 'Department IT Tickets' : 'IT Helpdesk Ticket Queue')}
          </CardTitle>
          <p className="text-xs text-slate-500">
            Displaying {filteredTickets.length} of {tickets.length} total hospital tickets
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={viewMode === 'table' ? 'primary' : 'outline'}
            onClick={() => setViewMode('table')}
          >
            <ListIcon className="w-4 h-4 mr-1" /> Table View
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'cards' ? 'primary' : 'outline'}
            onClick={() => setViewMode('cards')}
          >
            <Grid className="w-4 h-4 mr-1" /> Card View
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticket #, title, requester, asset tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="OPEN">OPEN</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="ON HOLD">ON HOLD</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700"
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignment Filter */}
          {(role === 'admin' || role === 'technician') && (
            <div>
              <select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700"
              >
                <option value="">All Assignments</option>
                <option value="unassigned">Unassigned Only</option>
                <option value={user?.id || ''}>Assigned to Me</option>
              </select>
            </div>
          )}
        </div>

        {/* Table View */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Ticket #</th>
                  <th className="p-3">Issue & Description</th>
                  <th className="p-3">Requester & Dept</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">SLA Status</th>
                  <th className="p-3">Assigned Tech</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                      No IT tickets found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-sky-900 whitespace-nowrap">
                        {t.ticket_number}
                      </td>
                      <td className="p-3 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">{t.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">{t.device_type} &bull; {t.location}</p>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <p className="font-medium text-slate-800">{t.requester_name}</p>
                        <p className="text-[10px] text-slate-500">{t.department_name}</p>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityBadgeClass(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadgeClass(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <SLABadge ticket={t} />
                      </td>
                      <td className="p-3 whitespace-nowrap font-medium text-slate-700">
                        {t.assigned_technician_name || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedTicket(t)}
                          className="text-sky-700 hover:text-sky-900 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map((t) => (
              <Card key={t.id} className="hover:shadow-md transition-shadow border-slate-200">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {t.ticket_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadgeClass(t.status)}`}>
                      {t.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">{t.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600">
                    <div>
                      <p className="font-semibold text-slate-800">{t.requester_name}</p>
                      <p className="text-[10px] text-slate-400">{t.department_name}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityBadgeClass(t.priority)}`}>
                      {t.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <SLABadge ticket={t} />
                    <Button size="sm" variant="primary" onClick={() => setSelectedTicket(t)}>
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket Details - ${selectedTicket.ticket_number}`}
          maxWidth="4xl"
        >
          <TicketDetails ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
        </Modal>
      )}
    </Card>
  );
};
