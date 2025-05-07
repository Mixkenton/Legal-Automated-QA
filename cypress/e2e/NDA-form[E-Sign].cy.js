/// <reference types="cypress" />

describe('Legal create new request "NDA" form', () => {
    it('Login as user with permission', () => {
        // Login
        cy.loginLegalApp('p.sangkhawasee@gmail.com', 'Gdramix2589@')
        cy.get('h1[data-order*="1"]').should('have.text', 'Signfile')
        cy.wait(5000)
        // Click "Create new form" button
        cy.contains('button', /Create new form|สร้างเอกสารใหม่/).click()


        // Select Company
        cy.get('[data-path*="company"]').click()
        cy.contains('div[role*="option"]', /ทีซีซีเทค|TCCtech/).click()
        cy.get('[data-path*="company"]')
            .invoke('val')
            .should('match', /ทีซีซีเทค|TCCtech/)

        // Select Party
        cy.get('[data-path*="party"]').click()
        cy.contains('div[role*="option"]', /Customer/).click()
        cy.get('[data-path*="party"]').should('have.value', 'Customer')

        // Select Contract Type {NDA}
        cy.get('[data-path*="contractType"]').click()
        cy.contains('div[role*="option"]', /NDA/).click()
        cy.get('[data-path*="contractType"]').should('have.value', 'NDA')

        // Click "Create Form" button
        cy.contains('button', /Create Form|สร้างฟอร์ม/).click()
        cy.contains('h1', /Form Information|รายละเอียดข้อมูลในเอกสาร/).should('be.visible')

        //Fill Input General Information
        cy.get('[data-path*="customers.0.info_customer_name"]').type('QA-Automated')
        cy.get('[data-path*="customers.0.info_customer_email"]').type('QA.automated@gmail.com')
        cy.get('[data-path*="customers.0.info_customer_company_name"]').type('QA-Automated-Company')
        cy.get('[data-path*="customers.0.info_customer_address"]').type('QA-Automated-169/2')

        //Fill Input Project Name
        cy.get('[data-path*="info_project_name"]').type('QA-Automated-Bot-Test')

        //Upload Attach Document
        // อัปโหลดไฟล์โดยระบุ path ไปยัง input[type="file"]
        cy.contains('button', /Upload|อัปโหลดไฟล์/).click()
        cy.get('input[type="file"]').selectFile('cypress/src/คู่มือการพิมพ์หนังสือราชการ.pdf', { force: true })
        cy.contains('p', /คู่มือการพิมพ์หนังสือราชการ.pdf/).should('be.visible')


        //Fill Input Authorized 
        cy.get('[data-path*="signers.0.signer_name"]').focus().type('Mix QA')
        cy.contains('div[role="option"]', 'Mix QA').click()
        cy.get('[data-path*="witnesses.0.witness_name"]').focus().type('Mix QA 365{downarrow}{enter}')

        //Submit form
        cy.intercept('POST', 'https://dev-legal-api.tcctech.app/api/form/save-draft').as('saveDraft');
        cy.contains('button', /Send Request Form|ส่งแบบฟอร์มคำขอเอกสาร/).click()

        // รอให้ request จบ แล้วดึง response
        cy.wait('@saveDraft').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            cy.log('Response body:', JSON.stringify(interception.response.body));

            // ถ้าอยากดึงค่าเฉพาะ เช่น formId
            const returnedFormId = interception.response.body.formId;
            cy.log('Returned FormId:', returnedFormId);

            // เก็บค่าเป็น alias
            cy.wrap(returnedFormId).as('targetFormId');

            // หรือทำ assertion ตรวจสอบ
            expect(returnedFormId).to.exist;
            cy.wait(5000)
        })

    })

    describe('E-Sign Adobe process', () => {
        it('Legal Manager Approve to Legal Staff', function ()  {
            cy.loginLegalApp('legal-manager-sit@tcc-technology.com', 'P@ssw0rd!')
            cy.get('h1[data-order*="1"]').should('have.text', 'Signfile')
            cy.wait(5000)

            cy.intercept('POST', 'https://dev-legal-api.tcctech.app/api/agreement/inbox').as('getInbox');
            cy.contains('a > h1', /Agreements/).click()

            cy.wait('@getInbox').then((interception) => {
                const responseBody = interception.response.body;
                const targetFormId = this.targetFormId;
                expect(responseBody.items).to.exist;

                const matchedItem = responseBody.items.find(item => item.formId === targetFormId);
                expect(matchedItem, `Should find item with formId ${targetFormId}`).to.exist;

                const contractNo = matchedItem.contractNo;
                cy.log(`Found contractNo: ${contractNo}`);

                cy.get('input[data-variant="default"][placeholder="Search"]').focus().type(contractNo)
                cy.contains('p', contractNo).should('be.visible')
            })
            

        });
    });

})
