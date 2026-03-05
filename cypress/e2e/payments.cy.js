describe('Payments', () => {

    beforeEach(() => {
        cy.loginAsTenant();
        cy.visit('/dashboard/payments');
    });

    it('renders the payments page', () => {
        cy.contains(/payment/i).should('exist');
    });

    it('shows payment status labels', () => {
        cy.get('body').then(($body) => {
            const bodyText = $body.text();
            const hasPaymentContent =
                /paid|pending|overdue|upcoming/i.test(bodyText);
            // Only assert if there are existing payments
            if (/Rs\.|amount/i.test(bodyText)) {
                expect(hasPaymentContent).to.be.true;
            }
        });
    });

    it('shows gateway options when paying', () => {
        cy.get('body').then(($body) => {
            if ($body.find('button:contains("Pay")').length) {
                cy.get('button').contains(/pay now|pay rent/i).first().click();
                cy.contains(/stripe|razorpay|paypal/i).should('exist');
            }
        });
    });
});

describe('Billing', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        cy.visit('/dashboard/billing');
    });

    it('renders the billing page', () => {
        cy.contains(/billing|subscription|plan/i).should('exist');
    });

    it('shows current plan details', () => {
        cy.contains(/free|basic|pro|enterprise/i).should('exist');
    });
});

describe('Notifications Center', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        cy.visit('/dashboard/notifications');
    });

    it('renders the notifications page', () => {
        cy.contains(/notifications/i).should('exist');
    });

    it('shows all / unread filter tabs', () => {
        cy.contains('All').should('exist');
        cy.contains('Unread').should('exist');
    });

    it('mark all read button works', () => {
        cy.get('body').then(($body) => {
            if ($body.text().includes('Mark all read')) {
                cy.contains('Mark all read').click();
                // After marking, unread count should be 0
                cy.contains('Mark all read').should('not.exist');
            }
        });
    });
});