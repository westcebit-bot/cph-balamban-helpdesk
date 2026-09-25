// Vercel Serverless Function for Same-Domain First-Party Ticket Synchronization

let memoryTicketsStore = [];
let lastUpdated = Date.now();

export default async function handler(req, res) {
  // CORS Headers for multi-browser support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
  const rawKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');

  const isConfigured = Boolean(rawUrl) && Boolean(rawKey) && !rawUrl.includes('your-supabase-project');

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (body && Array.isArray(body.tickets)) {
        memoryTicketsStore = body.tickets;
        lastUpdated = Date.now();

        if (isConfigured) {
          try {
            const formatted = body.tickets.map((t) => ({
              id: t.id,
              ticket_number: t.ticket_number,
              title: t.title,
              description: t.description,
              requester_id: t.requester_id,
              requester_name: t.requester_name,
              requester_email: t.requester_email || null,
              department_id: t.department_id,
              department_name: t.department_name,
              unit: t.unit || null,
              contact_number: t.contact_number || null,
              category_id: t.category_id,
              category_name: t.category_name,
              subcategory_id: t.subcategory_id || null,
              subcategory_name: t.subcategory_name || null,
              priority: t.priority,
              status: t.status,
              device_type: t.device_type || null,
              location: t.location || null,
              asset_tag: t.asset_tag || null,
              assigned_technician_id: t.assigned_technician_id || null,
              assigned_technician_name: t.assigned_technician_name || null,
              first_responded_at: t.first_responded_at || null,
              resolved_at: t.resolved_at || null,
              closed_at: t.closed_at || null,
              on_hold_reason: t.on_hold_reason || null,
              resolution_summary: t.resolution_summary || null,
              reopened_count: t.reopened_count || 0,
              created_at: t.created_at,
              updated_at: t.updated_at,
            }));

            await fetch(`${rawUrl}/rest/v1/tickets`, {
              method: 'POST',
              headers: {
                'apikey': rawKey,
                'Authorization': `Bearer ${rawKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
              },
              body: JSON.stringify(formatted)
            });
          } catch (sbErr) {
            console.error('[Vercel Relay Supabase Push Error]:', sbErr);
          }
        }

        return res.status(200).json({ success: true, count: memoryTicketsStore.length, updated_at: lastUpdated });
      }
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
  }

  // GET Request
  if (isConfigured) {
    try {
      const dbRes = await fetch(`${rawUrl}/rest/v1/tickets?select=*&order=created_at.desc`, {
        headers: {
          'apikey': rawKey,
          'Authorization': `Bearer ${rawKey}`
        }
      });
      if (dbRes.ok) {
        const dbTickets = await dbRes.json();
        if (Array.isArray(dbTickets)) {
          memoryTicketsStore = dbTickets;
          lastUpdated = Date.now();
          return res.status(200).json({ tickets: dbTickets, updated_at: lastUpdated });
        }
      }
    } catch (dbErr) {
      console.error('[Vercel Relay Supabase Fetch Error]:', dbErr);
    }
  }

  return res.status(200).json({ tickets: memoryTicketsStore, updated_at: lastUpdated });
}
