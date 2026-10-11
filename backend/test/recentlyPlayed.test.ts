import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { app } from '../src/app.ts';
import { type SpotifyImage, pickCover, toRecentlyPlayed } from '../src/recentlyPlayed.ts';

const image = (width: number | null): SpotifyImage => ({ url: `https://i.scdn.co/${width}`, width, height: width });

describe('toRecentlyPlayed', () => {
  it('maps Spotify plays to the API shape and keeps their order', () => {
    const response = toRecentlyPlayed({
      items: [
        {
          played_at: '2026-10-11T08:30:00.000Z',
          track: {
            name: 'Under Pressure',
            duration_ms: 248000,
            artists: [{ name: 'Queen' }, { name: 'David Bowie' }],
            album: { name: 'Hot Space', images: [image(640), image(300), image(64)] },
          },
        },
        {
          played_at: '2026-10-10T21:05:00.000Z',
          track: {
            name: 'Intro',
            duration_ms: 61000,
            artists: [{ name: 'The xx' }],
            album: { name: 'xx', images: [] },
          },
        },
      ],
    });

    assert.deepEqual(response, {
      items: [
        {
          playedAt: '2026-10-11T08:30:00.000Z',
          name: 'Under Pressure',
          artists: ['Queen', 'David Bowie'],
          album: { name: 'Hot Space', imageUrl: 'https://i.scdn.co/300' },
          durationMs: 248000,
        },
        {
          playedAt: '2026-10-10T21:05:00.000Z',
          name: 'Intro',
          artists: ['The xx'],
          album: { name: 'xx', imageUrl: null },
          durationMs: 61000,
        },
      ],
    });
  });

  it('returns no items for an empty history', () => {
    assert.deepEqual(toRecentlyPlayed({ items: [] }), { items: [] });
  });
});

describe('pickCover', () => {
  const cases: { title: string; images: SpotifyImage[]; expected: string | null }[] = [
    {
      title: 'the smallest image at least 144px wide',
      images: [image(640), image(300), image(64)],
      expected: 'https://i.scdn.co/300',
    },
    {
      title: 'an image exactly 144px wide',
      images: [image(640), image(144), image(64)],
      expected: 'https://i.scdn.co/144',
    },
    {
      title: 'the smallest sharp image whatever the order',
      images: [image(64), image(300), image(640)],
      expected: 'https://i.scdn.co/300',
    },
    { title: 'the widest image when none is 144px wide', images: [image(64), image(100)], expected: 'https://i.scdn.co/100' },
    { title: 'a sized image over one with a null width', images: [image(null), image(300)], expected: 'https://i.scdn.co/300' },
    {
      title: 'the first image when every width is null',
      images: [{ ...image(null), url: 'first' }, { ...image(null), url: 'second' }],
      expected: 'first',
    },
    { title: 'null for an empty images array', images: [], expected: null },
  ];

  for (const { title, images, expected } of cases) it(`picks ${title}`, () => assert.equal(pickCover(images), expected));
});

describe('GET /api/recently-played', { skip: !process.env.CLERK_SECRET_KEY && 'CLERK_SECRET_KEY is not set' }, () => {
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
    const res = await fetch(`${baseUrl}/api/recently-played`);
    assert.equal(res.status, 401);

    const body = await res.json();
    assert.equal(body.error, 'unauthenticated');
  });
});
