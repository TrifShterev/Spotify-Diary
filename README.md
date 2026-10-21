# Spotify Diary

A personal music diary that helps you explore and reflect on your Spotify listening habits.

## Goal

Spotify shows what you are playing, but it has no good way to look back. Spotify Diary turns your listening history into a day-by-day diary:
what you listen to right now, what you played today, and what you played on each earlier day.

## Characteristics

- **Sign in with Spotify**: authentication is handled by [Clerk](https://clerk.com); no separate account or password is needed.
- **Diary view**: a **Today** section (the track playing now, then today's plays) followed by one section per earlier day, newest first, in your time zone.
- **Read-only**: the app only reads your profile and listening history; it never changes anything in your Spotify account.
- **Stores nothing**: there is no database. Every request is answered live from the Spotify Web API.
- **Scope-aware**: when a Spotify permission is missing, the app asks you to grant it instead of failing.
- **Tested**: the API has a `node:test` suite; the UI has Cypress component tests with image snapshots.

## Implementation

| Part | Stack |
| --- | --- |
| `frontend/` | React 19 SPA, Vite, MUI, TypeScript, Clerk React SDK, Cypress component tests |
| `backend/` | Express 5, TypeScript (run directly by Node), Clerk Express SDK, `node:test` |

How it works:

1. The user signs in with Spotify through Clerk in the SPA.
2. The SPA calls the backend under `/api`; Vite proxies these calls, so Clerk's session cookie is sent with each one.
3. The backend validates the session with `clerkMiddleware`, asks Clerk for the user's Spotify access token, and calls the Spotify Web API (`backend/src/spotify.ts`).
4. The backend maps Spotify's responses to small JSON shapes (`recentlyPlayed.ts`, `currentlyPlaying.ts`), and the SPA groups them by day and renders them (`ListeningHistory.tsx`).

Layout:

```text
backend/src/       Express app, routes (routes/api.ts), Spotify client, error handler
backend/test/      API tests
frontend/src/      components/, pages/, hooks/, theme.ts, api.ts, main.tsx
frontend/cypress/  Cypress config, fixtures and support files
```

## Getting started

1. Create a Clerk application with Spotify SSO enabled (see [Authentication](#authentication)).
2. Put the keys in `backend/.env.local` and `frontend/.env.local` (see below).
3. Start the backend and the frontend in two terminals, then open http://localhost:8080.

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
- `GET /api/recently-played` (requires a Clerk session) returns the user's last 50 plays from Spotify, in Spotify's order: `{ "items": [{ "playedAt", "name", "artists", "album": { "name", "imageUrl" }, "durationMs" }] }`.
  Responds like `/api/me` on errors, plus `403 { "error": "spotify_scope_missing" }` when the user hasn't granted `user-read-recently-played`.
- `GET /api/currently-playing` (requires a Clerk session) returns the track playing right now: `{ "nowPlaying": { ...the fields of a play, "isPlaying" } | null }`.
  `playedAt` is the estimated start of the play. `nowPlaying` is `null` when nothing is playing, or for podcast episodes and ads. Errors as for `/api/recently-played`, with `user-read-currently-playing` as the scope.
  Spotify adds a play to its history only after it ends, so the track playing now comes from here.

The home page shows both as a diary: a **Today** section first (the track playing now, then today's plays), then one section per earlier day, newest first, in the user's time zone (`frontend/src/components/ListeningHistory.tsx`, one `TrackItem.tsx` per play).

Environment (`backend/.env.local`, loaded automatically by the npm scripts):

- `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`: from the Clerk dashboard, or `clerk env pull`
- `FRONTEND_ORIGIN` (optional, default `http://localhost:8080`): origin allowed to use Clerk sessions against `/api`
- `PORT` (optional, default `3030`)

## Frontend: React + Vite, http://localhost:8080

```bash
cd frontend
npm install
npm run dev               # Vite dev server
npm run build             # type-check + production build into dist/
npm run preview           # serve the production build
npm run cy:open                  # Cypress component tests (interactive)
npm run cy:run:component         # Cypress component tests (headless)
npm run cy:run:component:strict  # same, but fails when a baseline image is missing
npm run cy:snapshots:update -- --spec <spec>  # re-baseline failing image snapshots of a spec
npm run cy:snapshots:clean       # delete baseline images no test uses anymore
```

The UI is built with [MUI](https://mui.com) and the Nunito font (`@fontsource/nunito`, bundled, so no network fonts).
Colours, typography and component defaults live in one theme, `src/theme.ts`, applied by `src/components/AppThemeProvider.tsx`; Clerk's sign-in UI reuses its colours (see `src/main.tsx`).

Component tests live next to the components as `*.cy.tsx` files. `cy.mount()` wraps every component in `AppThemeProvider`.
Significant visual changes are covered by image snapshots (`cy.matchImage()` from [`@pixsame/cypress-plugin-visual-regression-diff`](https://github.com/pixsame/pixsame)).
Baselines are committed in `__image_snapshots__/` next to each spec. See `.claude/skills/visual-regression-tests/SKILL.md` for the rules.

Environment (`frontend/.env.local`): `VITE_CLERK_PUBLISHABLE_KEY`.

## Authentication

Users sign in with their Spotify account through [Clerk](https://clerk.com) (Spotify SSO is enabled in the Clerk dashboard).
The Spotify connection needs the scopes `user-read-email`, `user-read-private`, `user-read-recently-played` and `user-read-currently-playing`.
Without `user-read-private`, Spotify leaves the user's country and plan out of their profile; without the other two, the diary can't show the listening history or the track playing now.
When a scope is missing, Spotify answers `403`, or `401` with the message `Permissions missing`; the API reports both as `spotify_scope_missing`.
Set all four under **SSO connections → Spotify → Scopes** in the Clerk dashboard (this requires custom Spotify credentials).
Users who connected with fewer scopes get an **Allow** prompt (in the *My profile* dialog for the profile scope, in the diary for the listening history), plus a reconnect option under *Manage account*, that sends them to Spotify (see `src/hooks/useSpotifyScopes.ts`).
Users who signed up another way (for example with email and password) see a **Connect Spotify** card instead of the profile and the diary; it links a Spotify account to their Clerk user with the same scopes.
Every prompt asks for all of these scopes at once: a new Spotify consent replaces the previous grant, so asking only for the missing scope would revoke the others.
The SPA and the API share one origin: Vite proxies `/api/*` to the backend, so Clerk's session cookie travels with every API request and no CORS or bearer tokens are needed.
On the backend, `clerkMiddleware` validates the session for `/api` routes, and `backend/src/spotify.ts` gets the user's Spotify access token from Clerk to call the Spotify Web API.
In production, serve the frontend and the API from the same origin as well (for example behind one reverse proxy).
