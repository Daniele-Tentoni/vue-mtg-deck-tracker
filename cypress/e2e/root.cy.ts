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

    cy.visit('/');
    cy.viewport('macbook-13');
    cy.get('.v-toolbar-title__placeholder').should('include.text', 'MDT');
    cy.wait('@supabase-matches');
    cy.wait('@img');
    cy.get('[data-test="archetype-image"]');

    cy.viewport('iphone-se2');
    cy.get('[data-testid="archetype-image-White Weenie"]').should('not.exist');
  });

  it('upload a new match result', () => {
    cy.authenticated('id', 'id@test.com');
    cy.mockAuth('id', 'id@test.com');
    cy.mockSupabase('archetypes', 'archetypes.json');
    cy.mockSupabase('matches', 'matches.json');
    
    cy.intercept('GET', 'https://cards.scryfall.io/**', {
      statusCode: 200,
      headers: { 'Content-Type': 'image/png' },
      fixture: 'war-50-fblthp-the-lost.jpg',
    }).as('img');
    cy.visit('/');
    cy.wait('@supabase-matches');
    cy.wait('@supabase-archetypes')
    cy.wait('@supabase-user')
    
    cy.get('[data-test="new-match-button-dialog"]').click();
    cy.get('[data-test="close-button"]').click();
    
    // Open the dialog and fill decks.
    cy.get('[data-test="new-match-button-dialog"]').click();
    cy.get('[data-test="your-deck-field"]').type('Mono Blue Faeries{downArrow}{enter}');
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.get('[data-test="their-deck-field"]').type('Jund Wildfire{downArrow}{enter}');
    
    // Select some combinations of scores.
    cy.get('[data-test="match-button-group-0-button-0"]').click();
    cy.get('[data-test="match-button-group-1-button-0"]').click();
    cy.get('[data-test="new-match-resume-text"]').should('include.text', 'Player');
    cy.get('[data-test="match-button-group-2"] > div > button').should('be.disabled');
    cy.get('[data-test="match-button-group-1-button-1"]').click();
    cy.get('[data-test="match-button-group-2-button-1"]').click();
    cy.get('[data-test="new-match-resume-text"]').should('include.text', 'Player');
    
    // Try to post the match.
    cy.intercept('POST', `/rest/v1/matches*`, { statusCode: 200 }).as('create_match');
    cy.get('[data-test="new-match-create-action"]').click();
    cy.wait('@create_match')
    cy.get('[data-test="close-button"]').should('not.exist');
    
  });

  it('open an archetype page', () => {
    cy.authenticated('id', 'id@test.com');
    cy.mockAuth('id', 'id@test.com');
    cy.mockSupabase('archetypes', 'archetypes.json');
    cy.mockSupabase('matches', 'matches.json');

    cy.intercept('GET', 'https://cards.scryfall.io/**', {
      statusCode: 200,
      headers: { 'Content-Type': 'image/png' },
      fixture: 'war-50-fblthp-the-lost.jpg',
    }).as('img');
    cy.visit('/');

    const deck = 'White Weenie';
    cy.contains('a', deck).click();
    cy.url().should('include', encodeURIComponent(deck));
  });
});
