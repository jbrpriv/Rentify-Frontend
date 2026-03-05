// cypress/e2e/disputes.cy.js
// ─────────────────────────────────────────────────────────────────────────────
// Full E2E coverage for /dashboard/disputes
//   • Tenant / Landlord — file dispute, view list, add comments
//   • Admin — update dispute status and add resolution note
//   • Empty state
// ─────────────────────────────────────────────────────────────────────────────

const mockTenantUser = { _id: 'ten_001', name: 'Ali Hassan', email: 'tenant@test.com', role: 'tenant' };
const mockLandlordUser = { _id: 'lnd_001', name: 'Test Landlord', email: 'landlord@test.com', role: 'landlord' };
const mockAdminUser = { _id: 'adm_001', name: 'Admin User', email: 'admin@test.com', role: 'admin' };

const mockActiveAgreement = {
    _id: 'agr_001',
    status: 'active',
    property: { _id: 'prop_001', title: 'Sunset Apartments' },
};

const mockOpenDispute = {
    _id: 'dis_001',
    title: 'Landlord refusing deposit refund',
    description: 'My landlord is refusing to return the security deposit despite clean handover.',
    status: 'open',
    category: 'deposit',
    property: { _id: 'prop_001', title: 'Sunset Apartments' },
    filedBy: { _id: 'ten_001', name: 'Ali Hassan', role: 'tenant' },
    against: { _id: 'lnd_001', name: 'Test Landlord', role: 'landlord' },
    comments: [
        {
            _id: 'cmt_001',
            content: 'I have receipts for the handover inspection.',
            author: { _id: 'ten_001', name: 'Ali Hassan', role: 'tenant' },
            createdAt: '2025-02-01T10:00:00.000Z',
        },
    ],
    createdAt: '2025-01-20T10:00:00.000Z',
    resolutionNote: null,
};

const mockClosedDispute = {
    _id: 'dis_002',
    title: 'Noise complaint resolved',
    description: 'Tenant was making excessive noise.',
    status: 'closed',
    category: 'noise',
    property: { _id: 'prop_001', title: 'Sunset Apartments' },
    filedBy: { _id: 'lnd_001', name: 'Test Landlord', role: 'landlord' },
    against: { _id: 'ten_001', name: 'Ali Hassan', role: 'tenant' },
    comments: [],
    createdAt: '2025-01-10T10:00:00.000Z',
    resolutionNote: 'Both parties agreed to resolve amicably.',
    resolvedBy: { name: 'Admin User' },
    resolvedAt: '2025-01-15T10:00:00.000Z',
};

const interceptNotifications = () => {
    cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { unreadCount: 0 } });
};

// ─────────────────────────────────────────────────────────────────────────────
// TENANT VIEW
// ─────────────────────────────────────────────────────────────────────────────
describe('Disputes — Tenant View', () => {

    beforeEach(() => {
        cy.loginAsTenant();
        interceptNotifications();
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockTenantUser }).as('getMe');
        cy.intercept('GET', '/api/agreements', { statusCode: 200, body: [mockActiveAgreement] }).as('getAgreements');
        cy.intercept('GET', '/api/disputes', {
            statusCode: 200,
            body: { disputes: [mockOpenDispute, mockClosedDispute] },
        }).as('getDisputes');
        cy.visit('/dashboard/disputes');
        cy.wait('@getDisputes');
    });

    it('renders "Disputes" heading', () => {
        cy.get('h1').contains(/disputes/i).should('be.visible');
    });

    it('shows "File Dispute" button for tenant', () => {
        cy.contains('button', /file dispute/i).should('be.visible');
    });

    it('opens the file dispute form when button is clicked', () => {
        cy.contains('button', /file dispute/i).click();
        cy.contains(/file a dispute/i).should('be.visible');
    });

    it('file dispute form has agreement selector, title, description, and category', () => {
        cy.contains('button', /file dispute/i).click();
        cy.get('select').first().should('contain', 'Select Agreement');
        cy.get('input[placeholder*="Dispute title"]').should('exist');
        cy.get('textarea[placeholder*="Describe the issue"]').should('exist');
    });

    it('submitting the form calls POST /api/disputes', () => {
        cy.intercept('POST', '/api/disputes', { statusCode: 201, body: { message: 'Filed' } }).as('fileDispute');
        cy.intercept('GET', '/api/disputes', {
            statusCode: 200,
            body: { disputes: [mockOpenDispute] },
        }).as('refresh');

        cy.contains('button', /file dispute/i).click();
        cy.get('select').first().select('Sunset Apartments — active');
        cy.get('input[placeholder*="Dispute title"]').type('Deposit not returned');
        cy.get('textarea[placeholder*="Describe the issue"]').type('Landlord is holding deposit without reason.');

        cy.contains('button', /submit dispute/i).click();
        cy.wait('@fileDispute');
        cy.contains(/file a dispute/i).should('not.exist');
    });

    it('Cancel button on file form hides the form', () => {
        cy.contains('button', /file dispute/i).click();
        cy.contains(/file a dispute/i).should('be.visible');
        cy.contains('button', /cancel/i).click();
        cy.contains(/file a dispute/i).should('not.exist');
    });

    it('renders dispute cards with title, status badge, and category', () => {
        cy.contains('Landlord refusing deposit refund').should('exist');
        cy.contains('Noise complaint resolved').should('exist');
    });

    it('shows "Open" status badge on open dispute', () => {
        cy.contains('Landlord refusing deposit refund')
            .closest('.bg-white')
            .contains(/open/i)
            .should('exist');
    });

    it('shows "Closed" status badge on closed dispute', () => {
        cy.contains('Noise complaint resolved')
            .closest('.bg-white')
            .contains(/closed/i)
            .should('exist');
    });

    it('expands dispute to show description and parties', () => {
        cy.contains('Landlord refusing deposit refund')
            .closest('.bg-white')
            .find('button')
            .click();
        cy.contains('My landlord is refusing to return').should('exist');
        cy.contains('Filed By').should('exist');
        cy.contains('Against').should('exist');
    });

    it('shows existing comments when expanded', () => {
        cy.contains('Landlord refusing deposit refund')
            .closest('.bg-white')
            .find('button')
            .click();
        cy.contains('I have receipts for the handover inspection.').should('exist');
    });

    it('comment input is visible on open dispute when expanded', () => {
        cy.contains('Landlord refusing deposit refund')
            .closest('.bg-white')
            .find('button')
            .click();
        cy.get('input[placeholder="Add a comment..."]').should('exist');
    });

    it('adding a comment calls POST /api/disputes/:id/comments', () => {
        cy.intercept('POST', '/api/disputes/dis_001/comments', { statusCode: 201, body: { message: 'Comment added' } }).as('addComment');
        cy.intercept('GET', '/api/disputes', { statusCode: 200, body: { disputes: [mockOpenDispute] } }).as('refresh');

        cy.contains('Landlord refusing deposit refund')
            .closest('.bg-white')
            .find('button')
            .click();

        cy.get('input[placeholder="Add a comment..."]').type('Awaiting admin review.');
        cy.get('input[placeholder="Add a comment..."]').siblings('button').click();
        cy.wait('@addComment');
    });

    it('comment input is NOT shown on closed dispute', () => {
        cy.contains('Noise complaint resolved')
            .closest('.bg-white')
            .find('button')
            .click();
        cy.get('input[placeholder="Add a comment..."]').should('not.exist');
    });

    it('shows resolution note on closed dispute', () => {
        cy.contains('Noise complaint resolved')
            .closest('.bg-white')
            .find('button')
            .click();
        cy.contains('Both parties agreed to resolve amicably.').should('exist');
    });

    it('shows empty state when no disputes', () => {
        cy.intercept('GET', '/api/disputes', { statusCode: 200, body: { disputes: [] } }).as('empty');
        cy.visit('/dashboard/disputes');
        cy.wait('@empty');
        cy.contains(/no disputes filed/i).should('exist');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN VIEW
// ─────────────────────────────────────────────────────────────────────────────
describe('Disputes — Admin View', () => {

    beforeEach(() => {
        cy.loginAsAdmin();
        interceptNotifications();
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockAdminUser }).as('getMe');
        cy.intercept('GET', '/api/disputes', {
            statusCode: 200,
            body: { disputes: [mockOpenDispute] },
        }).as('getDisputes');
        cy.visit('/dashboard/disputes');
        cy.wait('@getDisputes');
    });

    it('does NOT show "File Dispute" button for admin', () => {
        cy.contains('button', /file dispute/i).should('not.exist');
    });

    it('admin sees dispute card', () => {
        cy.contains('Landlord refusing deposit refund').should('exist');
    });

    it('admin sees Update panel when dispute is expanded', () => {
        cy.contains('Landlord refusing deposit refund')
            .closest('.bg-white')
            .find('button')
            .click();
        cy.contains(/admin.*update dispute/i).should('exist');
    });

    it('admin update calls PUT /api/disputes/:id', () => {
        cy.intercept('PUT', '/api/disputes/dis_001', { statusCode: 200, body: { message: 'Updated' } }).as('updateDispute');
        cy.intercept('GET', '/api/disputes', {
            statusCode: 200,
            body: { disputes: [{ ...mockOpenDispute, status: 'under_review' }] },
        }).as('refresh');

        cy.contains('Landlord refusing deposit refund')
            .closest('.bg-white')
            .find('button')
            .click();

        cy.get('.bg-amber-50 select').select('under_review');
        cy.get('.bg-amber-50 textarea').type('Reviewing submitted evidence.');
        cy.get('.bg-amber-50').contains('button', /save update/i).click();
        cy.wait('@updateDispute');
    });
});