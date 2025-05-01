describe('Teacher creates a course', () => {
  const teacherUser = {
    email: 'Teach@test.com',
    password: '123',
  };

  it('logs in, creates, and deletes a course', () => {
    cy.visit('http://localhost:3000/authentication/login');
    cy.get('#email').type(teacherUser.email);
    cy.get('#password').type(teacherUser.password);
    cy.get('button[type="submit"]').click();

    cy.url().should('eq', 'http://localhost:3000/');

    cy.contains('button', 'Create Course Overview').click();
    cy.url().should('include', '/create_course');
    cy.get('input[placeholder="Enter course title"]').type('Test Course');
    cy.get('textarea[placeholder="Enter course description"]').type('A Test Course');
    cy.contains('button', 'Create Course').click();
    cy.url().should('eq', 'http://localhost:3000/');

  });
});
