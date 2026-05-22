# SpeakingSites — Netlify ⇄ Laravel deployment notes

Three things need to be true for chats on https://speakingsites.netlify.app to
land in your admin:

1. The Laravel backend lives at a public HTTPS URL (call it `BACKEND_URL`).
2. The Netlify HTML embeds `BACKEND_URL/widget/speakingsites-widget.js`.
3. CORS on the backend allows the Netlify origin.

## 1. Host the Laravel backend publicly

Any host that runs PHP 8.2+ and MySQL works (Railway, Fly.io, Hetzner, shared
cPanel, etc.). After deploy:

- Set `.env`:
  ```
  APP_URL=https://your-backend.example.com
  APP_DEBUG=false
  CORS_ALLOWED_ORIGINS=https://speakingsites.netlify.app
  ```
- Run `php artisan migrate --force && php artisan storage:link`.
- Make sure `storage/app/public/` is writable and `public/storage` symlink
  works on the host's filesystem.
- Create at least one client and grab its `embed_api_key` from the admin
  panel (`/admin/clients`).

## 2. Update the Netlify site

In whatever repo deploys to `speakingsites.netlify.app`, add **one script
tag** right before `</body>` in `index.html`:

```html
<script
  src="https://your-backend.example.com/widget/speakingsites-widget.js"
  data-backend="https://your-backend.example.com"
  data-api-key="sk_xxx_from_admin_panel"
  data-auto-start="plumber"
  defer></script>
```

Re-deploy on Netlify. When a visitor clicks Plumber:

- The widget calls `POST /api/widget/conversation/start`, gets a `session_id`.
- It requests mic permission and starts a MediaRecorder.
- An "End Chat" button appears bottom-right.
- On click (or page unload) it POSTs the audio + transcript to
  `/api/widget/conversation/end`. The recording lands at
  `storage/app/public/conversations/{client_id}/{session_id}.webm` and rows
  appear in `conversations` + `messages`.

## 3. Verify CORS

From a browser console on https://speakingsites.netlify.app:

```js
fetch('https://your-backend.example.com/api/widget/conversation/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ api_key: 'sk_xxx', avatar_type: 'plumber' })
}).then(r => r.json()).then(console.log)
```

Expect `{ session_id: ..., conversation_id: ... }`. If you see a CORS error,
double-check `CORS_ALLOWED_ORIGINS` in the backend `.env` and rerun
`php artisan config:clear`.

## Roles and visibility

The backend has three roles (`users.role`):

| Role | What they see |
|---|---|
| `super_admin` | Everything across all clients |
| `client_owner` | All conversations for their own `client_id` |
| `client` | All conversations for any client whose `sector` matches the user's `client.sector` (sector-scoped read-only) |

`sector` lives on the `clients` table and matches widget `avatar_type`
values: `plumber`, `lawyer`, `medical`, `builder`, `salon`.

## Known limitations

- The widget records the **visitor's microphone only**. The AI/avatar audio
  comes from inside HeyGen's cross-origin iframe; you'd need HeyGen's
  Streaming Avatar SDK (not the embed iframe) to capture both sides.
- Transcript capture is best-effort `postMessage`. HeyGen's iframe does not
  publish a documented transcript event stream — the listener catches the
  common shapes (`{role,content}`, `type: user_message`, etc.) but may stay
  empty. For a real transcript, pipe the saved `.webm` through Whisper
  server-side (not implemented in this slice).
- No SSL/HTTPS handling in the dev `php artisan serve` — for production use
  a real web server (nginx + php-fpm or Caddy).
