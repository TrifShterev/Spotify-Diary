import { createElement } from 'react';
import { mount } from 'cypress/react';
import '@pixsame/cypress-plugin-visual-regression-diff';
import AppThemeProvider from '../../src/components/AppThemeProvider.tsx';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

// Mount every component inside the app's MUI theme, exactly as main.tsx renders it.
Cypress.Commands.add('mount', (jsx, options) => mount(createElement(AppThemeProvider, null, jsx), options));

// Fonts load lazily on first use. Load every Nunito weight up front so no
// snapshot is taken with a fallback font.
beforeEach(() => {
  cy.document().then((doc) =>
    Promise.all(['400', '600', '700', '800'].map((weight) => doc.fonts.load(`${weight} 16px Nunito`))),
  );
});
