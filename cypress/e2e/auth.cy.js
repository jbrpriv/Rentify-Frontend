describe('Authentication', () => {

    beforeEach(() => {
        cy.logout();
    });

    // ─── Registration ──────────────────────────────────────────────────────
    it('shows validation errors on empty register submit', () => {
        cy.visit('/register');
        cy.get('button[type="submit"]').click();
        cy.contains(/required|fill in/i).should('exist');
    });

    it('registers a new landlord account', () => {
        const ts = Date.now();
        cy.visit('/register');
        cy.get('input[name="name"]').type(`Test Landlord ${ts}`);
        cy.get('input[name="email"]').type(`landlord_${ts}@e2e.com`);
        cy.get('input[name="phoneNumber"]').type('03001234567');
        cy.get('input[name="password"]').type('Test@12345');
        cy.get('select[name="role"]').select('landlord');
        cy.get('button[type="submit"]').click();
        // Should redirect to verify or dashboard
        cy.url().should('match', /verify|dashboard/);
    });

    // ─── Login ─────────────────────────────────────────────────────────────
    it('shows error on wrong credentials', () => {
        cy.visit('/login');
        cy.get('input[name="email"]').type('wrong@test.com');
        cy.get('input[name="password"]').type('wrongpassword');
        cy.get('button[type="submit"]').click();
        cy.contains(/invalid|incorrect|not found/i).should('exist');
    });

    it('logs in successfully and lands on dashboard', () => {
        cy.visit('/login');
        cy.get('input[name="email"]').type(Cypress.env('LANDLORD_EMAIL') || 'landlord@test.com');
        cy.get('input[name="password"]').type(Cypress.env('LANDLORD_PASSWORD') || 'Test@12345');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/dashboard');
    });

    // ─── Forgot Password ───────────────────────────────────────────────────
    it('submits forgot password form', () => {
        cy.visit('/forgot-password');
        cy.get('input[name="email"]').type('landlord@test.com');
        cy.get('button[type="submit"]').click();
        cy.contains(/sent|check your email/i).should('exist');
    });

    // ─── Protected routes ──────────────────────────────────────────────────
    it('redirects unauthenticated user from dashboard to login', () => {
        cy.visit('/dashboard');
        cy.url().should('include', '/login');
    });
});