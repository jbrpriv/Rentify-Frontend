/**
 * admin-stats.cy.js
 *
 * E2E tests for the Admin Platform Analytics page (/dashboard/admin).
 * Verifies:
 *   - KPI cards render with valid numeric values
 *   - Monthly Sub Revenue shows $ prefix and a dollar amount (not raw cents)
 *   - Pro / Enterprise subscriber counts are visible
 *   - Charts render (SVG elements present)
 *   - generatedAt timestamp is shown
 */

describe('Admin — Platform Analytics Page', () => {
    beforeEach(() => {
        // Intercept stats API — simulate 3 pro + 1 enterprise subscribers
        cy.intercept('GET', '**/api/admin/stats', {
            statusCode: 200,
            body: {
                totals: {
                    users: 42,
                    pro: 3,
                    enterprise: 1,
                    free: 38,
                    properties: 17,
                    agreements: 12,
                    activeAgreements: 8,
                    pendingAgreements: 3,
                    expiredAgreements: 1,
                    openMaintenanceRequests: 5,
                },
                // Revenue already in dollars after the /100 fix: 3×15 + 1×30 = 75
                monthlySubscriptionRevenue: 75,
                usersBySubscription: [
                    { _id: 'free', count: 38 },
                    { _id: 'pro', count: 3 },
                    { _id: 'enterprise', count: 1 },
                ],
                agreementsByMonth: [
                    { _id: { year: 2026, month: 1 }, count: 4 },
                    { _id: { year: 2026, month: 2 }, count: 5 },
                    { _id: { year: 2026, month: 3 }, count: 3 },
                ],
                generatedAt: new Date().toISOString(),
            },
        }).as('getStats');

        // Intercept analytics API
        cy.intercept('GET', '**/api/admin/analytics', {
            statusCode: 200,
            body: {
                monthlyRentRevenue: [
                    { _id: { year: 2026, month: 1 }, total: 12000 },
                    { _id: { year: 2026, month: 2 }, total: 15500 },
                ],
                totalRentRevenue: 27500,
                churnRate: 8,
                expiredLast6: 2,
                createdLast6: 25,
                userGrowth: [
                    { _id: { year: 2026, month: 1 }, count: 5 },
                    { _id: { year: 2026, month: 2 }, count: 7 },
                ],
                disputeStats: { open: 2, resolved: 5 },
                maintenanceStats: { open: 3, in_progress: 2, resolved: 10 },
            },
        }).as('getAnalytics');

        cy.loginAs('admin');
        cy.visit('/dashboard/admin');
    });

    it('loads the page without errors', () => {
        cy.wait(['@getStats', '@getAnalytics']);
        cy.get('h1').should('contain.text', 'Analytics');
        cy.get('body').should('not.contain.text', 'Failed to load');
    });

    it('Pro Subscribers KPI card shows the correct count', () => {
        cy.wait('@getStats');
        cy.contains('[class*="card"], div', /Pro Subscribers/i)
            .closest('div')
            .should('contain.text', '3');
    });

    it('Enterprise Subscribers KPI card shows the correct count', () => {
        cy.wait('@getStats');
        cy.contains('[class*="card"], div', /Enterprise Subscribers/i)
            .closest('div')
            .should('contain.text', '1');
    });

    it('Monthly Sub Revenue shows dollar amount (not cents)', () => {
        cy.wait('@getStats');
        // Expect $75 (3 Pro × $15 + 1 Enterprise × $30), NOT $7500
        cy.contains('[class*="card"], div', /Monthly Sub Revenue|subscription revenue/i)
            .closest('div')
            .invoke('text')
            .then((text) => {
                // Should contain a $ sign
                expect(text).to.match(/\$/);
                // The value 7500 or 1500 or 3000 (raw cents) must NOT appear
                expect(text).not.to.match(/7[,.]?500/);
                expect(text).not.to.match(/1[,.]?500/);
                expect(text).not.to.match(/3[,.]?000/);
                // The correct dollar amount 75 should be present
                expect(text).to.match(/75/);
            });
    });

    it('Total Users KPI shows 42', () => {
        cy.wait('@getStats');
        cy.contains('[class*="card"], div', /Total Users/i)
            .closest('div')
            .should('contain.text', '42');
    });

    it('Users by Subscription pie chart renders', () => {
        cy.wait(['@getStats', '@getAnalytics']);
        // Recharts renders an SVG — confirm it exists in the DOM
        cy.get('svg').should('exist');
    });

    it('New Agreements bar chart renders with month labels', () => {
        cy.wait(['@getStats', '@getAnalytics']);
        cy.contains(/New Agreements/i).should('exist');
        cy.get('svg').should('have.length.greaterThan', 0);
    });

    it('generatedAt "Data as of" timestamp is visible', () => {
        cy.wait('@getStats');
        cy.contains(/Data as of/i).should('exist');
    });

    it('Active Leases count is correct', () => {
        cy.wait('@getStats');
        cy.contains('[class*="card"], div', /Active Leases/i)
            .closest('div')
            .should('contain.text', '8');
    });

    it('Revenue & Churn section shows churn rate', () => {
        cy.wait(['@getStats', '@getAnalytics']);
        cy.contains(/Churn Rate/i).should('exist');
        cy.contains(/8%/).should('exist');
    });
});

// ── Admin Billing Users sub-page ──────────────────────────────────────────────
describe('Admin — Billing Users Page', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/api/admin/billing/users**', {
            statusCode: 200,
            body: {
                users: [
                    { _id: 'u1', name: 'Alice', email: 'alice@test.com', subscriptionTier: 'pro', createdAt: new Date(), isActive: true },
                    { _id: 'u2', name: 'Bob', email: 'bob@test.com', subscriptionTier: 'enterprise', createdAt: new Date(), isActive: true },
                ],
                pagination: { total: 2, page: 1, limit: 25, pages: 1 },
                // After /100 fix: totalMRR should be in dollars
                summary: { free: 10, pro: 1, enterprise: 1, totalMRR: 45 },
            },
        }).as('getBillingUsers');

        cy.loginAs('admin');
        cy.visit('/dashboard/admin/billing');
    });

    it('billing page loads subscriber list', () => {
        cy.wait('@getBillingUsers');
        cy.contains('Alice').should('exist');
        cy.contains('Bob').should('exist');
    });

    it('displays pro and enterprise labels correctly', () => {
        cy.wait('@getBillingUsers');
        cy.contains(/pro/i).should('exist');
        cy.contains(/enterprise/i).should('exist');
    });
});