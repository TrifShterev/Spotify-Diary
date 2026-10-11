import type { ErrorRequestHandler } from 'express';
import { SpotifyApiError, SpotifyNotConnectedError } from './spotify.ts';

/** The request has no valid Clerk session. */
export class UnauthenticatedError extends Error {
  constructor() {
    super('Unauthenticated');
    this.name = 'UnauthenticatedError';
  }
}

/**
 * Turns every error thrown by a route or middleware into a JSON response.
 * Express 5 forwards rejected promises from async handlers here too. Register it after all routes.
 */
export const errorHandlerGlobal: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof UnauthenticatedError) {
    res.status(401).json({ error: 'unauthenticated' });
    return;
  }
  if (err instanceof SpotifyNotConnectedError) {
    res.status(403).json({ error: 'spotify_not_connected' });
    return;
  }
  if (err instanceof SpotifyApiError) {
    res.status(502).json({ error: 'spotify_error', status: err.status });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'internal_error' });
};
