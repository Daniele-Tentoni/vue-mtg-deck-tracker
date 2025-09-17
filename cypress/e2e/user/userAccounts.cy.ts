describe("In user accounts page", () => {
  it("should be opened from account menu", () => {
    cy.authenticated("id", "id@test.com");
    cy.mockAuth("id", "id@test.com");
    cy.visit("/");
    cy.get('[data-test="user-menu"]').click();
    cy.get('[data-test="user-me"]').click();
    cy.url().should("include", "/users/me");
    cy.contains("Me");
  });

  it("should display user accounts", () => {
    cy.visit("/users/me");
    cy.contains("table", "Provider");
    cy.contains("table", "User ID");
    cy.contains("table", "Email");
    cy.contains("table", "Created At");
    cy.contains("table", "Last Login At");

    cy.get('[data-test="add-account-button"]').click();
    cy.get('[data-test="link-account-button"]').click();
  });
});
