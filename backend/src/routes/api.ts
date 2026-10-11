import { Router } from 'express';
import { getAuth } from '@clerk/express';
import { type SpotifyCurrentlyPlaying, toCurrentlyPlaying } from '../currentlyPlaying.ts';
import { UnauthenticatedError } from '../errorHandlerGlobal.ts';
import { RECENTLY_PLAYED_LIMIT, type SpotifyRecentlyPlayed, toRecentlyPlayed } from '../recentlyPlayed.ts';
import { SpotifyScopeMissingError, isSpotifyScopeMissing, spotifyFetch } from '../spotify.ts';

interface SpotifyProfile {
  id: string;
  display_name: string | null;
  email?: string;
  country?: string;
  product?: string;
  images?: { url: string; width: number | null; height: number | null }[];
  external_urls?: { spotify?: string };
  followers?: { total: number };
}

export const apiRouter = Router();

// Every /api route needs a signed-in user. API clients get a 401 JSON response, not a redirect.
apiRouter.use((req, _res, next) => {
  next(getAuth(req).userId ? undefined : new UnauthenticatedError());
});

apiRouter.get('/me', async (req, res) => {
  const { userId } = getAuth(req);
  const profile = await spotifyFetch<SpotifyProfile>(userId!, '/me');

  res.json({
    userId,
    spotify: {
      id: profile.id,
      displayName: profile.display_name,
      email: profile.email ?? null,
      country: profile.country ?? null,
      product: profile.product ?? null,
      imageUrl: profile.images?.[0]?.url ?? null,
      profileUrl: profile.external_urls?.spotify ?? null,
      followers: profile.followers?.total ?? null,
    },
  });
});

/** A `.catch` handler that rethrows Spotify's missing-scope answers as `SpotifyScopeMissingError(scope)`. */
const rethrowScopeMissing = (scope: string) => (err: unknown) => {
  throw isSpotifyScopeMissing(err) ? new SpotifyScopeMissingError(scope) : err;
};

apiRouter.get('/recently-played', async (req, res) => {
  const { userId } = getAuth(req);
  const history = await spotifyFetch<SpotifyRecentlyPlayed>(
    userId!,
    `/me/player/recently-played?limit=${RECENTLY_PLAYED_LIMIT}`,
  ).catch(rethrowScopeMissing('user-read-recently-played'));

  res.json(toRecentlyPlayed(history));
});

// Spotify's history gains a play only once it ends, so the client merges this track into today.
apiRouter.get('/currently-playing', async (req, res) => {
  const { userId } = getAuth(req);
  const playback = await spotifyFetch<SpotifyCurrentlyPlaying | null>(
    userId!,
    '/me/player/currently-playing',
  ).catch(rethrowScopeMissing('user-read-currently-playing'));

  res.json(toCurrentlyPlaying(playback, Date.now()));
});
