import { useUser } from '@clerk/react';

/**
 * Spotify scopes the profile needs beyond what sign-in grants. Without `user-read-private`
 * Spotify leaves `country` and `product` (the plan) out of `GET /v1/me`.
 */
export const SPOTIFY_PROFILE_SCOPES = ['user-read-private'];

/**
 * Spotify scopes the listening history needs. Without them `GET /v1/me/player/recently-played`
 * and `GET /v1/me/player/currently-playing` (the track playing now, shown under Today) fail.
 */
export const SPOTIFY_LISTENING_SCOPES = ['user-read-recently-played', 'user-read-currently-playing'];

/** Every scope the app needs beyond what sign-in grants. */
export const SPOTIFY_SCOPES = [...SPOTIFY_PROFILE_SCOPES, ...SPOTIFY_LISTENING_SCOPES];

/** Whether the user has a Spotify account connected, which scopes it lacks, and a way to ask Spotify for them. */
export function useSpotifyScopes() {
  const { isLoaded, user } = useUser();
  const account = user?.externalAccounts.find((externalAccount) => externalAccount.provider === 'spotify');
  const approved = account?.approvedScopes.split(' ') ?? [];

  /**
   * False when the user signed up another way (e.g. email and password) and never connected Spotify,
   * or never finished connecting it. Undefined while Clerk is loading.
   */
  const connected = isLoaded ? account?.verification?.status === 'verified' : undefined;

  /** Whether any of `scopes` is not approved yet. False while no Spotify account is known. */
  const lacks = (scopes: string[]) => account !== undefined && scopes.some((scope) => !approved.includes(scope));

  /**
   * Sends the user to Spotify to connect their account, or to approve the scopes of the connected one.
   * They come back to the current page.
   * Always asks for every scope: a new Spotify consent replaces the previous grant instead of adding to it,
   * so asking only for the missing ones would drop the scopes approved earlier.
   */
  const authorizeSpotify = async () => {
    if (!user) return;

    const params = { additionalScopes: SPOTIFY_SCOPES, redirectUrl: window.location.href };
    const authorizing = account
      ? await account.reauthorize(params)
      : await user.createExternalAccount({ strategy: 'oauth_spotify', ...params });
    const redirectUrl = authorizing.verification?.externalVerificationRedirectURL;
    if (redirectUrl) window.location.assign(redirectUrl.href);
  };

  return { connected, lacks, authorizeSpotify };
}
