import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { UnauthenticatedError, errorHandlerGlobal } from '../src/errorHandlerGlobal.ts';
import { SpotifyApiError, SpotifyNotConnectedError } from '../src/spotify.ts';

describe('errorHandlerGlobal', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    const app = express();
    app.get('/unauthenticated', () => {
      throw new UnauthenticatedError();
    });
    app.get('/not-connected', async () => {
      throw new SpotifyNotConnectedError('user_123');
    });
    app.get('/spotify-error', async () => {
      throw new SpotifyApiError(429, { error: 'rate limited' });
    });
    app.get('/unexpected', () => {
      throw new Error('boom');
    });
    app.use(errorHandlerGlobal);

    server = await new Promise<Server>((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://localhost:${port}`;
  });

  after(() => {
    server.close();
  });

  const cases = [
    { path: '/unauthenticated', status: 401, body: { error: 'unauthenticated' } },
    { path: '/not-connected', status: 403, body: { error: 'spotify_not_connected' } },
    { path: '/spotify-error', status: 502, body: { error: 'spotify_error', status: 429 } },
    { path: '/unexpected', status: 500, body: { error: 'internal_error' } },
  ];

  for (const { path, status, body } of cases) {
    it(`maps ${path} to ${status}`, async () => {
      const res = await fetch(`${baseUrl}${path}`);
      assert.equal(res.status, status);
      assert.deepEqual(await res.json(), body);
    });
  }
});
