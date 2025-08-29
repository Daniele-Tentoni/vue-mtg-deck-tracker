// https://on.cypress.io/api

describe('My First Test', () => {
  it('visits the app root url', () => {
    const session = {
      access_token: 'IL_TUO_ACCESS_TOKEN',
      refresh_token: 'IL_TUO_REFRESH_TOKEN',
      user: { id: 'uuid-utente', email: 'utente@test.com' },
    };
    window.localStorage.setItem('supabase.auth.token', JSON.stringify(session));
    cy.visit('/');
    cy.get('.v-toolbar-title__placeholder').should('include.text', 'MDT');
    return;
    /*cy.get('[data-test="new-match-button-dialog"]').click();
    cy.get('[data-test="new-match-button-close"]').click();
    cy.get('[data-test="new-match-button-dialog"]').click();
    cy.get('[data-test="new-match-action-close"]').click();
    cy.get('[data-test="new-match-button-dialog"]').click();
    cy.get('[data-test="their-deck-field"]').type('Mono-Blue Faeries{downarrow}{enter}');
    cy.get('[data-test="your-deck-field"]').type('Mono-Red Aggro{downarrow}{enter}');

    cy.get('[data-test="match-button-group-0-0"]').click();
    cy.get('[data-test="match-button-group-0-1"]').click();
    cy.get('[data-test="match-button-group-0-2"]').click();
    cy.get('[data-test="new-match-resume-text"]').should(
      'have.text',
      'Player 0 won g1 Player 0 won s1 Player 0 won s2 ',
    );*/
  });
});
