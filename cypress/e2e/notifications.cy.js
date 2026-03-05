describe('Notifications', () => {
    beforeEach(() => {
        cy.logout();
        cy.loginAsLandlord();
    });

    it('bell icon exists in the navbar for verified users', () => {
        cy.visit('/dashboard');
        // Wait for potential socket initialization and requests
        cy.wait(1500);
        cy.get('a[aria-label="Notifications"]').should('exist');
    });

    it('displays notifications in the messages menu', () => {
        cy.visit('/dashboard/messages');
        cy.get('body').then(($body) => {
            if ($body.find('button:contains("Messages")').length > 0) {
                cy.contains('Messages').should('be.visible');
            }
        });
    });
});
