// cypress/e2e/maintenance.cy.js
// ─────────────────────────────────────────────────────────────────────────────
// Full E2E coverage for /dashboard/maintenance
//   • Tenant view  — submit a new request, view list, delete open request
//   • Landlord/PM view — update request status
//   • Empty state
// ─────────────────────────────────────────────────────────────────────────────

const mockTenantUser = { _id: 'ten_001', name: 'Ali Hassan', email: 'tenant@test.com', role: 'tenant' };
const mockLandlordUser = { _id: 'lnd_001', name: 'Test Landlord', email: 'landlord@test.com', role: 'landlord' };

const mockOpenRequest = {
    _id: 'req_001',
    title: 'Leaking bathroom pipe',
    description: 'Water is dripping from the pipe under the sink.',
    status: 'open',
    priority: 'urgent',
    category: 'plumbing',
    property: { _id: 'prop_001', title: 'Sunset Apartments' },
    tenant: { _id: 'ten_001', name: 'Ali Hassan' },
    createdAt: '2025-01-15T10:00:00.000Z',
    statusHistory: [],
};

const mockInProgressRequest = {
    _id: 'req_002',
    title: 'Broken AC unit',
    description: 'Air conditioning stopped working entirely.',
    status: 'in_progress',
    priority: 'medium',
    category: 'hvac',
    property: { _id: 'prop_001', title: 'Sunset Apartments' },
    tenant: { _id: 'ten_001', name: 'Ali Hassan' },
    createdAt: '2025-01-10T10:00:00.000Z',
    statusHistory: [
        { status: 'open', note: 'Logged', changedAt: '2025-01-10T10:00:00.000Z' },
        { status: 'in_progress', note: 'Technician assigned', changedAt: '2025-01-12T09:00:00.000Z' },
    ],
};

const mockActiveAgreement = {
    _id: 'agr_001',
    status: 'active',
    property: { _id: 'prop_001', title: 'Sunset Apartments' },
};

const interceptNotifications = () => {
    cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { unreadCount: 0 } });
};

// ─────────────────────────────────────────────────────────────────────────────
// TENANT VIEW
// ─────────────────────────────────────────────────────────────────────────────
describe('Maintenance — Tenant View', () => {

    beforeEach(() => {
        cy.loginAsTenant();
        interceptNotifications();
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockTenantUser }).as('getMe');
        cy.intercept('GET', '/api/agreements', {
            statusCode: 200,
            body: [mockActiveAgreement],
        }).as('getAgreements');
        cy.intercept('GET', '/api/maintenance', {
            statusCode: 200,
            body: { requests: [mockOpenRequest, mockInProgressRequest] },
        }).as('getMaintenance');
        cy.visit('/dashboard/maintenance');
        cy.wait('@getMaintenance');
    });

    it('renders "Maintenance Requests" heading', () => {
        cy.get('h1').contains(/maintenance requests/i).should('be.visible');
    });

    it('shows request count in subtitle', () => {
        cy.contains('2 requests').should('exist');
    });

    it('shows "New Request" button for tenant', () => {
        cy.contains('button', /new request/i).should('be.visible');
    });

    it('opens the submission form when "New Request" is clicked', () => {
        cy.contains('button', /new request/i).click();
        cy.contains(/submit maintenance request/i).should('be.visible');
    });

    it('submission form has required fields — property, title, description', () => {
        cy.contains('button', /new request/i).click();
        cy.get('select').contains('Select Property').should('exist');
        cy.get('input[placeholder*="Issue title"]').should('exist');
        cy.get('textarea[placeholder*="Describe"]').should('exist');
    });

    it('submits new request via POST /api/maintenance', () => {
        cy.intercept('POST', '/api/maintenance', { statusCode: 201, body: { message: 'Created' } }).as('postMaintenance');
        cy.intercept('GET', '/api/maintenance', {
            statusCode: 200,
            body: { requests: [mockOpenRequest] },
        }).as('refresh');

        cy.contains('button', /new request/i).click();

        // Select the property from the dropdown
        cy.get('select').first().select('Sunset Apartments');
        cy.get('input[placeholder*="Issue title"]').type('Broken door lock');
        cy.get('textarea[placeholder*="Describe"]').type('The front door lock is stuck and does not open from outside.');

        cy.contains('button', /submit request/i).click();
        cy.wait('@postMaintenance');
        cy.contains(/submit maintenance request/i).should('not.exist');
    });

    it('Cancel button on form hides the form', () => {
        cy.contains('button', /new request/i).click();
        cy.contains(/submit maintenance request/i).should('be.visible');
        cy.contains('button', /cancel/i).click();
        cy.contains(/submit maintenance request/i).should('not.exist');
    });

    it('renders request cards with title and status badge', () => {
        cy.contains('Leaking bathroom pipe').should('exist');
        cy.contains('Broken AC unit').should('exist');
    });

    it('shows "Open" status badge on open request', () => {
        cy.contains('Leaking bathroom pipe')
            .closest('.bg-white')
            .contains(/open/i)
            .should('exist');
    });

    it('shows "In Progress" status badge', () => {
        cy.contains('Broken AC unit')
            .closest('.bg-white')
            .contains(/in progress/i)
            .should('exist');
    });

    it('shows "Urgent" priority badge on urgent request', () => {
        cy.contains('Leaking bathroom pipe')
            .closest('.bg-white')
            .contains(/urgent/i)
            .should('exist');
    });

    it('expands a request card to show description', () => {
        cy.contains('Leaking bathroom pipe')
            .closest('.bg-white')
            .find('button')
            .last()
            .click();
        cy.contains('Water is dripping from the pipe under the sink.').should('exist');
    });

    it('shows status history when expanded on in-progress request', () => {
        cy.contains('Broken AC unit')
            .closest('.bg-white')
            .find('button')
            .last()
            .click();
        cy.contains('Technician assigned').should('exist');
    });

    it('shows Delete (X) button on open request for tenant', () => {
        cy.contains('Leaking bathroom pipe')
            .closest('.bg-white')
            .find('button')
            .first()
            .should('exist');
    });

    it('delete open request calls DELETE /api/maintenance/:id', () => {
        cy.intercept('DELETE', '/api/maintenance/req_001', { statusCode: 200, body: {} }).as('deleteReq');
        cy.intercept('GET', '/api/maintenance', {
            statusCode: 200,
            body: { requests: [mockInProgressRequest] },
        }).as('refresh');

        // Cypress doesn't handle window.confirm by default — stub it
        cy.on('window:confirm', () => true);

        cy.contains('Leaking bathroom pipe')
            .closest('.bg-white')
            .find('button')
            .first()
            .click();
        cy.wait('@deleteReq');
    });

    it('shows empty state when no requests', () => {
        cy.intercept('GET', '/api/maintenance', { statusCode: 200, body: { requests: [] } }).as('empty');
        cy.visit('/dashboard/maintenance');
        cy.wait('@empty');
        cy.contains(/no maintenance requests/i).should('exist');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// LANDLORD VIEW
// ─────────────────────────────────────────────────────────────────────────────
describe('Maintenance — Landlord View', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptNotifications();
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockLandlordUser }).as('getMe');
        cy.intercept('GET', '/api/maintenance', {
            statusCode: 200,
            body: { requests: [mockOpenRequest] },
        }).as('getMaintenance');
        cy.visit('/dashboard/maintenance');
        cy.wait('@getMaintenance');
    });

    it('does NOT show "New Request" button for landlord', () => {
        cy.contains('button', /new request/i).should('not.exist');
    });

    it('renders request card', () => {
        cy.contains('Leaking bathroom pipe').should('exist');
    });

    it('landlord sees "Update Request" panel when request is expanded', () => {
        cy.contains('Leaking bathroom pipe')
            .closest('.bg-white')
            .find('button')
            .last()
            .click();
        cy.contains(/update request/i).should('exist');
    });

    it('status update calls PUT /api/maintenance/:id', () => {
        cy.intercept('PUT', '/api/maintenance/req_001', { statusCode: 200, body: {} }).as('updateReq');
        cy.intercept('GET', '/api/maintenance', {
            statusCode: 200,
            body: { requests: [{ ...mockOpenRequest, status: 'in_progress' }] },
        }).as('refresh');

        cy.contains('Leaking bathroom pipe')
            .closest('.bg-white')
            .find('button')
            .last()
            .click();

        cy.get('select').last().select('in_progress');
        cy.contains('button', /save update/i).click();
        cy.wait('@updateReq');
    });
});