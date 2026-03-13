/**
 * currency-display.cy.js
 *
 * E2E tests confirming all monetary values across the tenant-facing and
 * landlord-facing dashboard use $ (USD) and never show Rs. or PKR.
 *
 * Covers:
 *   - /dashboard/my-lease (tenant view)
 *   - /dashboard/agreements/:id (landlord view)
 *   - /pricing (public page)
 */

// ── Shared fixture ────────────────────────────────────────────────────────────
const AGREEMENT_FIXTURE = {
    _id: 'agr123',
    status: 'active',
    isPaid: true,
    property: {
        _id: 'prop1',
        title: '123 Main St — Apt 4B',
        address: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001' },
    },
    landlord: { _id: 'land1', name: 'John Landlord', email: 'john@test.com', phone: '555-1111' },
    tenant: { _id: 'ten1', name: 'Alice Tenant', email: 'alice@test.com' },
    financials: {
        rentAmount: 2500,
        depositAmount: 5000,
        lateFeeAmount: 150,
        lateFeeGracePeriodDays: 5,
    },
    term: {
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2025-12-31T00:00:00.000Z',
    },
    leaseTerms: { utilitiesIncluded: false, petsAllowed: false },
    rentEscalation: { enabled: false },
    auditLog: [],
    clauses: [],
    tenantDocuments: [],
};

// ── My Lease Page (tenant) ────────────────────────────────────────────────────
describe('My Lease Page — Currency Display (Tenant)', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/api/agreements/my-lease', {
            statusCode: 200,
            body: [AGREEMENT_FIXTURE],
        }).as('getMyLease');

        cy.loginAs('tenant');
        cy.visit('/dashboard/my-lease');
    });

    it('page loads without errors', () => {
        cy.wait('@getMyLease');
        cy.get('body').should('not.contain.text', 'Failed to load');
    });

    it('monthly rent displays with $ sign', () => {
        cy.wait('@getMyLease');
        cy.contains(/2[,.]?500/).should('exist');
        cy.get('body').invoke('text').then((text) => {
            // Must contain a $ somewhere near the rent amount
            expect(text).to.match(/\$2[,.]?500|\$\s*2[,.]?500/);
        });
    });

    it('security deposit displays with $ sign', () => {
        cy.wait('@getMyLease');
        cy.get('body').invoke('text').then((text) => {
            expect(text).to.match(/\$5[,.]?000|\$\s*5[,.]?000/);
        });
    });

    it('no "Rs." appears anywhere on the page', () => {
        cy.wait('@getMyLease');
        cy.get('body').invoke('text').then((text) => {
            expect(text).not.to.match(/Rs\./);
        });
    });

    it('no "PKR" appears anywhere on the page', () => {
        cy.wait('@getMyLease');
        cy.get('body').invoke('text').then((text) => {
            expect(text).not.to.include('PKR');
        });
    });

    it('no rupee symbol ₨ appears anywhere on the page', () => {
        cy.wait('@getMyLease');
        cy.get('body').invoke('text').then((text) => {
            expect(text).not.to.include('₨');
        });
    });
});

// ── Agreement Detail Page (landlord) ─────────────────────────────────────────
describe('Agreement Detail Page — Currency Display (Landlord)', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/api/agreements/agr123', {
            statusCode: 200,
            body: AGREEMENT_FIXTURE,
        }).as('getAgreement');

        cy.loginAs('landlord');
        cy.visit('/dashboard/agreements/agr123');
    });

    it('Monthly Rent label shows $ not Rs.', () => {
        cy.wait('@getAgreement');
        cy.contains(/Monthly Rent/i)
            .closest('div, tr')
            .invoke('text')
            .then((text) => {
                expect(text).to.match(/\$/);
                expect(text).not.to.match(/Rs\./);
            });
    });

    it('Security Deposit shows $ not Rs.', () => {
        cy.wait('@getAgreement');
        cy.contains(/Security Deposit/i)
            .closest('div, tr')
            .invoke('text')
            .then((text) => {
                expect(text).to.match(/\$/);
                expect(text).not.to.match(/Rs\./);
            });
    });

    it('Late Fee shows $ not Rs.', () => {
        cy.wait('@getAgreement');
        cy.contains(/Late Fee/i).should('exist');
        cy.get('body').invoke('text').then((text) => {
            expect(text).not.to.match(/Rs\.\s*150/);
            expect(text).to.match(/\$150/);
        });
    });

    it('full page body has no Rs. occurrences', () => {
        cy.wait('@getAgreement');
        cy.get('body').invoke('text').then((text) => {
            const matches = text.match(/Rs\./g) || [];
            expect(matches.length).to.eq(0);
        });
    });
});

// ── Pricing Page ──────────────────────────────────────────────────────────────
describe('Pricing Page — Currency Display', () => {
    it('FAQ mentions USD, not PKR', () => {
        cy.visit('/pricing');
        cy.get('body').should('not.contain.text', 'Pakistani Rupees');
        cy.get('body').should('not.contain.text', 'PKR');
        cy.contains(/USD|US Dollar/i).should('exist');
    });

    it('plan prices use $ symbol', () => {
        cy.visit('/pricing');
        cy.contains(/\$15/).should('exist');
        cy.contains(/\$30/).should('exist');
    });

    it('no Rs. on the pricing page', () => {
        cy.visit('/pricing');
        cy.get('body').invoke('text').then((text) => {
            expect(text).not.to.match(/Rs\./);
            expect(text).not.to.include('₨');
        });
    });
});

// ── Global currency scan across key routes ────────────────────────────────────
describe('Global Currency Scan — No Rs./PKR on key pages', () => {
    const PAGES_TO_SCAN = [
        '/pricing',
        '/dashboard/billing',
    ];

    PAGES_TO_SCAN.forEach((route) => {
        it(`no Rs. or PKR on ${route}`, () => {
            if (route.startsWith('/dashboard')) {
                cy.loginAs('landlord');
            }
            cy.visit(route);
            cy.get('body').invoke('text').then((text) => {
                expect(text).not.to.match(/Rs\./);
                expect(text).not.to.include('PKR');
                expect(text).not.to.include('₨');
            });
        });
    });
});