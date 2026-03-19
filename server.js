/**
 * Polymarket Order Relay
 * Runs outside Thailand to bypass geo-blocking on Polymarket CLOB API
 * 
 * Endpoints:
 *   GET  /health       - health check
 *   POST /place-order  - forward order to Polymarket CLOB
 *   POST /proxy        - generic proxy for any CLOB endpoint
 */
const express = require('express');
const app = express();
app.use(express.json({ limit: '1mb' }));

const CLOB_BASE = 'https://clob.polymarket.com';

// Generic CLOB proxy - forward any request to Polymarket
app.post('/proxy', async (req, res) => {
  const { path, method = 'POST', body, headers = {} } = req.body;
  
  if (!path) return res.status(400).json({ error: 'path required' });
  
  try {
    const response = await fetch(`${CLOB_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Place order - forward to Polymarket CLOB /order
app.post('/place-order', async (req, res) => {
  // Auth headers can be passed via x-poly-headers
  const extraHeaders = req.headers['x-poly-headers'] 
    ? JSON.parse(req.headers['x-poly-headers']) 
    : {};

  try {
    const response = await fetch(`${CLOB_BASE}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, region: process.env.FLY_REGION || process.env.REGION || 'unknown', ts: Date.now() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Polymarket relay listening on port ${PORT}`));
