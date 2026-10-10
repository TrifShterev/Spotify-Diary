import Home from './Home.tsx';

describe('<Home />', () => {
  it('renders the app title and tagline', () => {
    cy.mount(<Home />);

    cy.get('h1').should('have.text', 'Spotify Diary');
    cy.contains('Explore and reflect on your Spotify listening habits.').should('be.visible');
  });

  it('renders the diary section', () => {
    cy.mount(<Home />);

    cy.contains('h2', 'Your diary').should('be.visible');
  });
});
