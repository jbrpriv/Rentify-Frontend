// cypress/e2e/auth.cy.js
// ─────────────────────────────────────────────────────────────────────────────
// Full E2E coverage for:
//   • /register     — multi-step: register → verify-email → verify-phone
//   • /login        — credentials, 2FA prompt, error states
//   • /forgot-password
//   • /dashboard    — unauthenticated guard
//   • /super-login  — admin + law_reviewer role tabs
// ─────────────────────────────────────────────────────────────────────────────

// ─── Shared user me intercept ─────────────────────────────────────────────────
const interceptLandlordMe = () => {
    cy.intercept('GET', '/api/users/me', {
        statusCode: 200,
        body: { _id: 'lnd_001', name: 'Test Landlord', email: 'landlord@test.com', role: 'landlord' },
    }).as('getMe');
};

describe('Authentication', () => {

    beforeEach(() => {
        cy.logout();
    });

    // ── Register page ──────────────────────────────────────────────────────────

    it('register page loads and has all required input fields', () => {
        cy.visit('/register');
        cy.get('input').should('have.length.at.least', 3); // name, email, password at minimum
        cy.get('button[type="submit"]').should('exist');
    });

    it('shows role selector options on the register page', () => {
        cy.visit('/register');
        // The role picker renders as clickable buttons, not a <select>
        cy.contains(/tenant/i).should('exist');
        cy.contains(/landlord/i).should('exist');
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

    it('shows an error for a duplicate email on register', () => {
        cy.intercept('POST', '/api/auth/register', {
            statusCode: 400,
            body: { message: 'Email already registered' },
        }).as('registerFail');

        cy.visit('/register');
        cy.get('input[name="name"], input[placeholder*="name" i]').first().type('Test User');
        cy.get('input[name="email"], input[type="email"]').first().type('existing@test.com');
        cy.get('input[name="phoneNumber"], input[type="tel"]').first().type('+923001234567');
        cy.get('input[name="password"], input[type="password"]').first().type('Test@12345');
        cy.get('button[type="submit"]').first().click();
        cy.wait('@registerFail');
        cy.contains(/already registered|already exists|email/i).should('exist');
    });

    it('advances to the email-verification step after successful registration API call', () => {
        cy.intercept('POST', '/api/auth/register', {
            statusCode: 201,
            body: { message: 'Registration successful. Please verify your email.' },
        }).as('register');

        cy.visit('/register');
        cy.get('input[name="name"], input[placeholder*="name" i]').first().type('New User');
        cy.get('input[name="email"], input[type="email"]').first().type('newuser@test.com');
        cy.get('input[name="phoneNumber"], input[type="tel"]').first().type('+923001234567');
        cy.get('input[name="password"], input[type="password"]').first().type('Test@12345');
        cy.get('button[type="submit"]').first().click();
        cy.wait('@register');
        // Step advances to 'verify-email' — page shows OTP/code input
        cy.contains(/verify|check your email|code|token/i).should('exist');
    });

    // ── Login page ─────────────────────────────────────────────────────────────

    it('login page loads correctly with email and password fields', () => {
        cy.visit('/login');
        cy.get('input[type="email"], input[placeholder*="email" i]').should('exist');
        cy.get('input[type="password"]').should('exist');
        cy.get('button[type="submit"]').should('exist');
    });

    it('shows a link to the register page', () => {
        cy.visit('/login');
        cy.contains(/register|sign up|create account/i).should('exist');
    });

    it('shows a link to forgot password', () => {
        cy.visit('/login');
        cy.contains(/forgot|reset.*password/i).should('exist');
    });

    it('password field toggles visibility when eye icon is clicked', () => {
        cy.visit('/login');
        cy.get('input[type="password"]').should('exist');
        // The eye button is in the outer .relative wrapper, one level above
        // the inner wrapper that TextField renders around the <input>.
        cy.get('button[title="Show password"]').click();
        cy.get('input[type="text"]').should('exist'); // password is now visible
    });

    it('stays on login page with wrong credentials', () => {
        cy.visit('/login');
        cy.get('input[type="email"], input[placeholder*="email" i]').first().type('wrong@test.com');
        cy.get('input[type="password"]').first().type('wrongpassword');
        cy.get('button[type="submit"]').first().click();
        cy.url({ timeout: 10000 }).should('not.include', '/dashboard');
    });

    it('shows an error message with wrong credentials', () => {
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 401,
            body: { message: 'Invalid email or password' },
        }).as('loginFail');

        cy.visit('/login');
        cy.get('input[type="email"], input[placeholder*="email" i]').first().type('wrong@test.com');
        cy.get('input[type="password"]').first().type('wrongpassword');
        cy.get('button[type="submit"]').first().click();
        cy.wait('@loginFail');
        cy.contains(/invalid|incorrect|wrong|password|email/i).should('exist');
    });

    it('logs in successfully and lands on dashboard', () => {
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: { _id: 'lnd_001', token: 'mock-token', name: 'Test Landlord', email: 'landlord@test.com', role: 'landlord' },
        }).as('doLogin');
        cy.intercept('GET', '/api/users/me', {
            statusCode: 200,
            body: { _id: 'lnd_001', name: 'Test Landlord', email: 'landlord@test.com', role: 'landlord' },
        }).as('getMe');
        cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { unreadCount: 0 } });
        cy.visit('/login');
        cy.get('input[type="email"], input[placeholder*="email" i]')
            .first().type(Cypress.env('LANDLORD_EMAIL') || 'landlord@test.com');
        cy.get('input[type="password"]')
            .first().type(Cypress.env('LANDLORD_PASSWORD') || 'Test@12345');
        cy.get('button[type="submit"]').first().click();
        cy.wait('@doLogin');
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
    });

    it('shows 2FA code input when the server returns twoFactorEnabled', () => {
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: { _id: 'user_2fa', twoFactorEnabled: true },
        }).as('login2FA');

        cy.visit('/login');
        cy.get('input[type="email"], input[placeholder*="email" i]').first().type('user2fa@test.com');
        cy.get('input[type="password"]').first().type('Test@12345');
        cy.get('button[type="submit"]').first().click();
        cy.wait('@login2FA');
        // Component transitions to the 2FA TOTP entry step
        cy.contains(/authenticator|2fa|verification code|totp/i).should('exist');
    });

    it('shows email verification prompt when server returns EMAIL_NOT_VERIFIED', () => {
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 401,
            body: { message: 'EMAIL_NOT_VERIFIED' },
        }).as('loginUnverified');

        cy.visit('/login');
        cy.get('input[type="email"], input[placeholder*="email" i]').first().type('unverified@test.com');
        cy.get('input[type="password"]').first().type('Test@12345');
        cy.get('button[type="submit"]').first().click();
        cy.wait('@loginUnverified');
        cy.contains(/verify.*email|check.*email|verification/i).should('exist');
    });

    // ── Forgot Password ────────────────────────────────────────────────────────

    it('forgot password page loads and has email input', () => {
        cy.visit('/forgot-password');
        cy.get('input[type="email"], input[placeholder*="email" i]').should('exist');
        cy.get('button[type="submit"]').should('exist');
    });

    it('forgot password page shows a link back to login', () => {
        cy.visit('/forgot-password');
        cy.contains(/back|login|sign in/i).should('exist');
    });

    it('submits forgot password form and shows success message', () => {
        cy.visit('/forgot-password');
        cy.get('input[type="email"], input[placeholder*="email" i]').first().type('landlord@test.com');
        cy.get('button[type="submit"]').first().click();
        cy.contains(/sent|check|email|success/i, { timeout: 8000 }).should('exist');
    });

    it('shows an error when forgot-password API fails', () => {
        cy.intercept('POST', '/api/auth/forgot-password', {
            statusCode: 404,
            body: { message: 'No account found with that email' },
        }).as('forgotFail');

        cy.visit('/forgot-password');
        cy.get('input[type="email"], input[placeholder*="email" i]').first().type('nobody@test.com');
        cy.get('button[type="submit"]').first().click();
        cy.wait('@forgotFail');
        cy.contains(/not found|no account|error/i).should('exist');
    });

    // ── Auth Guard ─────────────────────────────────────────────────────────────

    it('redirects unauthenticated user from /dashboard to /login', () => {
        cy.visit('/dashboard');
        cy.url().should('include', '/login');
    });

    it('redirects unauthenticated user from a nested dashboard route to /login', () => {
        cy.visit('/dashboard/agreements');
        cy.url().should('include', '/login');
    });

    // ── Super-login ────────────────────────────────────────────────────────────

    it('super-login page loads with Admin and Law role tabs', () => {
        cy.visit('/super-login');
        cy.contains(/admin/i).should('exist');
        cy.contains(/law/i).should('exist');
    });

    it('logs in successfully as admin via super-login and lands on dashboard', () => {
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: { _id: 'admin_001', token: 'mock-token', name: 'Admin User', email: 'admin@test.com', role: 'admin' },
        }).as('doSuperLogin');
        cy.intercept('GET', '/api/users/me', {
            statusCode: 200,
            body: { _id: 'admin_001', name: 'Admin User', email: 'admin@test.com', role: 'admin' },
        }).as('getAdminMe');
        cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { unreadCount: 0 } });
        cy.visit('/super-login');
        cy.get('input[type="email"], input[placeholder*="email" i]')
            .first().type(Cypress.env('ADMIN_EMAIL') || 'admin@test.com');
        cy.get('input[type="password"]')
            .first().type(Cypress.env('ADMIN_PASSWORD') || 'Test@12345');
        cy.get('button[type="submit"]').first().click();
        cy.wait('@doSuperLogin');
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
    });

    it('logs in successfully as law reviewer via super-login and accesses templates', () => {
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: { _id: 'law_001', token: 'mock-token', name: 'Law Reviewer', email: 'law_reviewer@test.com', role: 'law_reviewer' },
        }).as('doLawLogin');
        cy.intercept('GET', '/api/users/me', {
            statusCode: 200,
            body: { _id: 'law_001', name: 'Law Reviewer', email: 'law_reviewer@test.com', role: 'law_reviewer' },
        }).as('getLawMe');
        cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { unreadCount: 0 } });
        cy.visit('/super-login');
        cy.contains('button', 'Law').click();
        cy.get('input[type="email"], input[placeholder*="email" i]')
            .first().type(Cypress.env('LAW_REVIEWER_EMAIL') || 'law_reviewer@test.com');
        cy.get('input[type="password"]')
            .first().type(Cypress.env('LAW_REVIEWER_PASSWORD') || 'Test@12345');
        cy.get('button[type="submit"]').first().click();
        cy.wait('@doLawLogin');
        cy.url({ timeout: 10000 }).should('include', '/dashboard');
        cy.contains('Templates', { timeout: 8000 }).should('exist');
    });

    it('super-login blocks a non-admin/law_reviewer role and shows an error', () => {
        // The page calls /api/auth/login and does its own role check client-side.
        // Return a 200 with a non-admin role so the page shows "Access denied".
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: { _id: 'lnd_001', token: 'mock-token', name: 'Test Landlord', email: 'landlord@test.com', role: 'landlord' },
        }).as('superLoginFail');

        cy.visit('/super-login');
        cy.get('input[type="email"], input[placeholder*="email" i]').first().type('landlord@test.com');
        cy.get('input[type="password"]').first().type('Test@12345');
        cy.get('button[type="submit"]').first().click();
        cy.wait('@superLoginFail');
        cy.contains(/access|restricted|admin|unauthorized/i).should('exist');
    });
});