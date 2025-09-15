// https://on.cypress.io/api

describe('The app root url', () => {
  it('should load winrate for pauper and show images on laptop', () => {
    cy.authenticated('id', 'id@test.com');
    cy.mockAuth('id', 'id@test.com');
    cy.mockSupabase('archetypes', 'archetypes.json');
    cy.mockSupabase('matches', 'matches.json');

    cy.intercept('GET', 'https://cards.scryfall.io/**', {
      statusCode: 200,
      headers: { 'Content-Type': 'image/png' },
      fixture: 'war-50-fblthp-the-lost.jpg',
    }).as('img');

    cy.visit('/pauper/White%20Weenie');
    cy.viewport('macbook-13');
    cy.get('.v-toolbar-title__placeholder').should('include.text', 'MDT');
  });
});
