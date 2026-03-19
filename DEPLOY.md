# Polymarket Relay - Deploy Guide

The relay server is ready at: https://github.com/jarviscommand-rgb/polymarket-relay

All three deploy options below take < 5 minutes. Pick whichever you like.

---

## Option A: Cloudflare Workers (FASTEST - ~2 min, generous free tier)

No credit card needed, 100k requests/day free, global edge network.

```bash
cd /Users/jarviscommand/.openclaw/workspace/polymarket-v2/relay

# Login (opens browser)
wrangler login

# Deploy immediately
wrangler deploy worker.js
```

Your URL will be: `https://polymarket-relay.<your-subdomain>.workers.dev`

Then set in your .env:
```
RELAY_URL=https://polymarket-relay.<your-subdomain>.workers.dev
```

---

## Option B: fly.io (Singapore region, free tier, Docker)

```bash
export PATH="/Users/jarviscommand/.fly/bin:$PATH"
cd /Users/jarviscommand/.openclaw/workspace/polymarket-v2/relay

# Login (opens browser - use GitHub to sign up if new)
flyctl auth login

# Deploy to Singapore
flyctl deploy --name polymarket-relay --region sin

# Get your URL after deploy
flyctl status
```

Your URL will be: `https://polymarket-relay.fly.dev`

Then set in your .env:
```
RELAY_URL=https://polymarket-relay.fly.dev
```

---

## Option C: Railway.app (auto-deploy from GitHub)

1. Go to https://railway.app and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select: `jarviscommand-rgb/polymarket-relay`
4. Railway auto-detects Node.js and deploys
5. In Railway dashboard → Settings → Generate domain

Then set in your .env:
```
RELAY_URL=https://your-app-name.up.railway.app
```

---

## Option D: Render.com (auto-deploy from GitHub)

1. Go to https://render.com and sign up with GitHub
2. New → Web Service → Connect `jarviscommand-rgb/polymarket-relay`
3. Settings: Name `polymarket-relay`, Region `Singapore`, Free tier
4. Build command: `npm install`
5. Start command: `node server.js`
6. Click Deploy

Then set in your .env:
```
RELAY_URL=https://polymarket-relay.onrender.com
```

---

## Testing the relay

Once deployed, test it:
```bash
curl https://YOUR_RELAY_URL/health
# Should return: {"ok":true,"region":"..."}

# Test order forwarding (dry run)
curl -X POST https://YOUR_RELAY_URL/place-order \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## Using the relay in place_order.js

```bash
# Add to your .env file
echo "RELAY_URL=https://YOUR_RELAY_URL" >> ../data/.env

# Or set inline when running
RELAY_URL=https://YOUR_RELAY_URL node place_order.js TOKEN_ID BUY 0.55 10
```

The trader will automatically:
1. Try direct CLOB first
2. If geo-blocked (403), fall back to relay seamlessly
