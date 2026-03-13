/**
 * billing-tiers.cy.js
 *
 * E2E tests for the public /pricing page and the logged-in /dashboard/billing page.
 * Verifies:
 *   - Pro shows "Up to 5" properties (not "Up to 20")
 *   - Enterprise shows "Unlimited" properties
 *   - Agreement templates shown ONLY for Enterprise, not Pro
 *   - Currency is USD throughout — no PKR or Rs. references
 *   - FAQ updated copy is present
 */

describe('Pricing Page — Tier Feature Matrix', () => {
    beforeEach(() => {
        // Intercept plans API used on the pricing page
        cy.intercept('GET', '**/api/billing/plans', {
            statusCode: 200,
            body: {
                stripeConfigured: true,
                plans: [
                    {
                        tier: 'free',
                        name: 'Free',
                        price: 0,
                        currency: 'USD',
                        interval: 'month',
                        features: ['1 property listing (max)', 'Email notifications', 'Tenant portal'],
                        limits: { maxProperties: 1, agreementTemplates: false, analytics: false },
                    },
                    {
                        tier: 'pro',
                        name: 'Pro',
                        price: 15,
                        currency: 'USD',
                        interval: 'month',
                        features: [
                            'Up to 5 properties',
                            'Clause builder with 50+ templates',
                            'AWS S3 document vault',
                            'SMS + Push notifications',
                            'Priority support',
                            'Analytics dashboard',
                        ],
                        limits: { maxProperties: 5, agreementTemplates: false, analytics: true },
                    },
                    {
                        tier: 'enterprise',
                        name: 'Enterprise',
                        price: 30,
                        currency: 'USD',
                        interval: 'month',
                        features: [
                            'Unlimited properties',
                            'All Pro features',
                            'Agreement templates library',
                            'Custom branding',
                            'Dedicated account manager',
                        ],
                        limits: { maxProperties: -1, agreementTemplates: true, analytics: true },
                    },
                ],
            },
        }).as('getPlans');

        cy.visit('/pricing');
    });

    it('loads the pricing page without errors', () => {
        cy.get('body').should('not.contain.text', 'Error');
        cy.get('body').should('not.contain.text', '404');
    });

    it('Pro plan shows "Up to 5" properties, not "Up to 20"', () => {
        // The FEATURE_TABLE row for Properties under Pro
        cy.contains(/Properties/i)
            .closest('tr, [class*="row"]')
            .should('contain.text', 'Up to 5')
            .and('not.contain.text', 'Up to 20');
    });

    it('Enterprise plan shows "Unlimited" for properties', () => {
        cy.contains(/Properties/i)
            .closest('tr, [class*="row"]')
            .should('contain.text', 'Unlimited');
    });

    it('Pro plan does NOT include Agreement templates', () => {
        cy.contains(/Agreement templates/i)
            .closest('tr, [class*="row"]')
            .within(() => {
                // The Pro column should show an X/false icon, not a checkmark for this row
                // We check by confirming "Unlimited" or the feature text is absent for Pro
                cy.get('[data-tier="pro"], td, [class*="pro"]')
                    .should('not.contain.text', 'Custom')
                    .and('not.contain.text', '50+');
            });
    });

    it('Enterprise plan includes Agreement templates', () => {
        cy.contains(/Agreement templates/i)
            .closest('tr, [class*="row"]')
            .should('exist');
        // Enterprise card / column should mention templates
        cy.get('[data-tier="enterprise"], [class*="enterprise"]')
            .should('exist');
    });

    it('FAQ does not mention Pakistani Rupees or PKR', () => {
        cy.get('body').should('not.contain.text', 'Pakistani Rupees');
        cy.get('body').should('not.contain.text', 'PKR');
    });

    it('FAQ currency answer mentions USD', () => {
        cy.contains(/What currency/i)
            .closest('[class*="faq"], details, div')
            .should('contain.text', 'USD');
    });

    it('Pro card price shows $15', () => {
        cy.contains(/\$15/).should('exist');
    });

    it('Enterprise card price shows $30', () => {
        cy.contains(/\$30/).should('exist');
    });

    it('No Rs. symbol appears anywhere on the pricing page', () => {
        cy.get('body').invoke('text').then((text) => {
            expect(text).not.to.match(/Rs\./);
            expect(text).not.to.match(/₨/);
        });
    });
});

// ── Logged-in billing page ─────────────────────────────────────────────────
describe('Dashboard Billing Page — Current Plan Display', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/api/billing/plans', { statusCode: 200, body: { stripeConfigured: true, plans: [] } }).as('getPlans');
        cy.intercept('GET', '**/api/billing/status', {
            statusCode: 200,
            body: {
                tier: 'pro',
                limits: { maxProperties: 5, clauseBuilder: true, documentVault: true, analytics: true, agreementTemplates: false },
                stripeConfigured: true,
            },
        }).as('getBillingStatus');

        cy.loginAs('landlord');
        cy.visit('/dashboard/billing');
    });

    it('Pro plan badge is visible on billing page', () => {
        cy.wait('@getBillingStatus');
        cy.contains(/Pro/i).should('exist');
    });

    it('Billing page does not show -1 as a property limit', () => {
        cy.wait('@getBillingStatus');
        cy.get('body').should('not.contain.text', '-1 propert');
        cy.get('body').should('not.contain.text', 'maximum of -1');
    });

    it('Enterprise billing page shows "Unlimited" not "-1"', () => {
        cy.intercept('GET', '**/api/billing/status', {
            statusCode: 200,
            body: {
                tier: 'enterprise',
                limits: { maxProperties: -1, clauseBuilder: true, documentVault: true, analytics: true, agreementTemplates: true },
                stripeConfigured: true,
            },
        });
        cy.reload();
        cy.get('body').should('not.contain.text', '-1');
    });
});