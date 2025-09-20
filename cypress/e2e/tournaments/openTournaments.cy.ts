describe('In tournaments page', () => {
  it('should be redirected to challonge on login', () => {
    cy.authenticated('id', 'id@test.com');
    cy.mockAuth('id', 'id@test.com');
    cy.intercept('GET', '/functions/v1/challonge-proxy?path=*', {
      statusCode: 401,
      body: { message: 'Utente non loggato' },
    }).as('fail-auth');
    cy.visit('/tournaments');
    cy.contains('h3', 'Tournaments');
    cy.contains('div', 'Loading');
    cy.wait('@fail-auth');
    cy.contains('div', 'Usa questo pulsante per collegare il tuo account Challonge.');
    cy.contains('button', 'Login').click();
    cy.url().should('include', 'challonge.com');
  });

  it('should display tournaments if logged in', () => {
    cy.authenticated('id', 'id@test.com');
    cy.mockAuth('id', 'id@test.com');
    cy.intercept('GET', '/functions/v1/challonge-proxy?path=*', {
      statusCode: 200,
      body: {
        data: {
          id: '1',
          type: 'user',
          attributes: {
            email: 'daniele.tentoni.1996@gmail.com',
            username: 'Daniele_Tentoni',
            image_url: 'https://assets.challonge.com/images/default_avatar.png',
          },
        },
      },
    }).as('good-auth');
    cy.visit('/tournaments');
    cy.wait('@good-auth');
    cy.contains('div', 'Daniele_Tentoni');
    cy.contains('div', 'daniele.tentoni.1996@gmail.com');
    cy.contains('button', 'GET T')
  });
});
