describe('Teacher Registration and Login Flow', () => {
    const teacherUser = {
      firstName: 'Teach',
      lastName: 'Er',
      username: `teacher${Date.now()}`,
      email: `teacher${Date.now()}@example.com`,
      password: 'superSecure123!',
      accessPassword: 'teach2025',
    };
  
    it('registers a teacher and logs in', () => {
      cy.visit('http://localhost:3000/authentication/register');
  
      cy.get('#firstName').type(teacherUser.firstName);
      cy.get('#lastName').type(teacherUser.lastName);
      cy.get('#username').type(teacherUser.username);
      cy.get('#email').type(teacherUser.email);
      cy.get('#password').type(teacherUser.password);
      cy.get('#role').select('teacher');
      cy.get('#teacherPassword').type(teacherUser.accessPassword);
      cy.get('button[type="submit"]').click();
  
      cy.url().should('include', '/authentication/login');
  
      cy.get('#email').type(teacherUser.email);
      cy.get('#password').type(teacherUser.password);
      cy.get('button[type="submit"]').click();
  
      cy.url().should('eq', 'http://localhost:3000/');
    });
  });
  