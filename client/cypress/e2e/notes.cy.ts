describe('Login and Save Notes', () => {
    const testUser = {
      email: 'ncdavid@web.de',
      password: '123',
    };
  
    const testNoteContent = `Test note written at ${new Date().toISOString()}`;
  
    it('logs in and saves notes', () => {
      cy.visit('http://localhost:3000/authentication/login');
  
      cy.get('#email').type(testUser.email);
      cy.get('#password').type(testUser.password);
      cy.get('button[type="submit"]').click();
  
      cy.url().should('eq', 'http://localhost:3000/');
  
      cy.visit('http://localhost:3000/main_page/notes');
  
      cy.get('textarea').clear().type(testNoteContent);
  
      cy.contains('Save').click();
  
      cy.reload();
      cy.get('textarea').should('have.value', testNoteContent);
    });
  });
  