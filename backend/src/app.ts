import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import { errorHandlerGlobal } from './errorHandlerGlobal.ts';
import { apiRouter } from './routes/api.ts';

export const app = express();

app.use(express.json());

app.get('/healthcheck', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// The SPA is served from the same origin (Vite proxies /api in dev), so Clerk's session
// cookie arrives with every request. authorizedParties rejects tokens minted for other origins.
app.use(
  '/api',
  clerkMiddleware({
    authorizedParties: [process.env.FRONTEND_ORIGIN ?? 'http://localhost:8080'],
  }),
  apiRouter,
);

app.use(errorHandlerGlobal);
