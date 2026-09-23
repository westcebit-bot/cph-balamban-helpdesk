import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { calculateSLAStatus } from '../../lib/sla';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { TicketList } from '../tickets/TicketList';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { 
  Ticket as TicketIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Activity, 
  ShieldAlert,
  Building,
  Layers
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { tickets, departments, categories } = useTickets();

  // Metrics calculation from real database records
  const total = tickets.length;
  const newCount = tickets.filter((t) => t.status === 'NEW').length;
  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN PROGRESS').length;
  const onHoldCount = tickets.filter((t) => t.status === 'ON HOLD').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;
  const closedCount = tickets.filter((t) => t.status === 'CLOSED').length;
  const criticalCount = tickets.filter((t) => t.priority === 'Critical').length;

  const slaStatuses = tickets.map((t) => calculateSLAStatus(t));
  const overdueCount = slaStatuses.filter((s) => s.is_resolution_breached || s.is_response_breached).length;
  const compliantCount = total - overdueCount;
  const slaRate = total > 0 ? Math.round((compliantCount / total) * 100) : 100;

  // Recharts Chart Data
  const statusChartData = [
    { name: 'NEW', count: newCount, color: '#3b82f6' },
    { name: 'OPEN', count: openCount, color: '#0284c7' },
    { name: 'ASSIGNED', count: tickets.filter((t) => t.status === 'ASSIGNED').length, color: '#6366f1' },
    { name: 'IN PROGRESS', count: inProgressCount, color: '#f59e0b' },
    { name: 'ON HOLD', count: onHoldCount, color: '#a855f7' },
    { name: 'RESOLVED', count: resolvedCount, color: '#10b981' },
    { name: 'CLOSED', count: closedCount, color: '#64748b' },
  ];

  const priorityChartData = [
    { name: 'Critical', count: criticalCount, fill: '#dc2626' },
    { name: 'High', count: tickets.filter((t) => t.priority === 'High').length, fill: '#f97316' },
    { name: 'Medium', count: tickets.filter((t) => t.priority === 'Medium').length, fill: '#f59e0b' },
    { name: 'Low', count: tickets.filter((t) => t.priority === 'Low').length, fill: '#10b981' },
  ];

  const deptChartData = departments.map((d) => ({
    name: d.code,
    fullName: d.name,
    count: tickets.filter((t) => t.department_id === d.id).length,
  }));

  const techWorkloadData = [
    { name: 'Mark Tan', active: tickets.filter((t) => t.assigned_technician_id === 'usr-tech-1' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length },
    { name: 'Sarah Lim', active: tickets.filter((t) => t.assigned_technician_id === 'usr-tech-2' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length },
    { name: 'Engr. Antonio Reyes', active: tickets.filter((t) => t.assigned_technician_id === 'usr-admin-1' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-sky-950 text-white p-6 rounded-xl shadow-lg border border-sky-900">
        <div>
          <h2 className="text-xl font-bold tracking-tight">IT Department Executive Dashboard</h2>
          <p className="text-xs text-sky-300 mt-1">
            Real-time workload, SLA metrics, and incident monitoring for Cebu Provincial Hospital – Balamban
          </p>
        </div>
        <div className="bg-sky-900/80 px-4 py-2 rounded-lg border border-sky-800 text-right">
          <span className="text-[10px] text-sky-300 font-bold uppercase block">Overall SLA Compliance</span>
          <span className={`text-2xl font-black ${slaRate >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {slaRate}%
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4 border-l-4 border-sky-600">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Tickets</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{total}</p>
          <span className="text-[10px] text-sky-600 font-semibold mt-1 block">All registered</span>
        </Card>

        <Card className="p-4 border-l-4 border-blue-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">New Submissions</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{newCount}</p>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">Awaiting intake</span>
        </Card>

        <Card className="p-4 border-l-4 border-amber-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">In Progress</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{inProgressCount}</p>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">Active work</span>
        </Card>

        <Card className="p-4 border-l-4 border-purple-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">On Hold</span>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">{onHoldCount}</p>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">Pending parts/vendor</span>
        </Card>

        <Card className="p-4 border-l-4 border-red-600">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Critical / Overdue</span>
          <p className="text-2xl font-extrabold text-red-600 mt-1">{criticalCount + overdueCount}</p>
          <span className="text-[10px] text-red-600 font-semibold mt-1 block">Needs priority</span>
        </Card>

        <Card className="p-4 border-l-4 border-emerald-600">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Resolved</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{resolvedCount + closedCount}</p>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Completed</span>
        </Card>
      </div>

      {/* Visual Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="p-4">
          <CardHeader className="px-0 py-2 border-b border-slate-100 mb-4">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" /> Ticket Status Breakdown
            </CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Tickets by Department */}
        <Card className="p-4">
          <CardHeader className="px-0 py-2 border-b border-slate-100 mb-4">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building className="w-4 h-4 text-sky-600" /> Incident Distribution by Department
            </CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority Breakdown */}
        <Card className="p-4">
          <CardHeader className="px-0 py-2 border-b border-slate-100 mb-4">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Tickets by Priority
            </CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* IT Staff Workload */}
        <Card className="p-4">
          <CardHeader className="px-0 py-2 border-b border-slate-100 mb-4">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" /> Active Technician Workload
            </CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={techWorkloadData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Bar dataKey="active" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Ticket List Integration */}
      <TicketList />
    </div>
  );
};
