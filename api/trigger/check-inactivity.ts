export default async function handler(req: any, res: any) {
  try {
    const baseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!baseUrl || !serviceKey) {
      res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' });
      return;
    }

    const resp = await fetch(`${baseUrl}/functions/v1/check-inactivity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ trigger: 'manual' })
    });

    const data = await resp.json().catch(() => ({}));
    res.status(resp.status).json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}


