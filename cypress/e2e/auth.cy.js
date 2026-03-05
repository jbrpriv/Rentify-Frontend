describe('Authentication', () => {

    beforeEach(() => {
        cy.logout();
    });

    it('shows validation errors on empty register submit', () => {
        cy.visit('/register');
        cy.get('button[type="submit"]').first().click();
        cy.get('body').then(($body) => {
            const hasError =
                $body.find('[class*="error"]').length > 0 ||
                $body.find('[class*="red"]').length > 0 ||
                $body.find('[class*="invalid"]').length > 0 ||
                $body.text().match(/required|fill|valid|empty/i);
            expect(hasError).to.be.ok;
        });
    });

    it('register page loads and has input fields', () => {
        cy.visit('/register');
        cy.get('input').should('have.length.at.least', 1);
        cy.get('button[type="submit"]').should('exist');
    });

    it('login page loads correctly', () => {
        cy.visit('/login');
        cy.get('input').should('have.length.at.least', 1);
        cy.get('button[type="submit"]').should('exist');
    });

    it('stays on login page with wrong credentials', () => {
        cy.visit('/login');
        cy.get('input[type="email"], input[placeholder*="email" i]')
            .first().type('wrong@test.com');
        cy.get('input[type="password"]')
            .first().type('wrongpassword');
        cy.get('button[type="submit"]').first().click();
        cy.url({ timeout: 10000 }).should('not.include', '/dashboard');
    });

    it('logs in successfully and lands on dashboard', () => {
        cy.visit('/login');
        cy.get('input[type="email"], input[placeholder*="email" i]')
            .first().type(Cypress.env('LANDLORD_EMAIL') || 'landlord@test.com');
        cy.get('input[type="password"]')
            .first().type(Cypress.env('LANDLORD_PASSWORD') || 'Test@12345');
        cy.get('button[type="submit"]').first().click();
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
    });

    it('forgot password page loads and has email input', () => {
        cy.visit('/forgot-password');
        cy.get('input[type="email"], input[placeholder*="email" i]')
            .should('exist');
    });

    it('submits forgot password form', () => {
        cy.visit('/forgot-password');
        cy.get('input[type="email"], input[placeholder*="email" i]')
            .first().type('landlord@test.com');
        cy.get('button[type="submit"]').first().click();
        cy.contains(/sent|check|email|success/i, { timeout: 8000 }).should('exist');
    });

    it('redirects unauthenticated user from dashboard to login', () => {
        cy.visit('/dashboard');
        cy.url().should('include', '/login');
    });

    it('logs in successfully as admin and lands on admin dashboard', () => {
        cy.loginAsAdmin();
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
        cy.contains(/admin/i).should('exist');
    });

    it('logs in successfully as law reviewer and accesses templates', () => {
        cy.visit('/super-login');
        cy.get('input[type="email"], input[placeholder*="email" i]')
            .first().type(Cypress.env('LAW_REVIEWER_EMAIL') || 'law_reviewer@test.com');
        cy.get('input[type="password"]')
            .first().type(Cypress.env('LAW_REVIEWER_PASSWORD') || 'Test@12345');
        cy.get('button[type="submit"]').first().click();

        cy.url({ timeout: 10000 }).should('include', '/dashboard');
        // They should have access to Templates tab
        cy.contains('Templates', { timeout: 8000 }).should('exist');
    });
});