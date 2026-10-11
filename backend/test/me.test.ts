import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { app } from '../src/app.ts';

describe('GET /api/me', { skip: !process.env.CLERK_SECRET_KEY && 'CLERK_SECRET_KEY is not set' }, () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    server = await new Promise<Server>((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://localhost:${port}`;
  });

  after(() => {
    server.close();
  });

  it('responds with 401 when there is no Clerk session', async () => {
    const res = await fetch(`${baseUrl}/api/me`);
    assert.equal(res.status, 401);

    const body = await res.json();
    assert.equal(body.error, 'unauthenticated');
  });
});
