describe('Edit Course', () => {
    
    const teacherUser = {
      email: 'Teach@test.com',
      password: '123',
    };
  
    const newCourseTitle = 'React Course';

    it('logs in and complete a course', () => {
      cy.visit('http://localhost:3000/authentication/login');
        cy.get('#email').type(teacherUser.email);
        cy.get('#password').type(teacherUser.password);
        cy.get('button[type="submit"]').click();
    
        cy.url().should('eq', 'http://localhost:3000/');
    
        cy.get('button[aria-label="Go to page 2"]').click();
  
        cy.get('section').find('div.cursor-pointer').contains('Test Course').click();
  
        cy.get('[data-cy="edit-course"]').click();

        cy.get('[data-cy="Course-title"]').clear().type(newCourseTitle);
        cy.get('[data-cy="Course-Description"]').clear().type('New Test Course');

        cy.get('button').contains('Create Course').click();
    });
  });
    