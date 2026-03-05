// cypress/e2e/auditTrail.cy.js
// ─────────────────────────────────────────────────────────────────────────────
// Full E2E coverage for /dashboard/admin/audit-logs
//   • Access control  (admin allowed, non-admin redirected)
//   • Page structure  (h1, filter select, table headers)
//   • Log rendering   (rows, action badges, pagination)
//   • Action filter   (select changes query param, table updates)
//   • Empty state     (no logs returned by API)
//   • API error state (500 from server)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Shared mock data ─────────────────────────────────────────────────────────
const mockLogs = [
    {
        _id: 'log_001',
        action: 'AGREEMENT_CREATED',
        agreementId: 'agr_aabbccdd',
        details: 'Agreement created from offer.',
        actor: { name: 'Test Landlord' },
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
    },
    {
        _id: 'log_002',
        action: 'SIGNED',
        agreementId: 'agr_eeff0011',
        details: 'Landlord signed the agreement.',
        actor: { name: 'Test Landlord' },
        timestamp: new Date().toISOString(),
    },
    {
        _id: 'log_003',
        action: 'PAYMENT_RECEIVED',
        agreementId: 'agr_22334455',
        details: 'Rs. 25,000 received.',
        actor: { name: 'Stripe Webhook' },
        timestamp: new Date().toISOString(),
    },
];

const mockPagination = {
    logs: mockLogs,
    pagination: { total: 3, totalPages: 1, page: 1, limit: 50 },
};

const interceptAdminMe = () => {
    cy.intercept('GET', '/api/users/me', {
        statusCode: 200,
        body: { _id: 'admin_001', name: 'Admin User', email: 'admin@test.com', role: 'admin' },
    }).as('getMe');
};

const interceptLandlordMe = () => {
    cy.intercept('GET', '/api/users/me', {
        statusCode: 200,
        body: { _id: 'lnd_001', name: 'Test Landlord', email: 'landlord@test.com', role: 'landlord' },
    }).as('getMe');
};

// ─────────────────────────────────────────────────────────────────────────────
// ACCESS CONTROL
// ─────────────────────────────────────────────────────────────────────────────
describe('Audit Trail — Access Control', () => {

    it('admin can access the audit logs page', () => {
        cy.loginAsAdmin();
        interceptAdminMe();
        cy.intercept('GET', '/api/admin/audit-logs*', { statusCode: 200, body: mockPagination }).as('getLogs');
        cy.visit('/dashboard/admin/audit-logs');
        cy.wait('@getLogs');
        cy.get('h1').contains(/audit logs/i).should('be.visible');
    });

    it('non-admin (landlord) is redirected away from audit logs', () => {
        cy.loginAsLandlord();
        interceptLandlordMe();
        cy.visit('/dashboard/admin/audit-logs');
        cy.url().should('not.include', '/dashboard/admin/audit-logs');
    });

    it('unauthenticated user is redirected to login', () => {
        cy.logout();
        cy.visit('/dashboard/admin/audit-logs');
        cy.url().should('include', '/login');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// PAGE STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────
describe('Audit Trail — Page Structure', () => {

    beforeEach(() => {
        cy.loginAsAdmin();
        interceptAdminMe();
        cy.intercept('GET', '/api/admin/audit-logs*', { statusCode: 200, body: mockPagination }).as('getLogs');
        cy.visit('/dashboard/admin/audit-logs');
        cy.wait('@getLogs');
    });

    it('renders the Audit Logs h1 heading', () => {
        cy.get('h1').contains(/audit logs/i).should('be.visible');
    });

    it('renders the subtitle description', () => {
        cy.contains(/platform-wide|activity trail/i).should('exist');
    });

    it('renders the action-filter dropdown with All Actions as default', () => {
        cy.get('select').should('exist');
        cy.get('select').should('have.value', '');
        cy.get('select option').first().should('contain.text', 'All');
    });

    it('action-filter dropdown contains the expected options', () => {
        const expectedOptions = ['Created', 'Signed', 'Payment Received', 'Late Fee Applied',
            'Reminder Sent', 'Auto Expired', 'Overdue Notice Sent'];
        expectedOptions.forEach(opt => {
            cy.get('select').contains(opt).should('exist');
        });
    });

    it('renders the log table with thead columns', () => {
        cy.get('table').should('exist');
        cy.get('table thead').within(() => {
            cy.contains(/action/i).should('exist');
            cy.contains(/agreement/i).should('exist');
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// LOG RENDERING
// ─────────────────────────────────────────────────────────────────────────────
describe('Audit Trail — Log Rendering', () => {

    beforeEach(() => {
        cy.loginAsAdmin();
        interceptAdminMe();
        cy.intercept('GET', '/api/admin/audit-logs*', { statusCode: 200, body: mockPagination }).as('getLogs');
        cy.visit('/dashboard/admin/audit-logs');
        cy.wait('@getLogs');
    });

    it('renders a row for each log returned by the API', () => {
        cy.get('table tbody tr').should('have.length', 3);
    });

    it('renders action badge text for each row', () => {
        cy.get('table tbody').within(() => {
            cy.contains(/agreement created/i).should('exist');
            cy.contains(/signed/i).should('exist');
            cy.contains(/payment received/i).should('exist');
        });
    });

    it('renders a truncated agreement ID for each row', () => {
        // agreementId 'agr_aabbccdd' → last 8 chars = 'abbccdd'
        cy.get('table tbody').within(() => {
            cy.contains('aabbccdd').should('exist');
        });
    });

    it('renders details text for log entries', () => {
        cy.get('table tbody').within(() => {
            cy.contains(/agreement created from offer/i).should('exist');
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTION FILTER
// ─────────────────────────────────────────────────────────────────────────────
describe('Audit Trail — Action Filter', () => {

    beforeEach(() => {
        cy.loginAsAdmin();
        interceptAdminMe();
    });

    it('changing the filter dropdown triggers a new API call with the action param', () => {
        cy.intercept('GET', '/api/admin/audit-logs*', { statusCode: 200, body: mockPagination }).as('getLogs');
        cy.visit('/dashboard/admin/audit-logs');
        cy.wait('@getLogs');

        const filteredBody = {
            logs: [mockLogs[1]],
            pagination: { total: 1, totalPages: 1, page: 1, limit: 50 },
        };
        cy.intercept('GET', '/api/admin/audit-logs*action=SIGNED*', {
            statusCode: 200, body: filteredBody,
        }).as('getFiltered');

        cy.get('select').select('Signed');
        cy.wait('@getFiltered');
        cy.get('table tbody tr').should('have.length', 1);
        cy.get('table tbody').within(() => {
            cy.contains(/signed/i).should('exist');
        });
    });

    it('resetting filter to All Actions fetches without action param', () => {
        // First select a specific action so the select is no longer on All Actions
        cy.intercept('GET', '/api/admin/audit-logs*action=SIGNED*', {
            statusCode: 200,
            body: { logs: [mockLogs[1]], pagination: { total: 1, totalPages: 1, page: 1, limit: 50 } },
        }).as('getFiltered');
        cy.get('select').select('SIGNED');
        cy.wait('@getFiltered');

        // Now reset to All Actions — this fires onChange and triggers a fresh fetch
        cy.intercept('GET', '/api/admin/audit-logs*', { statusCode: 200, body: mockPagination }).as('getAll');
        cy.get('select').select('All Actions');
        cy.wait('@getAll');
        cy.get('table tbody tr').should('have.length', 3);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────
describe('Audit Trail — Pagination', () => {

    beforeEach(() => {
        cy.loginAsAdmin();
        interceptAdminMe();
    });

    it('renders Previous and Next navigation when there are multiple pages', () => {
        const multiPageBody = {
            logs: mockLogs,
            pagination: { total: 100, totalPages: 2, page: 1, limit: 50 },
        };
        cy.intercept('GET', '/api/admin/audit-logs*', { statusCode: 200, body: multiPageBody }).as('getLogs');
        cy.visit('/dashboard/admin/audit-logs');
        cy.wait('@getLogs');
        cy.contains(/previous|next|page/i).should('exist');
    });

    it('does not show pagination controls when there is only one page', () => {
        cy.intercept('GET', '/api/admin/audit-logs*', { statusCode: 200, body: mockPagination }).as('getLogs');
        cy.visit('/dashboard/admin/audit-logs');
        cy.wait('@getLogs');
        // Single page — no next button needed
        cy.get('button').filter(':contains("Next")').should('not.exist');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY & ERROR STATES
// ─────────────────────────────────────────────────────────────────────────────
describe('Audit Trail — Empty & Error States', () => {

    beforeEach(() => {
        cy.loginAsAdmin();
        interceptAdminMe();
    });

    it('shows an empty table body when the API returns no logs', () => {
        cy.intercept('GET', '/api/admin/audit-logs*', {
            statusCode: 200,
            body: { logs: [], pagination: { total: 0, totalPages: 0, page: 1, limit: 50 } },
        }).as('emptyLogs');
        cy.visit('/dashboard/admin/audit-logs');
        cy.wait('@emptyLogs');
        cy.get('table tbody tr').should('have.length', 0);
    });

    it('page still renders the heading when the API call fails', () => {
        cy.intercept('GET', '/api/admin/audit-logs*', { statusCode: 500 }).as('errorLogs');
        cy.visit('/dashboard/admin/audit-logs');
        cy.wait('@errorLogs');
        // The page doesn't crash — heading is still visible
        cy.get('h1').contains(/audit logs/i).should('exist');
    });
});