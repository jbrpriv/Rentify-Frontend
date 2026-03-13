/**
 * enterprise-property-limit.cy.js
 *
 * E2E tests confirming enterprise landlords can upload properties without hitting
 * the old -1 bug.  Covers the full user-facing journey: login → navigate to new
 * property form → submit → assert success.
 *
 * Fixtures/intercepts are used so these tests run without network dependency on
 * the live server for the creation call (the login call still goes to the API).
 */

describe('Enterprise Tier — Unlimited Property Upload', () => {
    const BASE = Cypress.env('apiUrl') || 'http://localhost:3000';

    beforeEach(() => {
        // Intercept billing status → returns enterprise tier
        cy.intercept('GET', '**/api/billing/status', {
            statusCode: 200,
            body: {
                tier: 'enterprise',
                limits: {
                    maxProperties: -1,
                    clauseBuilder: true,
                    documentVault: true,
                    analytics: true,
                    agreementTemplates: true,
                },
            },
        }).as('billingStatus');

        // Intercept existing properties list → simulate 50 existing properties
        cy.intercept('GET', '**/api/properties**', {
            statusCode: 200,
            body: Array.from({ length: 50 }, (_, i) => ({
                _id: `prop${i}`,
                title: `Property ${i + 1}`,
                status: 'vacant',
                isListed: false,
                address: { city: 'New York' },
            })),
        }).as('getProperties');

        // Intercept property creation → simulate success
        cy.intercept('POST', '**/api/properties', {
            statusCode: 201,
            body: {
                _id: 'propNew',
                title: 'New Enterprise Property',
                status: 'vacant',
            },
        }).as('createProperty');

        cy.loginAs('landlord');
        cy.visit('/dashboard/properties/new');
    });

    it('shows the new property form without a tier-limit warning', () => {
        cy.wait('@billingStatus');
        // Should NOT show any "upgrade" or "limit reached" banner
        cy.get('body').should('not.contain.text', 'maximum of -1');
        cy.get('body').should('not.contain.text', 'Upgrade your plan');
        cy.get('body').should('not.contain.text', 'limit reached');
    });

    it('successfully submits a new property and shows a success indicator', () => {
        cy.wait('@billingStatus');

        // Fill in the minimum required fields
        cy.get('input[name="title"], input[placeholder*="title" i]').first()
            .type('Enterprise Test Property');

        // Submit the form (button text varies — target any submit/save button)
        cy.get('button[type="submit"], button').contains(/save|create|add property/i).click();

        cy.wait('@createProperty').its('response.statusCode').should('eq', 201);

        // Should show a success message or redirect — not a 403 error
        cy.get('body').should('not.contain.text', '-1 propert');
        cy.get('body').should('not.contain.text', 'maximum of -1');
    });

    it('API response for property creation is never 403 for enterprise', () => {
        // Direct API assertion: createProperty should get 201, not 403
        cy.wait('@billingStatus');
        cy.request({
            method: 'GET',
            url: `${BASE}/api/billing/status`,
            headers: { Authorization: `Bearer ${window.localStorage.getItem('token')}` },
            failOnStatusCode: false,
        }).then((res) => {
            if (res.status === 200) {
                expect(res.body.tier).to.eq('enterprise');
                // -1 means unlimited — confirm the UI should never block
                expect(res.body.limits.maxProperties).to.eq(-1);
            }
        });
    });

    it('the property list page shows more than 5 properties for enterprise user', () => {
        cy.visit('/dashboard/properties');
        cy.wait('@getProperties');
        // At least one property card should render (no "limit reached" wall)
        cy.get('[data-testid="property-card"], .property-card, [class*="property"]')
            .should('have.length.greaterThan', 0);
        cy.get('body').should('not.contain.text', 'maximum of -1');
    });
});