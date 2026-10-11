import { ALBUM_COVER_URL, WIDE_ALBUM_COVER_URL } from '../fixtures/recentlyPlayed.ts';

/** Serves album covers from `cypress/fixtures/` instead of a remote URL. */
export function stubAlbumCover() {
  cy.intercept('GET', ALBUM_COVER_URL, { fixture: 'album-cover.png' });
  cy.intercept('GET', WIDE_ALBUM_COVER_URL, { fixture: 'album-cover-wide.png' });
}

/** Waits until every album cover inside `selector` has loaded, so snapshots never show a half-loaded cover. */
export function waitForAlbumCovers(selector: string) {
  cy.get(`${selector} img`)
    .should('be.visible')
    .and(($imgs) => {
      for (const img of $imgs) expect((img as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
    });
}
