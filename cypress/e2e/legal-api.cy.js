/// <reference types="cypress" />



const targetFormId = 'ae05f2af-f431-4e6e-8e81-ff5948cfecf7'

describe('API Test', () => {
  it('Login legal', () => {
    cy.loginLegalApp('legal-manager-sit@tcc-technology.com', 'P@ssw0rd!')
    cy.get('h1[data-order*="1"]').should('have.text', 'Signfile')
    cy.wait(5000)
    cy.intercept('POST', 'https://dev-legal-api.tcctech.app/api/agreement/inbox').as('getInbox');
    cy.contains('a > h1', /Agreements/).click()
     // รอให้ request เสร็จแล้วดึง response
     cy.wait('@getInbox').then((interception) => {
      const responseBody = interception.response.body;
      // ตรวจสอบว่า response มี items
      expect(responseBody.items).to.exist;
      
      const matchedItem = responseBody.items.find(item => item.formId === targetFormId);

      // ตรวจสอบว่าพบ item หรือไม่
      expect(matchedItem, `Should find item with formId ${targetFormId}`).to.exist;

      // ถ้าเจอ, ดึง contractNo มาใช้
      const contractNo = matchedItem.contractNo;
      cy.log(`Found contractNo: ${contractNo}`);
  })
  
  });
});



