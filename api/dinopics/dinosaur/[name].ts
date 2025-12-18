type Req = {
  method?: string;
  query: Record<string, string | string[] | undefined>;
};

type Res = {
  setHeader: (k: string, v: string) => void;
  status: (code: number) => Res;
  json: (body: unknown) => void;
  send: (body: unknown) => void;
  end: () => void;
};

function setCors(res: Res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: Req, res: Res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const name = String(req.query.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Missing dinosaur name' });

  const upstream = `https://dinosaurpictures.org/api/dinosaur/${encodeURIComponent(name)}`;

  try {
    const r = await fetch(upstream, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'dino-library (vercel proxy)',
      },
    });

    // Pass through status + body.
    const text = await r.text();
    res.status(r.status);
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (e) {
    return res.status(502).json({ error: 'Upstream fetch failed' });
  }
}
