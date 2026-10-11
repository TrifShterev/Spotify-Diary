import type { MeResponse } from '../../src/api.ts';

/** Served by `cy.intercept()` from `cypress/fixtures/avatar.png`, so no remote image is loaded. */
export const AVATAR_URL = '/fixtures/avatar.png';

/** A fully populated `GET /api/me` response. */
export const meResponse: MeResponse = {
  userId: 'user_2abcDEFghiJKLmno',
  spotify: {
    id: 'maria.ivanova',
    displayName: 'Maria Ivanova',
    email: 'maria@example.com',
    country: 'BG',
    product: 'premium',
    imageUrl: AVATAR_URL,
    profileUrl: 'https://open.spotify.com/user/maria.ivanova',
    followers: 1234,
  },
};

/** A `GET /api/me` response for an account that shares as little as possible. */
export const minimalMeResponse: MeResponse = {
  userId: 'user_2xyz',
  spotify: {
    id: 'quietlistener',
    displayName: null,
    email: null,
    country: null,
    product: null,
    imageUrl: null,
    profileUrl: null,
    followers: null,
  },
};

/** What `GET /api/me` returns without the `user-read-private` scope: Spotify leaves out country and plan. */
export const withoutPrivateScopeMeResponse: MeResponse = {
  ...meResponse,
  spotify: { ...meResponse.spotify, country: null, product: null },
};
