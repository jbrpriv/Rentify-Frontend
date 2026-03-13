/**
 * RentifyPro — Main E2E Test Suite
 * Runs against the real deployed app (Vercel frontend + EC2 backend).
 * Uses cy.session() to persist the HttpOnly refresh cookie + localStorage
 * across page visits so the silent token refresh works correctly.
 */

// ─── Login helper using cy.session() ─────────────────────────────────────────
// cy.session() caches cookies + localStorage after the first login,
// and restores them on subsequent calls — so login only hits the server once
// per role per test run.
function loginAs(role) {
    cy.session(role, () => {
        const email = Cypress.env(`${role.toUpperCase()}_EMAIL`);
        const password = Cypress.env(`${role.toUpperCase()}_PASSWORD`);

        // Admin and law_reviewer authenticate via the super-login route
        const loginPath = ['admin', 'law_reviewer'].includes(role)
            ? '/super-login'
            : '/login';

        cy.visit(loginPath);
        cy.get('input[type="email"]').type(email);
        cy.get('input[type="password"]').type(password);
        cy.contains('button', 'Sign in').click();
        cy.url({ timeout: 15000 }).should('include', '/dashboard');
    }, {
        cacheAcrossSpecs: true,
    });
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('RentifyPro — Full Platform Test', () => {

    // ── 1. AUTH ─────────────────────────────────────────────────────────────────
    describe('Authentication', () => {
        it('login page renders correctly', () => {
            cy.visit('/login');
            cy.contains('Sign in to RentifyPro').should('be.visible');
            cy.contains('Back to home').should('be.visible');
            cy.get('input[type="email"]').should('exist');
            cy.get('input[type="password"]').should('exist');
            cy.contains('button', 'Sign in').should('exist');
            cy.contains('Continue with Google').should('exist');
            cy.contains('Forgot password').should('exist');
        });

        it('shows error on wrong credentials', () => {
            cy.visit('/login');
            cy.get('input[type="email"]').type('wrong@email.com');
            cy.get('input[type="password"]').type('wrongpassword123');
            cy.contains('button', 'Sign in').click();
            cy.get('[class*="red"], [class*="error"]', { timeout: 8000 }).should('be.visible');
            cy.url().should('include', '/login');
        });

        it('landlord can log in and reach dashboard', () => {
            loginAs('landlord');
            cy.visit('/dashboard');
            cy.url({ timeout: 15000 }).should('include', '/dashboard');
            cy.get('body').should('not.contain', 'Server Error');
        });
    });

    // ── 2. PROPERTIES ───────────────────────────────────────────────────────────
    describe('Properties', () => {
        beforeEach(() => {
            loginAs('landlord');
        });

        it('properties page loads', () => {
            cy.visit('/dashboard/properties');
            cy.url().should('include', '/properties');
            cy.get('body').should('not.contain', 'Server Error');
        });

        it('new property form is accessible', () => {
            cy.visit('/dashboard/properties/new');
            cy.contains('Add Property', { timeout: 10000 }).should('be.visible');
            cy.get('input').should('have.length.at.least', 3);
        });

        it('property list never shows -1 for enterprise limit', () => {
            cy.visit('/dashboard/properties');
            cy.get('body').should('not.contain', '-1');
        });
    });

    // ── 3. AGREEMENTS ───────────────────────────────────────────────────────────
    describe('Agreements', () => {
        beforeEach(() => {
            loginAs('landlord');
        });

        it('agreements page loads', () => {
            cy.visit('/dashboard/agreements');
            cy.url().should('include', '/agreements');
            cy.get('body').should('not.contain', 'Server Error');
        });

        it('new agreement form loads and has steps', () => {
            cy.visit('/dashboard/agreements/new');
            cy.contains('Step', { timeout: 10000 }).should('be.visible');
        });
    });

    // ── 4. BILLING & PRICING ────────────────────────────────────────────────────
    describe('Billing & Pricing', () => {
        it('pricing page shows correct tier limits', () => {
            cy.visit('/pricing');
            cy.contains('Up to 5').should('be.visible');
            cy.contains('Unlimited').should('be.visible');
            cy.contains('Up to 20').should('not.exist');
        });

        it('pricing page shows USD not PKR', () => {
            cy.visit('/pricing');
            cy.contains('Pakistani Rupees').should('not.exist');
            cy.contains('USD').should('be.visible');
        });

        it('billing dashboard loads', () => {
            loginAs('landlord');
            cy.visit('/dashboard/billing');
            cy.url().should('include', '/billing');
            cy.get('body').should('not.contain', 'Server Error');
        });
    });

    // ── 5. TENANT PORTAL ────────────────────────────────────────────────────────
    describe('Tenant Portal', () => {
        beforeEach(() => {
            loginAs('tenant');
        });

        it('tenant dashboard loads', () => {
            cy.visit('/dashboard');
            cy.url().should('include', '/dashboard');
            cy.get('body').should('not.contain', 'Server Error');
        });

        it('tenant lease page shows no PKR', () => {
            cy.visit('/dashboard/my-lease');
            cy.get('body').should('not.contain', 'Rs.');
            cy.get('body').should('not.contain', 'PKR');
        });

        it('tenant can view maintenance requests', () => {
            cy.visit('/dashboard/maintenance');
            cy.url().should('include', '/maintenance');
            cy.get('body').should('not.contain', 'Server Error');
        });
    });

    // ── 6. ADMIN DASHBOARD ──────────────────────────────────────────────────────
    describe('Admin Dashboard', () => {
        beforeEach(() => {
            loginAs('admin');
        });

        it('admin stats page loads', () => {
            cy.visit('/dashboard/admin');
            cy.url().should('include', '/admin');
            cy.get('body').should('not.contain', 'Server Error');
        });

        it('revenue shows dollar values not raw cents', () => {
            cy.visit('/dashboard/admin');
            cy.get('body').should('not.contain', '150000');
            cy.get('body').should('not.contain', '300000');
        });

        it('shows data timestamp', () => {
            cy.visit('/dashboard/admin');
            cy.contains('Data as of', { timeout: 10000 }).should('be.visible');
        });
    });

    // ── 7. NOTIFICATIONS ────────────────────────────────────────────────────────
    describe('Notifications', () => {
        it('notifications page loads', () => {
            loginAs('landlord');
            cy.visit('/dashboard/notifications');
            cy.url().should('include', '/notifications');
            cy.get('body').should('not.contain', 'Server Error');
        });
    });

    // ── 8. API HEALTH CHECK ─────────────────────────────────────────────────────
    describe('API Health', () => {
        it('backend is up and DB is connected', () => {
            cy.request(`${Cypress.env('apiUrl')}/api/health`).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.status).to.eq('ok');
                expect(res.body.db).to.eq('connected');
            });
        });
    });

});