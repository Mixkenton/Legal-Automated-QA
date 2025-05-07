/// <reference types="cypress" />

// describe('API Test', () => {
//   it('Login legal', () => {
//     cy.loginLegalApp('legal-manager-sit@tcc-technology.com', 'P@ssw0rd!')
//     cy.get('h1[data-order*="1"]').should('have.text', 'Signfile')
//     cy.wait(5000)
//     cy.contains('a > h1', /Agreements/).click()
//   })
//   it('Fetch agreement inbox', () => {
//     cy.request({
//       method: 'POST',
//       url: 'https://dev-legal-api.tcctech.app/api/agreement/inbox',
//       headers: {
//         accept: 'application/json, text/plain, */*',
//         authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBY2NvdW50SWQiOiJlY2E2Y2EyZi05NzI3LTRlOGMtOGNhZS05ZDFiYWUxNGM2NDkiLCJFbWFpbCI6ImxlZ2FsLXN0YWZmQHRjYy10ZWNobm9sb2d5LmNvbSIsIkZ1bGxuYW1lIjoiTGVnYWwgU3RhZmYgRGV2IiwiQ29tcGFueU5hbWVUaCI6IuC4l-C4teC4i-C4teC4i-C4teC5gOC4l-C4hCIsIkNvbXBhbnlOYW1lRW4iOiJUQ0N0ZWNoIiwiUm9sZSI6IjMiLCJuYmYiOjE3NDY1MTI5NDksImV4cCI6MTc0NjUxNjU0OSwiaWF0IjoxNzQ2NTEyOTQ5fQ.UihNon8rh4ypo6rCmLC3l0iIvQLbivUEpJfB26xnMFU',
//         'content-type': 'application/json',
//         'x-tenant': 'default'
//       },
//       body: {
//         searchString: null,
//         assignTo: [],
//         owners: [],
//         companies: [],
//         parties: [],
//         processStatuses: [],
//         contactTypes: [],
//         pageNumber: 1,
//         pageSize: 9999
//       }
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       cy.log('Response:', JSON.stringify(response.body));
//     });
//   });
// });

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



