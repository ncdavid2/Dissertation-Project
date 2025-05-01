describe('Teacher creates a course Page', () => {
      
    const teacherUser = {
      email: 'Teach@test.com',
      password: '123',
    };
  
    it('logs in and creates a new Screenshot Explanation Page with a React explanation', () => {
      cy.visit('http://localhost:3000/authentication/login');
      cy.get('#email').type(teacherUser.email);
      cy.get('#password').type(teacherUser.password);
      cy.get('button[type="submit"]').click();
  
      cy.url().should('eq', 'http://localhost:3000/');
  
      cy.get('button[aria-label="Go to page 2"]').click();
  
      cy.get('section').find('div.cursor-pointer').contains('Test Course').click();
  
      cy.get('[data-cy="add-page-button"]').click();
  
      cy.get('[data-cy="code-page-option"]').click();
  
      cy.get('textarea[placeholder="Write your text here"]').type(
        'The useEffect hook lets you run side effects in function components, such as fetching data or updating the DOM.'
      );
  
      cy.get('[data-cy="submit-code-page"]').click();
    });
  });
  