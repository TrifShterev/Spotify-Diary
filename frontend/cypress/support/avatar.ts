import { AVATAR_URL } from '../fixtures/me.ts';

/** Serves the profile picture from `cypress/fixtures/avatar.png` instead of a remote URL. */
export function stubAvatar() {
  cy.intercept('GET', AVATAR_URL, { fixture: 'avatar.png' });
}

/** Waits until the avatar image inside `selector` has loaded, so snapshots never show a half-loaded picture. */
export function waitForAvatar(selector: string) {
  cy.get(`${selector} img`)
    .should('be.visible')
    .and(($img) => expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0));
}
