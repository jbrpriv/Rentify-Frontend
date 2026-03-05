describe('Audit Trail', () => {
    beforeEach(() => {
        cy.logout();
    });

    it('admin can access the audit logs', () => {
        cy.loginAsAdmin();
        cy.visit('/dashboard/admin/audit-logs');

        // Check for common audit log elements or headers
        cy.contains(/Audit Logs|Activity/i, { timeout: 8000 }).should('exist');
    });

    it('non-admin cannot access the audit logs', () => {
        cy.loginAsLandlord();
        cy.visit('/dashboard/admin/audit-logs');

        // Should redirect back to landlord dashboard
        cy.url().should('not.include', '/dashboard/admin/audit-logs');
    });
});
