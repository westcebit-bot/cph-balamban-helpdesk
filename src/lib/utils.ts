import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TicketPriority, TicketStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDateShort(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getStatusBadgeClass(status: TicketStatus): string {
  switch (status) {
    case 'NEW':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'OPEN':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'ASSIGNED':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'IN PROGRESS':
      return 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse';
    case 'ON HOLD':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'RESOLVED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'CLOSED':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getPriorityBadgeClass(priority: TicketPriority): string {
  switch (priority) {
    case 'Critical':
      return 'bg-red-600 text-white font-bold animate-pulse shadow-sm';
    case 'High':
      return 'bg-orange-500 text-white font-medium';
    case 'Medium':
      return 'bg-amber-500 text-white';
    case 'Low':
      return 'bg-emerald-600 text-white';
    default:
      return 'bg-slate-500 text-white';
  }
}

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
