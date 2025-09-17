/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare global {
  namespace Cypress {
    interface Chainable {
      authenticated(id: string, email: string): Chainable<void>;
      mockAuth(id: string, email: string): Chainable<void>;
      /**
       * Mocka una tabella Supabase (GET /rest/v1/<table>)
       * @param table Nome tabella
       * @param data Array di oggetti da restituire
       */
      mockSupabase(table: string, fixture: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add(
  'authenticated',
  (id: string = 'uuid-utente', email: string = 'utente@test.com') => {
    cy.session(email, () => {
      window.localStorage.setItem(
        'sb-awvhzmqrqxrqlsohpsqr-auth-token',
        JSON.stringify({
          access_token: '1',
          expires_in: 3600,
          expires_at: Date.now() + 3600,
          refresh_token: 'uwb6hkj2ulsv',
          token_type: 'bearer',
          user: {
            id,
            aud: 'authenticated',
            role: 'authenticated',
            email,
            email_confirmed_at: '2025-08-18T21:20:47.553901Z',
            phone: '',
            confirmation_sent_at: '2025-08-18T21:19:18.115572Z',
            confirmed_at: '2025-08-18T21:20:47.553901Z',
            recovery_sent_at: '2025-08-30T22:40:52.37211Z',
            last_sign_in_at: '2025-08-30T22:42:00.764008Z',
            app_metadata: { provider: 'email', providers: ['email'] },
            user_metadata: {
              email,
              email_verified: true,
              phone_verified: false,
              sub: id,
            },
            identities: [
              {
                identity_id: '1',
                id,
                user_id: id,
                identity_data: {
                  email,
                  email_verified: true,
                  phone_verified: false,
                  sub: id,
                },
                provider: 'email',
                last_sign_in_at: '2025-08-18T21:19:18.090742Z',
                created_at: '2025-08-18T21:19:18.090811Z',
                updated_at: '2025-08-18T21:19:18.090811Z',
                email,
              },
            ],
            created_at: '2025-08-18T21:19:18.043531Z',
            updated_at: '2025-08-30T22:42:00.796028Z',
            is_anonymous: false,
          },
        }),
      );
    });

    // https://awvhzmqrqxrqlsohpsqr.supabase.co/auth/v1/logout?scope=global
    cy.intercept('POST', '/auth/v1/logout*', (req) => {
      window.localStorage.removeItem('sb-awvhzmqrqxrqlsohpsqr-auth-token');
      req.reply({ statusCode: 200 });
    }).as('supabase-logout');
  },
);

Cypress.Commands.add(
  'mockAuth',
  (id: string = 'uuid-utente', email: string = 'utente@test.com') => {
    cy.intercept('POST', '/auth/v1/token*', {
      statusCode: 200,
      body: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: { id, email },
      },
    }).as('supabase-login');

    // opzionale: intercetta la GET user (se usi supabase.auth.getUser)
    cy.intercept('GET', '/auth/v1/user', {
      statusCode: 200,
      body: { id, email },
    }).as('supabase-user');
  },
);

Cypress.Commands.add('mockSupabase', (table: string, fixture: string) => {
  cy.intercept('GET', `/rest/v1/${table}*`, {
    statusCode: 200,
    fixture,
  }).as(`supabase-${table}`);
});

export {};
