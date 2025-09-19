describe("In user accounts page", () => {
  it("should be opened from account menu", () => {
    cy.authenticated("id", "id@test.com");
    cy.mockAuth("id", "id@test.com");
    cy.mockSupabase('archetypes', 'archetypes.json');
    cy.mockSupabase('matches', 'matches.json');
    cy.visit("/");
    cy.get('[data-test="user-menu"]').click();
    cy.get('[data-test="user-me"]').click();
    cy.url().should("include", "/users/me");
    cy.contains("User control panel");
    cy.contains("a", "Identities").click();
    cy.url().should("include", "/users/me/identities");
    cy.contains("Identities");
  });

  it("should display user accounts", () => {
    cy.mockIdentity();
    cy.mockAuth("id", "id@test.com");
    cy.authenticated("id", "id@test.com");
    cy.visit("/users/me/identities");
    cy.contains("table", "Provider");
    cy.contains("table", "Email");
    cy.wait("@supabase-user");

    cy.get('[data-test="add-account-button"]').click();
    cy.get('[data-test="provider-selector"]').type("Twitch{downArrow}{enter}");
    cy.get('[data-test="link-account-button"]').click();
    cy.wait("@supabase-identity-get");
    cy.get('[data-test="unlink-button"]').click();
    cy.wait("@supabase-identity-delete");
  });
});
