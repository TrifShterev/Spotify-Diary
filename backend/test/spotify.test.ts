import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SpotifyApiError, SpotifyNotConnectedError, isSpotifyScopeMissing } from '../src/spotify.ts';

describe('isSpotifyScopeMissing', () => {
  const cases: { title: string; err: unknown; expected: boolean }[] = [
    { title: 'a 403', err: new SpotifyApiError(403, { error: { status: 403, message: 'Forbidden' } }), expected: true },
    {
      title: 'a 401 saying "Permissions missing"',
      err: new SpotifyApiError(401, { error: { status: 401, message: 'Permissions missing' } }),
      expected: true,
    },
    {
      title: 'a 401 with another message',
      err: new SpotifyApiError(401, { error: { status: 401, message: 'The access token expired' } }),
      expected: false,
    },
    { title: 'a 401 without a body', err: new SpotifyApiError(401, null), expected: false },
    { title: 'a 401 with a text body', err: new SpotifyApiError(401, 'Permissions missing'), expected: false },
    { title: 'a 401 with a non-object error', err: new SpotifyApiError(401, { error: 'invalid_token' }), expected: false },
    {
      title: 'a 500 saying "Permissions missing"',
      err: new SpotifyApiError(500, { error: { status: 500, message: 'Permissions missing' } }),
      expected: false,
    },
    { title: 'an error that is not a SpotifyApiError', err: new SpotifyNotConnectedError('user_123'), expected: false },
  ];

  for (const { title, err, expected } of cases) {
    it(`returns ${expected} for ${title}`, () => assert.equal(isSpotifyScopeMissing(err), expected));
  }
});
