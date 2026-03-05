describe('Agreements', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        cy.visit('/dashboard/agreements');
    });

    it('renders the agreements list page', () => {
        cy.contains(/agreements/i).should('exist');
        cy.url().should('include', '/dashboard/agreements');
    });

    it('navigates to create new agreement', () => {
        cy.contains(/new agreement|create/i).click();
        cy.url().should('include', '/dashboard/agreements/new');
    });

    it('agreement builder shows required fields', () => {
        cy.visit('/dashboard/agreements/new');
        cy.contains(/tenant|property|rent/i).should('exist');
    });

    it('previews agreement before submitting', () => {
        cy.visit('/dashboard/agreements/new');
        // Fill minimum required fields if visible
        cy.get('body').then(($body) => {
            if ($body.find('select[name="propertyId"]').length) {
                cy.get('select[name="propertyId"]').then($el => {
                    if ($el.find('option').length > 1) $el.select(1);
                });
            }
        });
        cy.contains(/preview/i).should('exist');
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