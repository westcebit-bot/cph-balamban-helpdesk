// High-reliability first-party cloud sync relay for cross-browser synchronization

const API_SYNC_URL = '/api/tickets';

export const pushCloudKVTickets = async (tickets: any[]) => {
  try {
    await fetch(API_SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickets, updated_at: Date.now() })
    });
  } catch (err) {
    console.warn('[First-Party Ticket Sync Push Error]:', err);
  }
};

export const fetchCloudKVTickets = async (): Promise<any[] | null> => {
  try {
    const res = await fetch(API_SYNC_URL);
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.tickets)) {
        return json.tickets;
      }
    }
  } catch (err) {
    console.warn('[First-Party Ticket Sync Fetch Error]:', err);
  }
  return null;
};
