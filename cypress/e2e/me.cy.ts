describe("The deck page", () => {
    it("select your archetype in new match", () => {
        cy.authenticated('id', 'id@test.com');
        cy.mockAuth('id', 'id@test.com');
        cy.visit("/users/me");
        cy.contains("div", "Me");
    })
})