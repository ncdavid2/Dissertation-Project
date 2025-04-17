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

        cy.get('[data-cy="edit-Video-Page"]').click();

        const updatedAnswers = [
            "To handle side effects in functional components",
            "To define global styles",
            null, 
            null  
          ];
          
          updatedAnswers.forEach((text, i) => {
            const input = cy.get(`input[placeholder="Answer ${i + 1}"]`);
            if (text) {
              input.clear().type(text);
            }
        });

        cy.get('input[type="radio"]').eq(0).check({ force: true });

        cy.get('[data-cy="submit-video-page"]').click();
    });
  });
    