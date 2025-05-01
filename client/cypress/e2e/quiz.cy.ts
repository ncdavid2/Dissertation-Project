describe('Practice Question Flow', () => {
    const testUser = {
        email: 'ncdavid@web.de',
        password: '123',
      };

    it('loads a question, submits an answer, and displays result', () => {
      cy.visit('http://localhost:3000/authentication/login');
  
      cy.get('#email').type(testUser.email);
      cy.get('#password').type(testUser.password);
      cy.get('button[type="submit"]').click();
      cy.visit('http://localhost:3000/');

      cy.url().should('eq', 'http://localhost:3000/');

      cy.visit('http://localhost:3000/main_page/practice');
  
      cy.contains('Loading question...').should('not.exist');
  
      cy.get('button')
        .contains(/.+/) 
        .first()
        .click();
  
      cy.contains('Submit').click();
      cy.contains('Next Question').click();

      cy.get('button')
        .contains(/.+/) 
        .first()
        .click();

      cy.contains('Submit').click();
      cy.contains('Next Question').click();

      cy.get('button')
        .contains(/.+/) 
        .first()
        .click();

      cy.contains('Submit').click();
  
      cy.contains('See Results').click();
    });
  });
  