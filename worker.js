/**
 * Polymarket Order Relay - Cloudflare Worker version
 * Deploy: wrangler deploy
 * Free tier: 100k requests/day
 */

const CLOB_BASE = 'https://clob.polymarket.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Health check
    if (url.pathname === '/health') {
      return Response.json({ ok: true, region: request.cf?.colo || 'unknown' });
    }
    
    // Place order
    if (url.pathname === '/place-order' && request.method === 'POST') {
      const body = await request.json();
      const extraHeaders = request.headers.get('x-poly-headers')
        ? JSON.parse(request.headers.get('x-poly-headers'))
        : {};
      
      const resp = await fetch(`${CLOB_BASE}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...extraHeaders },
        body: JSON.stringify(body)
      });
      
      const data = await resp.json();
      return Response.json(data, { status: resp.status });
    }
    
    // Generic proxy
    if (url.pathname === '/proxy' && request.method === 'POST') {
      const { path, method = 'POST', body, headers = {} } = await request.json();
      if (!path) return Response.json({ error: 'path required' }, { status: 400 });
      
      const resp = await fetch(`${CLOB_BASE}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : undefined
      });
      
      const data = await resp.json();
      return Response.json(data, { status: resp.status });
    }
    
    return Response.json({ error: 'not found' }, { status: 404 });
  }
};
