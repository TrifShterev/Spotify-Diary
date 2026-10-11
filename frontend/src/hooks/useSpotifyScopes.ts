import { useUser } from '@clerk/react';

/**
 * Spotify scopes the profile needs beyond what sign-in grants. Without `user-read-private`
 * Spotify leaves `country` and `product` (the plan) out of `GET /v1/me`.
 */
export const SPOTIFY_PROFILE_SCOPES = ['user-read-private'];

/** Which profile scopes the user's Spotify connection lacks, and a way to ask Spotify for them. */
export function useSpotifyScopes() {
  const { user } = useUser();
  const account = user?.externalAccounts.find((externalAccount) => externalAccount.provider === 'spotify');
  const approved = account?.approvedScopes.split(' ') ?? [];
  const missingScopes = account ? SPOTIFY_PROFILE_SCOPES.filter((scope) => !approved.includes(scope)) : [];

  /** Sends the user to Spotify to approve the missing scopes. They come back to the current page. */
  const requestMissingScopes = async () => {
    if (!account) return;

    const reauthorized = await account.reauthorize({
      additionalScopes: missingScopes,
      redirectUrl: window.location.href,
    });
    const redirectUrl = reauthorized.verification?.externalVerificationRedirectURL;
    if (redirectUrl) window.location.assign(redirectUrl.href);
  };

  return { missingScopes, requestMissingScopes };
}
