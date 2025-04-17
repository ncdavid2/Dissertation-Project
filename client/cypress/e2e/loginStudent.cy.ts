describe('User Registration and Login Flow', () => {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    username: `testuser${Date.now()}`,
    email: `testuser${Date.now()}@example.com`,
    password: 'securePassword123',
  };

  it('registers and then logs in with the same user', () => {
    cy.visit('http://localhost:3000');

    cy.contains('Register').click();
    cy.get('#firstName').type(testUser.firstName);
    cy.get('#lastName').type(testUser.lastName);
    cy.get('#username').type(testUser.username);
    cy.get('#email').type(testUser.email);
    cy.get('#password').type(testUser.password);
    cy.get('#role').select('student');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/authentication/login');

    cy.get('#email').type(testUser.email);
    cy.get('#password').type(testUser.password);
    cy.get('button[type="submit"]').click();

    cy.url().should('eq', 'http://localhost:3000/');
  });
});
