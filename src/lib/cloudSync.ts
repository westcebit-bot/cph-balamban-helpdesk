// High-reliability public cloud sync relay for environments without Supabase keys
const RELAY_URL = 'https://api.restful-api.dev/objects/cph_balamban_helpdesk_tickets_v1';

export const pushCloudKVTickets = async (tickets: any[]) => {
  try {
    const payload = {
      name: 'cph_balamban_helpdesk_tickets_v1',
      data: {
        tickets,
        updated_at: Date.now()
      }
    };

    const res = await fetch(RELAY_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      // Object not created yet, create it via POST
      await fetch('https://api.restful-api.dev/objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'cph_balamban_helpdesk_tickets_v1',
          name: 'cph_balamban_helpdesk_tickets_v1',
          data: {
            tickets,
            updated_at: Date.now()
          }
        })
      });
    }
  } catch (err) {
    console.warn('[Cloud KV Sync Push Error]:', err);
  }
};

export const fetchCloudKVTickets = async (): Promise<any[] | null> => {
  try {
    const res = await fetch(RELAY_URL);
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.tickets && Array.isArray(json.data.tickets)) {
        return json.data.tickets;
      }
    }
  } catch (err) {
    console.warn('[Cloud KV Sync Fetch Error]:', err);
  }
  return null;
};
