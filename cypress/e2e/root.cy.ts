// https://on.cypress.io/api

describe('The app root url', () => {
  it('should load winrate for pauper and show images on laptop', () => {
    const session = {
      access_token: 'IL_TUO_ACCESS_TOKEN',
      refresh_token: 'IL_TUO_REFRESH_TOKEN',
      user: { id: 'uuid-utente', email: 'utente@test.com' },
    };
    window.localStorage.setItem('supabase.auth.token', JSON.stringify(session));
    cy.mockSupabase('matches', 'matches.json');

    cy.intercept('GET', 'https://cards.scryfall.io/**', {
      statusCode: 200,
      headers: { 'Content-Type': 'image/png' },
      fixture: 'war-50-fblthp-the-lost.jpg',
    }).as('img');

    cy.visit('/');
    cy.viewport('macbook-13');
    cy.get('.v-toolbar-title__placeholder').should('include.text', 'MDT');
    cy.wait('@supabase-matches');
    cy.wait('@img');
    cy.get('[data-test="archetype-image"]');

    cy.viewport('iphone-se2');
    cy.get('[data-testid="archetype-image-White Weenie"]').should('not.exist');
  });
});
