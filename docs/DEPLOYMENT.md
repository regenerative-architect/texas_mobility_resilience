# Deployment

## Local / LAN
1. Install Node.js 20+.
2. `npm install`
3. Set environment values as needed.
4. `npm start`
5. Open `http://localhost:8787`.

## Production
Put the Node process behind HTTPS with WebSocket upgrade support. Set `MULTIPLAYER_INVITE_CODE`; add real authentication/authorization for institutional use. Put `STATE_FILE` on persistent storage or replace the JSON state store with a database.

## Static-only
Static HTTPS hosting supports the PWA, local calculators, IndexedDB, evidence and WebLLM. Multiplayer and `/api/*` adapters will not work.
