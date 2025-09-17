describe('Users could authenticate', () => {
  it('creating a new account', () => {
    cy.visit('/');
    cy.get('[data-test="user-menu"]').click();
    cy.get('[data-test="user-register"]').click();
    cy.contains('div', 'Register');
    cy.get('[data-test="close-button"]').click();
  });

  it('login using an existing account', () => {
    cy.visit('/');
    cy.get('[data-test="user-menu"]').click();
    cy.get('[data-test="user-login"]').click();
    cy.contains('div', 'Login');
    cy.get('[data-test="close-button"]').click();
  });

  it('logout', () => {
    cy.authenticated('id', 'id@test.com');
    cy.mockAuth('id', 'id@test.com');
    cy.mockSupabase('matches', 'matches.json');
    cy.mockSupabase('archetypes', 'archetypes.json');
    cy.visit('/');
    cy.get('[data-test="user-menu"]').click();
    cy.get('[data-test="user-logout"]').click();
    cy.wait('@supabase-logout');
  });
});
