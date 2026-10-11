import { clerkClient } from '@clerk/express';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/** The signed-in user has no Spotify account connected in Clerk (or Clerk holds no token for it). */
export class SpotifyNotConnectedError extends Error {
  constructor(userId: string) {
    super(`No Spotify access token available for user ${userId}`);
    this.name = 'SpotifyNotConnectedError';
  }
}

/** The Spotify Web API answered with a non-2xx status. */
export class SpotifyApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`Spotify API responded with ${status}`);
    this.name = 'SpotifyApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Returns the user's Spotify OAuth access token. Clerk stores the token from the
 * Spotify sign-in and refreshes it when it expires, so always fetch a fresh one per request.
 */
export async function getSpotifyAccessToken(userId: string): Promise<string> {
  const { data } = await clerkClient.users.getUserOauthAccessToken(userId, 'spotify');
  const token = data[0]?.token;
  if (!token) {
    throw new SpotifyNotConnectedError(userId);
  }
  return token;
}

/** Calls the Spotify Web API on behalf of the given Clerk user. `path` is relative to `/v1`, e.g. `/me`. */
export async function spotifyFetch<T>(userId: string, path: string, init: RequestInit = {}): Promise<T> {
  const token = await getSpotifyAccessToken(userId);
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${SPOTIFY_API_BASE}${path}`, { ...init, headers });
  const body = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    throw new SpotifyApiError(res.status, body);
  }
  return body as T;
}
