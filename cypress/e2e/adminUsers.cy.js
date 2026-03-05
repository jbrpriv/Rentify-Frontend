// cypress/e2e/adminUsers.cy.js
// ─────────────────────────────────────────────────────────────────────────────
// Full E2E coverage for /dashboard/admin/users
//   • Role guard — non-admin redirected
//   • Users table renders
//   • Search and role filter
//   • Ban / Unban action
//   • Change Role modal
// ─────────────────────────────────────────────────────────────────────────────

const mockAdminUser = { _id: 'adm_001', name: 'Admin User', email: 'admin@test.com', role: 'admin' };
const mockTenantUser = { _id: 'ten_001', name: 'Ali Hassan', email: 'tenant@test.com', role: 'tenant' };

const mockUsersResponse = {
    users: [
        { _id: 'u001', name: 'Ali Hassan', email: 'ali@test.com', role: 'tenant', isActive: true, createdAt: '2024-06-01T00:00:00.000Z' },
        { _id: 'u002', name: 'Sara Malik', email: 'sara@test.com', role: 'landlord', isActive: true, createdAt: '2024-05-01T00:00:00.000Z' },
        { _id: 'u003', name: 'Banned Person', email: 'banned@test.com', role: 'tenant', isActive: false, createdAt: '2024-04-01T00:00:00.000Z' },
    ],
    pagination: { total: 3, page: 1, pages: 1 },
};

const interceptNotifications = () => {
    cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { unreadCount: 0 } });
};

// ─────────────────────────────────────────────────────────────────────────────
// ROLE GUARD
// ─────────────────────────────────────────────────────────────────────────────
describe('Admin Users — Role Guard', () => {

    it('redirects a non-admin (tenant) away from the page', () => {
        cy.loginAsTenant();
        interceptNotifications();
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockTenantUser }).as('getMe');
        cy.intercept('GET', '/api/admin/users*', { statusCode: 403, body: { message: 'Forbidden' } });
        cy.visit('/dashboard/admin/users');
        cy.url({ timeout: 8000 }).should('include', '/dashboard');
        cy.url().should('not.include', '/admin/users');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT PAGE
// ─────────────────────────────────────────────────────────────────────────────
describe('Admin Users — Management Page', () => {

    beforeEach(() => {
        cy.loginAsAdmin();
        interceptNotifications();
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockAdminUser }).as('getMe');
        cy.intercept('GET', '/api/admin/users*', { statusCode: 200, body: mockUsersResponse }).as('getUsers');
        cy.visit('/dashboard/admin/users');
        cy.wait('@getUsers');
    });

    it('renders "User Management" heading', () => {
        cy.get('h1').contains(/user management/i).should('be.visible');
    });

    it('shows total user count in subtitle', () => {
        cy.contains('3 total users').should('exist');
    });

    it('renders users table with correct columns', () => {
        cy.contains('th', /user/i).should('exist');
        cy.contains('th', /role/i).should('exist');
        cy.contains('th', /status/i).should('exist');
        cy.contains('th', /joined/i).should('exist');
        cy.contains('th', /actions/i).should('exist');
    });

    it('renders a row for each user', () => {
        cy.contains('Ali Hassan').should('exist');
        cy.contains('Sara Malik').should('exist');
        cy.contains('Banned Person').should('exist');
    });

    it('shows role badges', () => {
        cy.contains(/tenant/i).should('exist');
        cy.contains(/landlord/i).should('exist');
    });

    it('shows "Active" badge for active users', () => {
        cy.contains('Ali Hassan')
            .closest('tr')
            .contains(/active/i)
            .should('exist');
    });

    it('shows "Banned" badge for banned users', () => {
        cy.contains('Banned Person')
            .closest('tr')
            .contains(/banned/i)
            .should('exist');
    });

    it('shows "Ban" button for active users', () => {
        cy.contains('Ali Hassan')
            .closest('tr')
            .contains('button', /ban/i)
            .should('exist');
    });

    it('shows "Unban" button for banned users', () => {
        cy.contains('Banned Person')
            .closest('tr')
            .contains('button', /unban/i)
            .should('exist');
    });

    it('search input triggers a new API request with search param', () => {
        cy.intercept('GET', '/api/admin/users*search=ali*', {
            statusCode: 200, body: {
                users: [{ _id: 'u001', name: 'Ali Hassan', email: 'ali@test.com', role: 'tenant', isActive: true, createdAt: '2024-06-01T00:00:00.000Z' }],
                pagination: { total: 1, page: 1, pages: 1 },
            }
        }).as('searchUsers');

        cy.get('input[placeholder*="Search"]').type('ali');
        cy.wait('@searchUsers');
        cy.contains('Sara Malik').should('not.exist');
    });

    it('role filter dropdown triggers a filtered request', () => {
        cy.intercept('GET', '/api/admin/users*role=landlord*', {
            statusCode: 200, body: {
                users: [{ _id: 'u002', name: 'Sara Malik', email: 'sara@test.com', role: 'landlord', isActive: true, createdAt: '2024-05-01T00:00:00.000Z' }],
                pagination: { total: 1, page: 1, pages: 1 },
            }
        }).as('filterByRole');

        cy.get('select').first().select('landlord');
        cy.wait('@filterByRole');
    });

    it('status filter (Banned) triggers filtered request', () => {
        cy.intercept('GET', '/api/admin/users*isActive=false*', {
            statusCode: 200, body: {
                users: [{ _id: 'u003', name: 'Banned Person', email: 'banned@test.com', role: 'tenant', isActive: false, createdAt: '2024-04-01T00:00:00.000Z' }],
                pagination: { total: 1, page: 1, pages: 1 },
            }
        }).as('filterBanned');

        // Third select is the active/status filter
        cy.get('select').eq(1).select('false');
        cy.wait('@filterBanned');
    });

    it('Refresh button re-fetches users', () => {
        cy.intercept('GET', '/api/admin/users*', { statusCode: 200, body: mockUsersResponse }).as('refreshUsers');
        cy.contains('button', /refresh/i).click();
        cy.wait('@refreshUsers');
    });

    it('Ban button calls PUT /api/admin/users/:id/ban', () => {
        cy.intercept('PUT', '/api/admin/users/u001/ban', { statusCode: 200, body: { message: 'User banned' } }).as('banUser');
        cy.intercept('GET', '/api/admin/users*', { statusCode: 200, body: mockUsersResponse }).as('refreshAfterBan');

        cy.on('window:confirm', () => true);
        cy.on('window:alert', () => { });

        cy.contains('Ali Hassan')
            .closest('tr')
            .contains('button', /ban/i)
            .click();
        cy.wait('@banUser');
    });

    it('Unban button calls PUT /api/admin/users/:id/ban', () => {
        cy.intercept('PUT', '/api/admin/users/u003/ban', { statusCode: 200, body: { message: 'User unbanned' } }).as('unbanUser');
        cy.intercept('GET', '/api/admin/users*', { statusCode: 200, body: mockUsersResponse }).as('refresh');

        cy.on('window:confirm', () => true);
        cy.on('window:alert', () => { });

        cy.contains('Banned Person')
            .closest('tr')
            .contains('button', /unban/i)
            .click();
        cy.wait('@unbanUser');
    });

    it('"Change Role" button opens the role modal', () => {
        cy.contains('Ali Hassan')
            .closest('tr')
            .contains('button', /change role/i)
            .click();
        cy.contains(/change role/i).should('be.visible');
        cy.get('select').last().should('exist');
    });

    it('role modal shows the user\'s name', () => {
        cy.contains('Ali Hassan')
            .closest('tr')
            .contains('button', /change role/i)
            .click();
        cy.contains('Ali Hassan').should('exist');
    });

    it('role modal Save calls PUT /api/admin/users/:id/role', () => {
        cy.intercept('PUT', '/api/admin/users/u001/role', { statusCode: 200, body: { message: 'Role updated' } }).as('changeRole');
        cy.intercept('GET', '/api/admin/users*', { statusCode: 200, body: mockUsersResponse }).as('refresh');

        cy.on('window:alert', () => { });

        cy.contains('Ali Hassan')
            .closest('tr')
            .contains('button', /change role/i)
            .click();

        cy.contains('h3', 'Change Role').parent().find('select').select('property_manager');
        cy.contains('h3', 'Change Role').parent().contains('button', /save/i).click();
        cy.wait('@changeRole');
    });

    it('role modal Cancel button closes the modal without API call', () => {
        cy.contains('Ali Hassan')
            .closest('tr')
            .contains('button', /change role/i)
            .click();
        cy.contains('h3', 'Change Role').should('be.visible');
        cy.contains('h3', 'Change Role').parent().contains('button', /cancel/i).click();
        cy.contains('h3', 'Change Role').should('not.exist');
    });
});