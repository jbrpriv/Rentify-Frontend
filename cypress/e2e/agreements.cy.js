describe('Agreements', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        cy.visit('/dashboard/agreements');
    });

    it('renders the agreements list page', () => {
        cy.contains(/agreements/i).should('exist');
        cy.url().should('include', '/dashboard/agreements');
    });

    it('agreement builder directly blocks draft without offerId', () => {
        cy.visit('/dashboard/agreements/new');
        // Because there is no offerId in the URL, the manual form shouldn't be accessible
        cy.contains(/Start from an Offer/i).should('exist');
        cy.get('input[type="date"]').should('not.exist');
    });

    it('shows agreement history tab', () => {
        cy.visit('/dashboard/agreements');
        cy.get('body').then(($body) => {
            // If there are agreements, click the first one's history link
            if ($body.find('[data-testid="agreement-row"]').length) {
                cy.get('[data-testid="agreement-row"]').first().click();
            }
        });
    });

    it('agreement templates page loads', () => {
        cy.visit('/dashboard/agreement-templates');
        cy.contains(/templates/i).should('exist');
    });
});

describe('Signing Flow (Tenant)', () => {

    beforeEach(() => {
        cy.loginAsTenant();
    });

    it('tenant can view my-lease page', () => {
        cy.visit('/dashboard/my-lease');
        cy.contains(/lease|agreement/i).should('exist');
    });

    it('sign page requires a valid token', () => {
        cy.visit('/sign/invalid-token-123');
        cy.contains(/invalid|expired|not found/i).should('exist');
    });
});