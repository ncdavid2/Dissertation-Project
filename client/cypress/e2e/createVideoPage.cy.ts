describe('Teacher creates a course Page', () => {

    const teacherUser = {
      email: 'Teach@test.com',
      password: '123',
    };
  
    it('logs in and creates a new course Page', () => {
      cy.visit('http://localhost:3000/authentication/login');
      cy.get('#email').type(teacherUser.email);
      cy.get('#password').type(teacherUser.password);
      cy.get('button[type="submit"]').click();
  
      cy.url().should('eq', 'http://localhost:3000/');
  
      cy.get('button[aria-label="Go to page 2"]').click();

      cy.get('section')
      .find('div.cursor-pointer')
      .contains('Test Course')
      .click();

      cy.get('[data-cy="add-page-button"]').click();

      cy.get('[data-cy="video-page-option"]').click();

      cy.get('input[placeholder="Enter your question"]').type("What is the purpose of useEffect in React?");

      const answers = [
        "To define global styles",
        "To handle side effects in functional components",
        "To fetch data only on server-side",
        "To define Redux reducers"
      ];

      answers.forEach((text, i) => {
        cy.get(`input[placeholder="Answer ${i + 1}"]`).type(text);
      });

      cy.get('input[type="radio"]').eq(1).check({ force: true });

      cy.get('[data-cy="submit-video-page"]').click();
    });
  });
  