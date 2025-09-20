import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());

// in-memory stats (experimental only)
let scanEvents = [];

app.post('/api/scan-events', (req, res) => {
  const { code, durationMs, ts } = req.body || {};
  if (!code) return res.status(400).json({ error: 'code required' });
  const event = { code, durationMs: durationMs ?? null, ts: ts || Date.now() };
  scanEvents.push(event);
  if (scanEvents.length > 5000) {
    scanEvents = scanEvents.slice(-2000);
  }
  res.json({ ok: true });
});

// Batch insert endpoint: { codes: [{ code, durationMs, ts? }, ...] }
app.post('/api/scan-batch', (req, res) => {
  const { codes } = req.body || {};
  if (!Array.isArray(codes) || !codes.length) {
    return res.status(400).json({ error: 'codes array required' });
  }
  const now = Date.now();
  for (const item of codes) {
    if (!item || !item.code) continue;
    scanEvents.push({
      code: item.code,
      durationMs: item.durationMs ?? null,
      ts: item.ts || now
    });
  }
  if (scanEvents.length > 5000) {
    scanEvents = scanEvents.slice(-2000);
  }
  res.json({ ok: true, added: codes.length });
});

app.get('/api/stats', (req, res) => {
  const total = scanEvents.length;
  const unique = new Set(scanEvents.map(e => e.code)).size;
  const avgDuration = (scanEvents.filter(e=>e.durationMs!=null).reduce((a,b)=>a + b.durationMs,0) / (scanEvents.filter(e=>e.durationMs!=null).length || 1));
  res.json({ total, unique, avgDurationMs: Math.round(avgDuration) });
});

app.listen(PORT, () => {
  console.log(`Server listening on :${PORT}`);
});
