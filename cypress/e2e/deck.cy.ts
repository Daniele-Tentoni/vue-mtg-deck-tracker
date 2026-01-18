describe("The deck page", () => {
    it("select your archetype in new match", () => {
        cy.authenticated('id', 'id@test.com');
        cy.mockAuth('id', 'id@test.com');
        cy.mockArchByName('White+Weenie', 'supa-ww');
        cy.mockMatches();
        cy.visit("/pauper/White Weenie");
        cy.wait('@supa-ww');
        cy.get('[data-test="new-match-button-dialog"]').click();
        cy.get('[data-test="your-deck-field"]');
    })
})