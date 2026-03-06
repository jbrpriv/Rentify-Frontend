// cypress/e2e/profile.cy.js
// ─────────────────────────────────────────────────────────────────────────────
// Full E2E coverage for /dashboard/profile
//   • Profile tab  — load user data, edit name/phone, save
//   • Security tab — 2FA setup, 2FA disable
//   • Notifications tab — toggle preferences
// ─────────────────────────────────────────────────────────────────────────────

const mockUser = {
    _id: 'ten_001',
    name: 'Ali Hassan',
    email: 'tenant@test.com',
    phoneNumber: '+923001234567',
    role: 'tenant',
    twoFactorEnabled: false,
    emailOptIn: true,
    smsOptIn: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    profilePhoto: null,
};

const mock2FAUser = { ...mockUser, twoFactorEnabled: true };

const interceptNotifications = () => {
    cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { unreadCount: 0 } });
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE TAB
// ─────────────────────────────────────────────────────────────────────────────
describe('Profile — Profile Tab', () => {

    beforeEach(() => {
        cy.loginAsTenant();
        interceptNotifications();
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockUser }).as('getMe');
        cy.visit('/dashboard/profile');
        cy.wait('@getMe');
    });

    it('renders "My Profile" heading', () => {
        cy.get('h1').contains(/my profile/i).should('be.visible');
    });

    it('shows three tabs: Profile, Security, Notifications', () => {
        cy.contains('button', /^profile$/i).should('exist');
        cy.contains('button', /security/i).should('exist');
        cy.contains('button', /notifications/i).should('exist');
    });

    it('shows user name prefilled in the name input', () => {
        cy.get('input[value="Ali Hassan"]').should('exist');
    });

    it('shows phone number prefilled', () => {
        cy.get('input[value="+923001234567"]').should('exist');
    });

    it('email field is read-only (disabled)', () => {
        cy.get('input[value="tenant@test.com"]').should('be.disabled');
    });

    it('shows user role in account info row', () => {
        cy.contains(/tenant/i).should('exist');
    });

    it('updating name and saving calls PUT /api/users/profile', () => {
        cy.intercept('PUT', '/api/users/profile', { statusCode: 200, body: { message: 'Updated' } }).as('saveProfile');
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: { ...mockUser, name: 'Ali Updated' } }).as('refresh');

        cy.get('input[value="Ali Hassan"]').clear().type('Ali Updated');
        cy.contains('button', /save/i).first().click();
        cy.wait('@saveProfile');
        cy.contains(/profile updated successfully/i).should('exist');
    });

    it('shows error toast when profile update fails', () => {
        cy.intercept('PUT', '/api/users/profile', {
            statusCode: 400,
            body: { message: 'Validation failed' },
        }).as('saveProfileFail');

        cy.get('input[value="Ali Hassan"]').clear().type('X');
        cy.contains('button', /save/i).first().click();
        cy.wait('@saveProfileFail');
        cy.contains(/validation failed/i).should('exist');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY TAB — 2FA
// ─────────────────────────────────────────────────────────────────────────────
describe('Profile — Security Tab (2FA)', () => {

    beforeEach(() => {
        cy.loginAsTenant();
        interceptNotifications();
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockUser }).as('getMe');
        cy.visit('/dashboard/profile');
        cy.wait('@getMe');
        cy.contains('button', /security/i).click();
    });

    it('shows 2FA section on the Security tab', () => {
        cy.contains(/two.factor/i).should('exist');
    });

    it('shows "Enable 2FA" button when 2FA is off', () => {
        cy.contains('button', /enable 2fa/i).should('exist');
    });

    it('clicking Enable 2FA calls POST /api/auth/2fa/setup and shows QR', () => {
        cy.intercept('POST', '/api/auth/2fa/setup', {
            statusCode: 200,
            body: { qrCode: 'data:image/png;base64,abc123' },
        }).as('setup2FA');

        cy.contains('button', /enable 2fa/i).click();
        cy.wait('@setup2FA');
        cy.get('img[src*="data:image"]').should('exist');
    });

    it('verifying TOTP calls POST /api/auth/2fa/verify', () => {
        cy.intercept('POST', '/api/auth/2fa/setup', {
            statusCode: 200,
            body: { qrCode: 'data:image/png;base64,abc123' },
        }).as('setup2FA');
        cy.intercept('POST', '/api/auth/2fa/verify', { statusCode: 200, body: { message: '2FA enabled' } }).as('verify2FA');
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mock2FAUser }).as('refresh');

        cy.contains('button', /enable 2fa/i).click();
        cy.wait('@setup2FA');

        cy.get('input[type="text"]').last().type('123456');
        cy.contains('button', /confirm & enable/i).click();
        cy.wait('@verify2FA');
        cy.contains(/2fa enabled successfully/i).should('exist');
    });

    it('shows "Disable 2FA" button when 2FA is already on', () => {
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mock2FAUser }).as('get2FAUser');
        cy.visit('/dashboard/profile');
        cy.wait('@get2FAUser');
        cy.contains('button', /security/i).click();
        cy.contains('button', /disable 2fa/i).should('exist');
    });

    it('disable 2FA flow: send OTP then confirm', () => {
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mock2FAUser }).as('get2FAUser');
        cy.visit('/dashboard/profile');
        cy.wait('@get2FAUser');
        cy.contains('button', /security/i).click();

        cy.intercept('POST', '/api/auth/2fa/disable/send-otp', {
            statusCode: 200,
            body: { via: 'phone' },
        }).as('sendOTP');
        cy.intercept('POST', '/api/auth/2fa/disable', { statusCode: 200, body: { message: '2FA disabled' } }).as('disable2FA');

        cy.contains('button', /disable 2fa/i).click();
        cy.wait('@sendOTP');

        cy.get('input[type="text"]').last().type('654321');
        cy.contains('button', /confirm/i).click();
        cy.wait('@disable2FA');
        cy.contains(/2fa disabled/i).should('exist');
    });

    it('shows error toast if invalid TOTP code', () => {
        cy.intercept('POST', '/api/auth/2fa/setup', {
            statusCode: 200,
            body: { qrCode: 'data:image/png;base64,abc123' },
        }).as('setup2FA');
        cy.intercept('POST', '/api/auth/2fa/verify', {
            statusCode: 400,
            body: { message: 'Invalid code' },
        }).as('badVerify');

        cy.contains('button', /enable 2fa/i).click();
        cy.wait('@setup2FA');
        cy.get('input[type="text"]').last().type('000000');
        cy.contains('button', /confirm & enable/i).click();
        cy.wait('@badVerify');
        cy.contains(/invalid code/i).should('exist');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS TAB
// ─────────────────────────────────────────────────────────────────────────────
describe('Profile — Notifications Tab', () => {

    beforeEach(() => {
        cy.loginAsTenant();
        interceptNotifications();
        cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockUser }).as('getMe');
        cy.visit('/dashboard/profile');
        cy.wait('@getMe');
        cy.contains('button', /notifications/i).click();
    });

    it('shows notification preference toggles', () => {
        cy.get('[role="switch"]').should('have.length.at.least', 1);
    });

    it('shows "Save Preferences" button', () => {
        cy.contains('button', /save preferences/i).should('exist');
    });

    it('saving preferences calls PATCH /api/users/me/preferences', () => {
        cy.intercept('PATCH', '/api/users/me/preferences', {
            statusCode: 200,
            body: { message: 'Saved' },
        }).as('savePrefs');

        cy.contains('button', /save preferences/i).click();
        cy.wait('@savePrefs');
        cy.contains(/notification preferences saved/i).should('exist');
    });

    it('toggling a switch changes its state', () => {
        cy.get('[role="switch"]').first().then($toggle => {
            const before = $toggle.attr('aria-checked');
            cy.wrap($toggle).click();
            cy.get('[role="switch"]').first().should('have.attr', 'aria-checked', before === 'true' ? 'false' : 'true');
        });
    });
});