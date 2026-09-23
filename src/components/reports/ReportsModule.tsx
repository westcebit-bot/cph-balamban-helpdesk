import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { calculateSLAStatus } from '../../lib/sla';
import { exportToCSV, formatDateShort } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { FileText, Printer, Download, Filter, Building, Calendar, Wrench, ShieldCheck } from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { tickets, departments, categories } = useTickets();

  const [reportType, setReportType] = useState<string>('daily');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  const filteredTickets = tickets.filter((t) => {
    if (departmentFilter && t.department_id !== departmentFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvData = filteredTickets.map((t) => ({
      'Ticket Number': t.ticket_number,
      'Title': t.title,
      'Requester': t.requester_name,
      'Department': t.department_name,
      'Category': t.category_name,
      'Priority': t.priority,
      'Status': t.status,
      'Device Type': t.device_type,
      'Asset Tag': t.asset_tag || 'N/A',
      'Assigned Technician': t.assigned_technician_name || 'Unassigned',
      'Created At': formatDateShort(t.created_at),
      'Resolved At': t.resolved_at ? formatDateShort(t.resolved_at) : 'N/A',
    }));
    exportToCSV(`CPH_Balamban_IT_Report_${reportType}`, csvData);
  };

  return (
    <div className="space-y-6">
      {/* Control Card (hidden during printing) */}
      <Card className="no-print shadow-md border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-slate-800 text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-700" /> Official IT Reports & Analytics Generator
            </CardTitle>
            <p className="text-xs text-slate-500">
              Generate official ITSM performance and incident summary reports for Cebu Provincial Hospital – Balamban
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-1" /> Print Report
            </Button>
            <Button onClick={handleExportCSV} variant="primary" size="sm">
              <Download className="w-4 h-4 mr-1" /> Export CSV
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Report Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-sky-500"
            >
              <option value="daily">1. Daily IT Ticket Summary Report</option>
              <option value="weekly">2. Weekly IT Ticket Performance Report</option>
              <option value="monthly">3. Monthly IT Incident Analysis</option>
              <option value="quarterly">4. Quarterly IT Support Review</option>
              <option value="annual">5. Annual IT Helpdesk Operations Report</option>
              <option value="department">6. Tickets Breakdown by Department</option>
              <option value="category">7. Tickets Breakdown by Category</option>
              <option value="priority">8. Tickets Breakdown by Priority</option>
              <option value="performance">9. IT Staff Performance Report</option>
              <option value="sla">10. SLA Compliance & Response Rate Report</option>
              <option value="pending">11. Unresolved & Pending Tickets Report</option>
              <option value="assets">12. IT Equipment Incident History</option>
            </select>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Filter by Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Filter by Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800"
              >
                <option value="">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Official Report Document Body (Printable) */}
      <Card className="shadow-lg border-slate-300 bg-white p-8">
        {/* Official Header */}
        <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
          <div className="w-12 h-12 bg-sky-950 text-white rounded-full flex items-center justify-center font-black mx-auto mb-2 text-sm border-2 border-amber-400">
            CPH
          </div>
          <h2 className="text-base font-black text-slate-900 tracking-wider uppercase">
            CEBU PROVINCIAL HOSPITAL – BALAMBAN
          </h2>
          <h3 className="text-xs font-bold text-sky-900 tracking-wide uppercase">
            IT DEPARTMENT - IT HELPDESK TICKETING SYSTEM
          </h3>
          <p className="text-[11px] text-slate-500 font-semibold mt-1 uppercase">
            OFFICIAL REPORT: {reportType.toUpperCase()} INCIDENT & SERVICE REQUEST AUDIT
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Generated Date: {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Report Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6 text-xs text-center border-b border-slate-200 pb-4">
          <div className="bg-slate-50 p-2 rounded">
            <span className="text-slate-500 font-bold block uppercase text-[9px]">Total Incidents</span>
            <span className="text-lg font-black text-slate-900">{filteredTickets.length}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded">
            <span className="text-slate-500 font-bold block uppercase text-[9px]">Resolved</span>
            <span className="text-lg font-black text-emerald-700">
              {filteredTickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length}
            </span>
          </div>
          <div className="bg-slate-50 p-2 rounded">
            <span className="text-slate-500 font-bold block uppercase text-[9px]">Pending</span>
            <span className="text-lg font-black text-amber-700">
              {filteredTickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length}
            </span>
          </div>
          <div className="bg-slate-50 p-2 rounded">
            <span className="text-slate-500 font-bold block uppercase text-[9px]">Critical Incidents</span>
            <span className="text-lg font-black text-red-700">
              {filteredTickets.filter((t) => t.priority === 'Critical').length}
            </span>
          </div>
        </div>

        {/* Detailed Report Data Table */}
        <table className="w-full text-left text-xs border border-slate-300">
          <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-2 border-r border-slate-300">Ticket #</th>
              <th className="p-2 border-r border-slate-300">Issue Title</th>
              <th className="p-2 border-r border-slate-300">Requester & Dept</th>
              <th className="p-2 border-r border-slate-300">Category</th>
              <th className="p-2 border-r border-slate-300">Priority</th>
              <th className="p-2 border-r border-slate-300">Status</th>
              <th className="p-2">Assigned Staff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredTickets.map((t) => (
              <tr key={t.id}>
                <td className="p-2 font-mono font-bold text-sky-900 border-r border-slate-200">{t.ticket_number}</td>
                <td className="p-2 font-semibold text-slate-800 border-r border-slate-200">{t.title}</td>
                <td className="p-2 border-r border-slate-200">
                  {t.requester_name} ({t.department_name})
                </td>
                <td className="p-2 border-r border-slate-200">{t.category_name}</td>
                <td className="p-2 font-bold border-r border-slate-200">{t.priority}</td>
                <td className="p-2 border-r border-slate-200 font-bold">{t.status}</td>
                <td className="p-2">{t.assigned_technician_name || 'Unassigned'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures Footer */}
        <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
          <div>
            <p className="text-slate-500">Prepared by:</p>
            <div className="mt-8 border-b border-slate-400 w-48"></div>
            <p className="font-bold text-slate-900 mt-1">Engr. Antonio Reyes</p>
            <p className="text-[10px] text-slate-500">System Administrator / IT Lead</p>
          </div>

          <div>
            <p className="text-slate-500">Approved by:</p>
            <div className="mt-8 border-b border-slate-400 w-48"></div>
            <p className="font-bold text-slate-900 mt-1">Dr. Maria Santos</p>
            <p className="text-[10px] text-slate-500">Chief of Hospital / Administrator</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
