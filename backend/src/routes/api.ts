import { Router } from 'express';
import { getAuth } from '@clerk/express';
import { UnauthenticatedError } from '../errorHandlerGlobal.ts';
import { spotifyFetch } from '../spotify.ts';

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
