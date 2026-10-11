# Spotify Diary

A personal music diary that helps you explore and reflect on your Spotify listening habits.

The project is a React SPA (`frontend/`) plus an Express API (`backend/`). Both are written in TypeScript.
Each part has its own `package.json` and `node_modules`, so install and run them separately.

**Requirements:** Node.js 24+. The backend runs `.ts` files directly through Node's built-in type stripping.

## Backend: Express, http://localhost:3030

```bash
cd backend
npm install
npm run dev        # start with file watching
npm start          # start without watching
npm run typecheck  # tsc --noEmit
npm test           # node:test suite
```

Endpoints:

- `GET /healthcheck` returns `{ "status": "ok", "uptime": <seconds>, "timestamp": "<ISO date>" }`
- `GET /api/me` (requires a Clerk session) returns the Clerk `userId` and the user's Spotify profile, fetched from the Spotify Web API with the access token Clerk stores for the user's Spotify account. Responds `401` without a session, `403` if no Spotify account is connected, `502` if Spotify fails.

Environment (`backend/.env.local`, loaded automatically by the npm scripts):

- `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`: from the Clerk dashboard, or `clerk env pull`
- `FRONTEND_ORIGIN` (optional, default `http://localhost:8080`): origin allowed to use Clerk sessions against `/api`
- `PORT` (optional, default `3030`)

## Frontend: React + Vite, http://localhost:8080

```bash
cd frontend
npm install
npm run dev             # Vite dev server
npm run build           # type-check + production build into dist/
npm run preview         # serve the production build
npm run cy:open         # Cypress component tests (interactive)
npm run test:component  # Cypress component tests (headless)
```

Component tests live next to the components as `*.cy.tsx` files.

Environment (`frontend/.env.local`): `VITE_CLERK_PUBLISHABLE_KEY`.

## Authentication

Users sign in with their Spotify account through [Clerk](https://clerk.com) (Spotify SSO is enabled in the Clerk dashboard).
The SPA and the API share one origin: Vite proxies `/api/*` to the backend, so Clerk's session cookie travels with every API request and no CORS or bearer tokens are needed.
On the backend, `clerkMiddleware` validates the session for `/api` routes, and `backend/src/spotify.ts` gets the user's Spotify access token from Clerk to call the Spotify Web API.
In production, serve the frontend and the API from the same origin as well (for example behind one reverse proxy).
