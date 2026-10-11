import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { app } from '../src/app.ts';
import { type SpotifyCurrentlyPlaying, toCurrentlyPlaying } from '../src/currentlyPlaying.ts';

const NOW = Date.parse('2026-10-11T08:30:00.000Z');

const playback = (overrides: Partial<SpotifyCurrentlyPlaying> = {}): SpotifyCurrentlyPlaying => ({
  is_playing: true,
  progress_ms: 90000,
  currently_playing_type: 'track',
  item: {
    name: 'Under Pressure',
    duration_ms: 248000,
    artists: [{ name: 'Queen' }, { name: 'David Bowie' }],
    album: {
      name: 'Hot Space',
      images: [
        { url: 'https://i.scdn.co/640', width: 640, height: 640 },
        { url: 'https://i.scdn.co/300', width: 300, height: 300 },
      ],
    },
  },
  ...overrides,
});

const nowPlaying = {
  playedAt: '2026-10-11T08:28:30.000Z',
  name: 'Under Pressure',
  artists: ['Queen', 'David Bowie'],
  album: { name: 'Hot Space', imageUrl: 'https://i.scdn.co/300' },
  durationMs: 248000,
  isPlaying: true,
};

describe('toCurrentlyPlaying', () => {
  it('maps a playing track and dates it back by the playback progress', () => {
    assert.deepEqual(toCurrentlyPlaying(playback(), NOW), { nowPlaying });
  });

  it('maps a paused track', () => {
    assert.deepEqual(toCurrentlyPlaying(playback({ is_playing: false }), NOW), {
      nowPlaying: { ...nowPlaying, isPlaying: false },
    });
  });

  it('treats a null progress as the start of the track', () => {
    assert.deepEqual(toCurrentlyPlaying(playback({ progress_ms: null }), NOW), {
      nowPlaying: { ...nowPlaying, playedAt: '2026-10-11T08:30:00.000Z' },
    });
  });

  const nothingPlaying: { title: string; body: SpotifyCurrentlyPlaying | null }[] = [
    { title: 'nothing is playing (204)', body: null },
    { title: 'there is no item', body: playback({ item: null }) },
    { title: 'a podcast episode is playing', body: playback({ currently_playing_type: 'episode' }) },
    { title: 'an ad is playing', body: playback({ currently_playing_type: 'ad' }) },
  ];

  for (const { title, body } of nothingPlaying) {
    it(`returns null when ${title}`, () => assert.deepEqual(toCurrentlyPlaying(body, NOW), { nowPlaying: null }));
  }
});

describe('GET /api/currently-playing', { skip: !process.env.CLERK_SECRET_KEY && 'CLERK_SECRET_KEY is not set' }, () => {
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
    const res = await fetch(`${baseUrl}/api/currently-playing`);
    assert.equal(res.status, 401);

    const body = await res.json();
    assert.equal(body.error, 'unauthenticated');
  });
});
