describe('Edit Video Page', () => {
    
    const teacherUser = {
      email: 'Teach@test.com',
      password: '123',
    };

    it('logs in and complete a course', () => {
      cy.visit('http://localhost:3000/authentication/login');
        cy.get('#email').type(teacherUser.email);
        cy.get('#password').type(teacherUser.password);
        cy.get('button[type="submit"]').click();
    
        cy.url().should('eq', 'http://localhost:3000/');
    
        cy.get('button[aria-label="Go to page 2"]').click();
  
        cy.get('section').find('div.cursor-pointer').first().click();
  
        cy.get('[data-cy="start-course"]').click();

        cy.get('[data-testid="question-0"]').find('input[type="checkbox"]').eq(1).check({ force: true });
        cy.get('[data-testid="submit-question-0"]').click();
        cy.get('[data-testid="submit-question-submit"]').click();

        cy.wait(1000);

        cy.get('[data-testid="question-0"]').find('input[type="checkbox"]').eq(1).check({ force: true });
        cy.get('[data-testid="submit-question-0"]').click();
        cy.get('[data-testid="question-1"]').find('input[type="checkbox"]').eq(2).check({ force: true });
        cy.get('[data-testid="submit-question-1"]').click();

        cy.wait(1000);

        cy.get('[data-testid="submit-question-submit"]').click();

        cy.wait(1000);

        cy.get('[data-cy="edit-Video-Page"]').click();

        cy.wait(1000);

        cy.get('[data-testid="text-editor"]').clear().type('React’s useEffect hook runs side effects after rendering and replaces lifecycle methods.');

        cy.wait(1000);

        cy.get('[data-cy="submit-code-page"]').click();
    });
  });
    