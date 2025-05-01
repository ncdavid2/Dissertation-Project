describe('Login and Save Notes', () => {
    const testUser = {
      email: 'ncdavid@web.de',
      password: '123',
    };
  
    it('logs in and saves notes', () => {
      cy.visit('http://localhost:3000/authentication/login');
  
      cy.get('#email').type(testUser.email);
      cy.get('#password').type(testUser.password);
      cy.get('button[type="submit"]').click();
      
      cy.get('button').contains('Courses').click();
    });
});
  