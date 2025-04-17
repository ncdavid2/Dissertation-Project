describe('Update Settings After Login', () => {
    const testUser = {
        email: 'ncdavid@web.de',
        password: '123',
      };

    it('logs in and updates password and bio', () => {
        cy.visit('http://localhost:3000/authentication/login');

        cy.get('#email').type(testUser.email);
        cy.get('#password').type(testUser.password);
        cy.get('button[type="submit"]').click();
        
        cy.contains(testUser.email.split('@')[0], { timeout: 10000 });
        
        cy.get('[data-testid="dropdown-toggle"]').click();
        
        cy.contains('button', 'Settings').click();
        
        cy.url().should('include', '/settings');
        
        cy.get('input#password').clear().type('1234');
        cy.get('textarea#bio').clear().type('Updated bio from Cypress test.');
        cy.contains('Save Changes').click();
        
        cy.on('window:alert', (text) => {
          expect(text).to.contains('Profile updated successfully');
        });
        
        cy.url().should('eq', 'http://localhost:3000/');
    });
  });
  