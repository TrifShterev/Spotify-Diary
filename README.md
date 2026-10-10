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

You can override the port with the `PORT` environment variable.

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
