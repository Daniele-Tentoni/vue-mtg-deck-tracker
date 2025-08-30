describe('Users could authenticate', () => {
  it('creating a new account', () => {
    cy.visit('/');
    cy.get('[data-test="user-menu"]').click();
    cy.get('[data-test="user-register"]').click();
    cy.contains('div', 'Register');
  });

  it('using an existing account', () => {
    cy.visit('/');
    cy.get('[data-test="user-menu"]').click();
    cy.contains('div', 'Login');
  });

  it('logout', () => {
    cy.mockAuth('utente@test.com');
    cy.mockSupabase('matches', 'matches.json');
    cy.mockSupabase('archetypes', 'archetypes.json');
    cy.visit('/');
    cy.get('[data-test="user-menu"]').click();
    cy.get('[data-test="user-logout"]').click();
    cy.wait('@supabase-logout');
  });
});
