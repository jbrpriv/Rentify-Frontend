// ─── Login via API (bypass UI for speed in non-auth tests) ─────────────────
Cypress.Commands.add('loginAsLandlord', () => {
    cy.request('POST', `${Cypress.env('apiUrl') || 'http://localhost:5000'}/api/auth/login`, {
        email: Cypress.env('LANDLORD_EMAIL') || 'landlord@test.com',
        password: Cypress.env('LANDLORD_PASSWORD') || 'Test@12345',
    }).then(({ body }) => {
        localStorage.setItem('token', body.token);
        localStorage.setItem('userInfo', JSON.stringify(body));
    });
});

Cypress.Commands.add('loginAsTenant', () => {
    cy.request('POST', `${Cypress.env('apiUrl') || 'http://localhost:5000'}/api/auth/login`, {
        email: Cypress.env('TENANT_EMAIL') || 'tenant@test.com',
        password: Cypress.env('TENANT_PASSWORD') || 'Test@12345',
    }).then(({ body }) => {
        localStorage.setItem('token', body.token);
        localStorage.setItem('userInfo', JSON.stringify(body));
    });
});

Cypress.Commands.add('loginAsAdmin', () => {
    cy.request('POST', `${Cypress.env('apiUrl') || 'http://localhost:5000'}/api/auth/login`, {
        email: Cypress.env('ADMIN_EMAIL') || 'admin@test.com',
        password: Cypress.env('ADMIN_PASSWORD') || 'Test@12345',
    }).then(({ body }) => {
        localStorage.setItem('token', body.token);
        localStorage.setItem('userInfo', JSON.stringify(body));
    });
});

// ─── Logout helper ──────────────────────────────────────────────────────────
Cypress.Commands.add('logout', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
});