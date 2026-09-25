// Vercel Serverless Function for Same-Domain First-Party Ticket Synchronization

let memoryTicketsStore = [];
let lastUpdated = Date.now();

export default function handler(req, res) {
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

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (body && Array.isArray(body.tickets)) {
        memoryTicketsStore = body.tickets;
        lastUpdated = Date.now();
        return res.status(200).json({ success: true, count: memoryTicketsStore.length, updated_at: lastUpdated });
      }
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
  }

  // GET Request
  return res.status(200).json({ tickets: memoryTicketsStore, updated_at: lastUpdated });
}
