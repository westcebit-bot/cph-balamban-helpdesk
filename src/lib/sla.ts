import { Ticket, TicketPriority, SLAStatus, SLASetting } from '../types';

export const DEFAULT_SLA_SETTINGS: Record<TicketPriority, SLASetting> = {
  Critical: {
    priority: 'Critical',
    response_target_minutes: 15,
    resolution_target_minutes: 120, // 2 hours
  },
  High: {
    priority: 'High',
    response_target_minutes: 30,
    resolution_target_minutes: 480, // 8 hours
  },
  Medium: {
    priority: 'Medium',
    response_target_minutes: 240, // 4 hours
    resolution_target_minutes: 1440, // 24 hours
  },
  Low: {
    priority: 'Low',
    response_target_minutes: 480, // 8 hours
    resolution_target_minutes: 2880, // 48 hours
  },
};

export function calculateSLAStatus(
  ticket: Ticket,
  customSettings?: Record<TicketPriority, SLASetting>
): SLAStatus {
  const settings = customSettings?.[ticket.priority] || DEFAULT_SLA_SETTINGS[ticket.priority];
  const now = new Date();
  const createdDate = new Date(ticket.created_at);

  // Response Time Calculation
  const respondedDate = ticket.first_responded_at ? new Date(ticket.first_responded_at) : null;
  const responseElapsedMs = respondedDate 
    ? respondedDate.getTime() - createdDate.getTime() 
    : now.getTime() - createdDate.getTime();
  
  const responseElapsedMinutes = Math.max(0, Math.floor(responseElapsedMs / (1000 * 60)));
  const responseRemainingMinutes = settings.response_target_minutes - responseElapsedMinutes;
  
  const isResponseBreached = respondedDate 
    ? responseElapsedMinutes > settings.response_target_minutes
    : responseRemainingMinutes < 0;

  // Resolution Time Calculation
  const resolvedDate = ticket.resolved_at ? new Date(ticket.resolved_at) : null;
  const resolutionElapsedMs = resolvedDate 
    ? resolvedDate.getTime() - createdDate.getTime() 
    : now.getTime() - createdDate.getTime();

  const resolutionElapsedMinutes = Math.max(0, Math.floor(resolutionElapsedMs / (1000 * 60)));
  const resolutionRemainingMinutes = settings.resolution_target_minutes - resolutionElapsedMinutes;

  const isResolutionBreached = resolvedDate
    ? resolutionElapsedMinutes > settings.resolution_target_minutes
    : ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && resolutionRemainingMinutes < 0;

  return {
    response_target_minutes: settings.response_target_minutes,
    resolution_target_minutes: settings.resolution_target_minutes,
    response_elapsed_minutes: responseElapsedMinutes,
    resolution_elapsed_minutes: resolutionElapsedMinutes,
    is_response_breached: isResponseBreached,
    is_resolution_breached: isResolutionBreached,
    response_remaining_minutes: responseRemainingMinutes,
    resolution_remaining_minutes: resolutionRemainingMinutes,
  };
}

export function formatDuration(minutes: number): string {
  if (minutes < 0) {
    return `Overdue by ${formatDuration(Math.abs(minutes))}`;
  }
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (hours < 24) {
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}
