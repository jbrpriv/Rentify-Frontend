// cypress/e2e/offers.cy.js
// ─────────────────────────────────────────────────────────────────────────────
// Full E2E coverage for /dashboard/offers
//   • Tenant view  — "My Offers"
//   • Landlord view — "Incoming Offers"
//   • Active / History filter tabs
//   • Accept, Decline, Counter, Withdraw actions
// ─────────────────────────────────────────────────────────────────────────────

const mockTenantUser = { _id: 'ten_001', name: 'Ali Hassan', email: 'tenant@test.com', role: 'tenant' };
const mockLandlordUser = { _id: 'lnd_001', name: 'Test Landlord', email: 'landlord@test.com', role: 'landlord' };

const mockActiveOffer = {
    _id: 'off_001',
    status: 'pending',
    property: { _id: 'prop_001', title: 'Sunset Apartments', address: { city: 'Lahore' }, images: [] },
    tenant: { _id: 'ten_001', name: 'Ali Hassan', email: 'tenant@test.com' },
    history: [
        { round: 1, offeredBy: 'tenant', monthlyRent: 22000, securityDeposit: 44000, leaseDurationMonths: 12, note: 'First offer' },
    ],
    listedTerms: { monthlyRent: 25000, securityDeposit: 50000, leaseDurationMonths: 12 },
};

const mockCounteredOffer = {
    _id: 'off_002',
    status: 'countered',
    property: { _id: 'prop_002', title: 'Green Valley', address: { city: 'Karachi' }, images: [] },
    tenant: { _id: 'ten_001', name: 'Ali Hassan', email: 'tenant@test.com' },
    history: [
        { round: 1, offeredBy: 'tenant', monthlyRent: 20000, securityDeposit: 40000, leaseDurationMonths: 12 },
        { round: 2, offeredBy: 'landlord', monthlyRent: 23000, securityDeposit: 46000, leaseDurationMonths: 12, note: 'Counter from LL' },
    ],
    listedTerms: { monthlyRent: 25000, securityDeposit: 50000, leaseDurationMonths: 12 },
};

const mockDeclinedOffer = {
    _id: 'off_003',
    status: 'declined',
    property: { _id: 'prop_003', title: 'Old Town House', address: { city: 'Islamabad' }, images: [] },
    tenant: { _id: 'ten_001', name: 'Ali Hassan', email: 'tenant@test.com' },
    history: [
        { round: 1, offeredBy: 'tenant', monthlyRent: 18000, securityDeposit: 36000, leaseDurationMonths: 6 },
    ],
    listedTerms: { monthlyRent: 20000, securityDeposit: 40000, leaseDurationMonths: 12 },
};

const interceptNotifications = () => {
    cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { unreadCount: 0 } });
};

// ─────────────────────────────────────────────────────────────────────────────
// TENANT VIEW
// ─────────────────────────────────────────────────────────────────────────────
describe('Offers — Tenant View', () => {

    beforeEach(() => {
        cy.loginAsTenant();
        interceptNotifications();
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockTenantUser }).as('getMe');
        cy.intercept('GET', '/api/offers', {
            statusCode: 200,
            body: { offers: [mockActiveOffer, mockCounteredOffer, mockDeclinedOffer] },
        }).as('getOffers');
        cy.visit('/dashboard/offers');
        cy.wait('@getOffers');
    });

    it('renders "My Offers" heading for tenant', () => {
        cy.get('h1').contains(/my offers/i).should('be.visible');
    });

    it('shows Active and History filter tabs', () => {
        cy.contains('button', /active/i).should('exist');
        cy.contains('button', /history/i).should('exist');
    });

    it('shows active offer count in the Active tab', () => {
        cy.contains('button', /active/i).should('contain', '2');
    });

    it('renders active offer cards with property title and monthly rent', () => {
        cy.contains('Sunset Apartments').should('exist');
        cy.contains('Green Valley').should('exist');
    });

    it('does not show declined offer in Active tab by default', () => {
        cy.contains('Old Town House').should('not.exist');
    });

    it('switches to History tab and shows declined offer', () => {
        cy.contains('button', /history/i).click();
        cy.contains('Old Town House').should('exist');
    });

    it('shows status badge "Pending" on the first offer', () => {
        cy.contains('Sunset Apartments')
            .closest('div[style*="border-radius"]')
            .contains(/pending/i)
            .should('exist');
    });

    it('shows "Countered" badge on countered offer', () => {
        cy.contains('Green Valley')
            .closest('div[style*="border-radius"]')
            .contains(/countered/i)
            .should('exist');
    });

    it('expands an offer card on click', () => {
        cy.contains('Sunset Apartments').click();
        cy.contains('Round 1').should('exist');
    });

    it('tenant sees Withdraw button when it is their turn to act on countered offer', () => {
        cy.contains('Green Valley').click();
        cy.contains('button', /withdraw/i).should('exist');
    });

    it('tenant sees "Waiting for landlord" message on pending offer', () => {
        cy.contains('Sunset Apartments').click();
        cy.contains(/waiting for landlord/i).should('exist');
    });

    it('shows empty state message when no offers', () => {
        cy.intercept('GET', '/api/offers', { statusCode: 200, body: { offers: [] } }).as('emptyOffers');
        cy.visit('/dashboard/offers');
        cy.wait('@emptyOffers');
        cy.contains(/no active offers/i).should('exist');
    });

    it('empty state has a Browse properties link for tenants', () => {
        cy.intercept('GET', '/api/offers', { statusCode: 200, body: { offers: [] } }).as('emptyOffers');
        cy.visit('/dashboard/offers');
        cy.wait('@emptyOffers');
        cy.contains(/browse properties/i).should('have.attr', 'href', '/browse');
    });

    it('withdraw action calls DELETE /api/offers/:id', () => {
        cy.intercept('DELETE', '/api/offers/off_002', { statusCode: 200, body: { message: 'Withdrawn' } }).as('withdraw');
        cy.intercept('GET', '/api/offers', { statusCode: 200, body: { offers: [mockActiveOffer] } }).as('refreshOffers');
        cy.contains('Green Valley').click();
        cy.contains('button', /withdraw/i).click();
        cy.wait('@withdraw');
        cy.contains(/withdrawn successfully/i).should('exist');
    });

    it('counter back action calls POST /api/offers/:id/counter', () => {
        cy.intercept('POST', '/api/offers/off_002/counter', { statusCode: 200, body: { message: 'Counter sent' } }).as('counter');
        cy.intercept('GET', '/api/offers', { statusCode: 200, body: { offers: [mockCounteredOffer] } }).as('refresh');
        cy.contains('Green Valley').click();
        cy.contains('button', /counter back/i).click();
        cy.get('input[type="number"]').first().clear().type('21000');
        cy.contains('button', /send counter/i).click();
        cy.wait('@counter');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// LANDLORD VIEW
// ─────────────────────────────────────────────────────────────────────────────
describe('Offers — Landlord View', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptNotifications();
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockLandlordUser }).as('getMe');
        cy.intercept('GET', '/api/offers', {
            statusCode: 200,
            body: { offers: [mockActiveOffer] },
        }).as('getOffers');
        cy.visit('/dashboard/offers');
        cy.wait('@getOffers');
    });

    it('renders "Incoming Offers" heading for landlord', () => {
        cy.get('h1').contains(/incoming offers/i).should('be.visible');
    });

    it('shows landlord subheading with negotiation count', () => {
        cy.contains(/active negotiation/i).should('exist');
    });

    it('renders offer card with tenant name', () => {
        cy.contains('Ali Hassan').should('exist');
    });

    it('landlord sees Accept, Counter, and Decline buttons on their turn', () => {
        cy.contains('Sunset Apartments').click();
        cy.contains('button', /accept/i).should('exist');
        cy.contains('button', /counter/i).should('exist');
        cy.contains('button', /decline/i).should('exist');
    });

    it('decline action calls PUT /api/offers/:id/decline', () => {
        cy.intercept('PUT', '/api/offers/off_001/decline', { statusCode: 200, body: { message: 'Declined' } }).as('decline');
        cy.intercept('GET', '/api/offers', { statusCode: 200, body: { offers: [] } }).as('refresh');
        cy.contains('Sunset Apartments').click();
        cy.contains('button', /decline/i).click();
        cy.wait('@decline');
        cy.contains(/declined successfully/i).should('exist');
    });

    it('accept action navigates to agreement new page with offerId', () => {
        cy.contains('Sunset Apartments').click();
        cy.contains('button', /accept/i).click();
        cy.url().should('include', '/dashboard/agreements/new');
        cy.url().should('include', 'offerId=off_001');
    });

    it('landlord counter form submits to POST /api/offers/:id/counter', () => {
        cy.intercept('POST', '/api/offers/off_001/counter', { statusCode: 200, body: { message: 'Counter sent' } }).as('counter');
        cy.intercept('GET', '/api/offers', { statusCode: 200, body: { offers: [mockActiveOffer] } }).as('refresh');
        cy.contains('Sunset Apartments').click();
        cy.get('button').filter((_, el) => el.textContent.trim() === 'Counter').click();
        cy.contains('Your Counter-Offer').should('exist');
        cy.get('input[type="number"]').first().clear().type('24000');
        cy.contains('button', /send counter/i).click();
        cy.wait('@counter');
    });

    it('shows Refresh button and clicking it re-fetches offers', () => {
        cy.intercept('GET', '/api/offers', { statusCode: 200, body: { offers: [] } }).as('refresh');
        cy.contains('button', /refresh/i).click();
        cy.wait('@refresh');
    });
});