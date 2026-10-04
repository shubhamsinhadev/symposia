# Symposia

React + TanStack Router, Hono JSON APIs, and Nitro v3 WebSockets, built with Vite.

## Getting started

```bash
bun install
bun run dev
```

## Deploying

```bash
bun run typecheck
bun run build
bun run test
bun run preview
```

The smoke tests start the built Node server and check API responses, validation, SPA deep links, and WebSocket echo/broadcast behavior. Run the build before testing.

## Routes

- `/`: Home
- `/api-demo`: Interactive Hono greeting and JSON echo
- `/chat`: Live chat; open two tabs to try broadcasts, with a reconnect button after disconnecting
- `GET /api/health`: Health status and timestamp
- `GET /api/hello`: JSON greeting
- `POST /api/echo`: Send `{ "message": "Hello!" }`; accepts 1–1000 characters, trims whitespace
- `/ws`: WebSocket endpoint; send plain text and receive JSON system, message, or error events

## Structure

`app/entry-client.tsx` mounts React. `app/router.tsx` defines typed, code-based TanStack routes; page components live in `app/pages/`. `server/utils/api.ts` defines the Hono app, mounted through Nitro's `server/api/[...path].ts`. `server/routes/ws.ts` uses Nitro's native CrossWS support, enabled in `nitro.config.ts`. APIs and WebSockets share the same origin, with `wss:` selected automatically for HTTPS.

Chat is an anonymous demo with no stored history. Broadcasts use the current server instance; multiple instances need a shared messaging backend.

See the [Nitro deployment documentation](https://nitro.build/deploy) for other presets.
