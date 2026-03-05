// cypress/e2e/properties.cy.js
// ─────────────────────────────────────────────────────────────────────────────
// Full E2E coverage for /dashboard/properties
//   • Role guard — non-landlord redirected
//   • Empty state
//   • Property cards with actions
//   • Publish / Unpublish modal
//   • Archive / Restore modal
//   • Delete modal
// ─────────────────────────────────────────────────────────────────────────────

const mockLandlordUser = { _id: 'lnd_001', name: 'Test Landlord', email: 'landlord@test.com', role: 'landlord' };
const mockTenantUser = { _id: 'ten_001', name: 'Ali Hassan', email: 'tenant@test.com', role: 'tenant' };

const mockVacantProperty = {
    _id: 'prop_001',
    title: 'Sunset Apartments',
    status: 'vacant',
    isListed: false,
    isArchived: false,
    type: 'apartment',
    address: { city: 'Lahore', state: 'Punjab' },
    financials: { monthlyRent: 25000 },
    images: [],
    managedBy: null,
    pmInvitation: null,
};

const mockListedProperty = {
    _id: 'prop_002',
    title: 'Green Valley House',
    status: 'vacant',
    isListed: true,
    isArchived: false,
    type: 'house',
    address: { city: 'Islamabad', state: 'ICT' },
    financials: { monthlyRent: 35000 },
    images: [],
    managedBy: null,
    pmInvitation: null,
};

const mockOccupiedProperty = {
    _id: 'prop_003',
    title: 'Occupied Unit',
    status: 'occupied',
    isListed: false,
    isArchived: false,
    type: 'apartment',
    address: { city: 'Karachi', state: 'Sindh' },
    financials: { monthlyRent: 20000 },
    images: [],
    managedBy: null,
    pmInvitation: null,
};

const interceptNotifications = () => {
    cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { unreadCount: 0 } });
};

// ─────────────────────────────────────────────────────────────────────────────
// ROLE GUARD
// ─────────────────────────────────────────────────────────────────────────────
describe('Properties — Role Guard', () => {

    it('redirects a tenant away from /dashboard/properties', () => {
        cy.loginAsTenant();
        interceptNotifications();
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockTenantUser }).as('getMe');
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [] });
        cy.visit('/dashboard/properties');
        cy.url({ timeout: 8000 }).should('include', '/dashboard');
        cy.url().should('not.include', '/properties');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
describe('Properties — Landlord View', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptNotifications();
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockLandlordUser }).as('getMe');
    });

    it('renders "My Properties" heading', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockVacantProperty] }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.get('h1').contains(/my properties/i).should('be.visible');
    });

    it('shows portfolio count in subtitle', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockVacantProperty, mockListedProperty] }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains(/2 propert/i).should('exist');
    });

    it('shows "Add Property" link pointing to /dashboard/properties/new', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [] }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.get('a[href="/dashboard/properties/new"]').first().should('exist');
    });

    it('shows empty state when no properties', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [] }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains(/no properties yet/i).should('exist');
    });

    it('empty state has "Add Your First Property" link', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [] }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains(/add your first property/i).should('have.attr', 'href', '/dashboard/properties/new');
    });

    it('renders property cards with title and city', () => {
        cy.intercept('GET', '/api/properties', {
            statusCode: 200,
            body: [mockVacantProperty, mockListedProperty],
        }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains('Sunset Apartments').should('exist');
        cy.contains('Green Valley House').should('exist');
    });

    it('shows "Listed" badge on listed property', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockListedProperty] }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains(/listed/i).should('exist');
    });

    it('shows "Publish" button on unlisted property', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockVacantProperty] }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains('button', /publish/i).should('exist');
    });

    it('shows "Unpublish" button on listed property', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockListedProperty] }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains('button', /unpublish/i).should('exist');
    });

    it('does NOT show Publish/Delete/Archive buttons on occupied property', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockOccupiedProperty] }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains('button', /publish/i).should('not.exist');
        cy.contains('button', /delete/i).should('not.exist');
        cy.contains('button', /archive/i).should('not.exist');
    });

    it('shows "Edit" link for each property', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockVacantProperty] }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains('a', /edit/i).should('exist');
    });

    it('Publish button opens confirm modal', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockVacantProperty] }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains('button', /publish/i).first().click();
        cy.contains(/publish listing/i).should('be.visible');
        cy.contains(/yes, publish/i).should('exist');
    });

    it('confirms Publish calls PUT /api/listings/:id/publish', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockVacantProperty] }).as('getProps');
        cy.intercept('PUT', '/api/listings/prop_001/publish', { statusCode: 200, body: {} }).as('publish');
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [{ ...mockVacantProperty, isListed: true }] }).as('refresh');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains('button', /publish/i).first().click();
        cy.contains('button', /yes, publish/i).click();
        cy.wait('@publish');
    });

    it('Cancel on Publish modal dismisses it without API call', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockVacantProperty] }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains('button', /publish/i).first().click();
        cy.contains(/publish listing/i).should('be.visible');
        cy.contains('button', /cancel/i).click();
        cy.contains(/publish listing/i).should('not.exist');
    });

    it('Delete button opens confirm modal', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockVacantProperty] }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains('button', /delete/i).first().click();
        cy.contains(/delete property/i).should('be.visible');
        cy.contains(/yes, delete/i).should('exist');
    });

    it('confirms Delete calls DELETE /api/properties/:id', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockVacantProperty] }).as('getProps');
        cy.intercept('DELETE', '/api/properties/prop_001', { statusCode: 200, body: {} }).as('doDelete');
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [] }).as('refresh');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains('button', /delete/i).first().click();
        cy.contains('button', /yes, delete/i).click();
        cy.wait('@doDelete');
        cy.contains(/deleted successfully/i).should('exist');
    });

    it('Archive button opens confirm modal', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockVacantProperty] }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains('button', /archive/i).first().click();
        cy.contains(/archive property/i).should('be.visible');
    });

    it('confirms Archive calls PUT /api/properties/:id/archive', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockVacantProperty] }).as('getProps');
        cy.intercept('PUT', '/api/properties/prop_001/archive', { statusCode: 200, body: {} }).as('doArchive');
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [{ ...mockVacantProperty, isArchived: true }] }).as('refresh');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains('button', /archive/i).first().click();
        cy.contains('button', /yes, archive/i).click();
        cy.wait('@doArchive');
        cy.contains(/archived successfully/i).should('exist');
    });

    it('Restore button appears on archived property and calls /restore', () => {
        const archivedProp = { ...mockVacantProperty, isArchived: true };
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [archivedProp] }).as('getProps');
        cy.intercept('PUT', '/api/properties/prop_001/restore', { statusCode: 200, body: {} }).as('doRestore');
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockVacantProperty] }).as('refresh');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains('button', /restore/i).first().click();
        cy.contains('button', /yes, restore/i).click();
        cy.wait('@doRestore');
        cy.contains(/restored successfully/i).should('exist');
    });

    it('shows monthly rent formatted on property card', () => {
        cy.intercept('GET', '/api/properties', { statusCode: 200, body: [mockVacantProperty] }).as('getProps');
        cy.visit('/dashboard/properties');
        cy.wait('@getProps');
        cy.contains(/25,000/).should('exist');
    });
});