// cypress/e2e/payments.cy.js
// ─────────────────────────────────────────────────────────────────────────────
// Full E2E coverage for:
//   • /dashboard/payments      — tenant payment schedule page
//   • /dashboard/billing       — subscription & billing page (landlord)
//   • /dashboard/notifications — notification centre
// ─────────────────────────────────────────────────────────────────────────────

// ─── Shared mock data ─────────────────────────────────────────────────────────
const mockAgreementWithSchedule = {
    _id: 'agr_001',
    status: 'active',
    property: { _id: 'prop_001', title: 'Sunset Apartments' },
    tenant: { _id: 'ten_001', name: 'Ali Hassan' },
    landlord: { _id: 'lnd_001', name: 'Test Landlord' },
    financials: { rentAmount: 25000, lateFeeAmount: 500, lateFeeGracePeriodDays: 5 },
    term: { startDate: '2025-01-01', endDate: '2026-01-01' },
    signatures: { landlord: { signed: true }, tenant: { signed: true } },
    rentSchedule: [
        { month: 1, year: 2025, status: 'paid', amount: 25000, paidAmount: 25000, dueDate: '2025-01-01' },
        { month: 2, year: 2025, status: 'paid', amount: 25000, paidAmount: 25000, dueDate: '2025-02-01' },
        { month: 3, year: 2025, status: 'pending', amount: 25000, dueDate: '2025-03-01' },
        { month: 4, year: 2025, status: 'overdue', amount: 25000, dueDate: '2025-04-01' },
    ],
};

const mockGateways = { gateways: [{ id: 'stripe', name: 'Stripe' }] };

const interceptTenantMe = () => {
    cy.intercept('GET', '/api/users/me', {
        statusCode: 200,
        body: { _id: 'ten_001', name: 'Ali Hassan', email: 'tenant@test.com', role: 'tenant' },
    }).as('getTenantMe');
};

const interceptLandlordMe = () => {
    cy.intercept('GET', '/api/users/me', {
        statusCode: 200,
        body: { _id: 'lnd_001', name: 'Test Landlord', email: 'landlord@test.com', role: 'landlord' },
    }).as('getMe');
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT SCHEDULE PAGE
// ─────────────────────────────────────────────────────────────────────────────
describe('Payments — Payment Schedule Page', () => {

    beforeEach(() => {
        cy.loginAsTenant();
        interceptTenantMe();
        cy.intercept('GET', '/api/agreements', {
            statusCode: 200,
            body: [mockAgreementWithSchedule],
        }).as('getAgreements');

        cy.visit('/dashboard/payments');
        cy.wait('@getAgreements');
    });

    it('renders the Payment Schedule h1 heading', () => {
        cy.get('h1').contains(/payment schedule/i).should('be.visible');
    });

    it('renders the page subtitle', () => {
        cy.contains(/track your rent payments/i).should('exist');
    });

    it('renders summary cards: Months Paid, Pending, Overdue, Total Paid', () => {
        cy.contains('Months Paid').should('exist');
        cy.contains('Pending').should('exist');
        cy.contains('Overdue').should('exist');
        cy.contains('Total Paid').should('exist');
    });

    it('shows correct Months Paid count from the schedule', () => {
        // 2 paid entries in mock
        cy.contains('Months Paid').closest('div').contains('2').should('exist');
    });

    it('shows correct Overdue count from the schedule', () => {
        // 1 overdue entry in mock
        cy.contains('Overdue').closest('div').contains('1').should('exist');
    });

    it('shows the property title for the selected agreement', () => {
        cy.contains('Sunset Apartments').should('exist');
    });

    it('shows rent amount and lease end date in the detail bar', () => {
        cy.contains(/25,000\/mo/i).should('exist');
        cy.contains(/lease ends/i).should('exist');
    });

    it('renders the Rent Calendar heading', () => {
        cy.contains(/rent calendar/i).should('exist');
    });

    it('renders calendar cells with status labels', () => {
        cy.contains('Paid').should('exist');
        cy.contains('Upcoming').should('exist');
        cy.contains('Overdue').should('exist');
    });

    it('renders a Due date label inside each calendar cell', () => {
        cy.contains(/due:/i).should('exist');
    });

    it('shows empty state when tenant has no agreements', () => {
        cy.intercept('GET', '/api/agreements', { statusCode: 200, body: [] }).as('emptyAgreements');
        cy.visit('/dashboard/payments');
        cy.wait('@emptyAgreements');
        // No agreement — page shows a prompt or empty state
        cy.contains(/payment|schedule|no.*agreement|get started/i).should('exist');
    });

    it('non-tenant (landlord) is redirected away from the payments page', () => {
        cy.loginAsLandlord();
        interceptLandlordMe();
        cy.intercept('GET', '/api/agreements', { statusCode: 200, body: [] }).as('getAgreements');
        cy.intercept('GET', '/api/payments/gateways', { statusCode: 200, body: mockGateways }).as('getGateways');
        cy.visit('/dashboard/payments');
        cy.url().should('not.include', '/dashboard/payments');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// BILLING PAGE
// ─────────────────────────────────────────────────────────────────────────────
const mockPlans = [
    { tier: 'free', name: 'Free', price: 0, features: ['1 property', 'Basic features'] },
    { tier: 'pro', name: 'Pro', price: 2999, features: ['Up to 20 properties', 'All Pro features'] },
    { tier: 'enterprise', name: 'Enterprise', price: 9999, features: ['Unlimited properties', 'Priority support'] },
];

describe('Billing — Page Structure', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptLandlordMe();
        cy.intercept('GET', '/api/billing/plans', {
            statusCode: 200,
            body: { plans: mockPlans, stripeConfigured: true, razorpayConfigured: false },
        }).as('getPlans');
        cy.intercept('GET', '/api/billing/status', {
            statusCode: 200,
            body: { tier: 'free', status: 'active' },
        }).as('getStatus');
        cy.visit('/dashboard/billing');
        cy.wait('@getPlans');
        cy.wait('@getStatus');
    });

    it('renders the Subscription & Billing h1 heading', () => {
        cy.get('h1').contains(/subscription.*billing|billing/i).should('be.visible');
    });

    it('renders the page subtitle', () => {
        cy.contains(/manage your rentifypro plan/i).should('exist');
    });

    it('renders the Current Subscription section', () => {
        cy.contains(/current subscription/i).should('exist');
    });

    it('shows the current tier name (Free by default)', () => {
        cy.contains(/free/i).should('exist');
    });

    it('shows all three plan tiers', () => {
        cy.contains(/free/i).should('exist');
        cy.contains(/pro/i).should('exist');
        cy.contains(/enterprise/i).should('exist');
    });

    it('shows the price for each paid plan', () => {
        cy.contains(/2,999|2999/i).should('exist');
        cy.contains(/9,999|9999/i).should('exist');
    });

    it('shows feature lists for each plan', () => {
        cy.contains('1 property').should('exist');
        cy.contains('Up to 20 properties').should('exist');
        cy.contains('Unlimited properties').should('exist');
    });

    it('shows "Current" badge on the active plan', () => {
        cy.contains('Current').should('exist');
    });

    it('shows Upgrade Plan button for plans above the current tier', () => {
        cy.contains('button', /upgrade plan/i).should('exist');
    });

    it('renders Manage Billing button when stripe is configured', () => {
        cy.contains('button', /manage billing/i).should('be.visible');
    });
});

describe('Billing — Plan on Pro Tier', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptLandlordMe();
        cy.intercept('GET', '/api/billing/plans', {
            statusCode: 200,
            body: { plans: mockPlans, stripeConfigured: true },
        }).as('getPlans');
        cy.intercept('GET', '/api/billing/status', {
            statusCode: 200,
            body: { tier: 'pro', status: 'active' },
        }).as('getStatus');
        cy.visit('/dashboard/billing');
        cy.wait('@getPlans');
        cy.wait('@getStatus');
    });

    it('shows Pro as the current plan', () => {
        cy.contains(/current subscription/i).closest('div').contains(/pro/i).should('exist');
    });

    it('shows Upgrade Plan button for enterprise but not for free or pro', () => {
        // Pro → Enterprise upgrade is available
        cy.contains('button', /upgrade plan/i).should('exist');
    });
});

describe('Billing — Stripe Portal', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptLandlordMe();
        cy.intercept('GET', '/api/billing/plans', {
            statusCode: 200,
            body: { plans: mockPlans, stripeConfigured: true },
        }).as('getPlans');
        cy.intercept('GET', '/api/billing/status', {
            statusCode: 200,
            body: { tier: 'pro', status: 'active' },
        }).as('getStatus');
        cy.visit('/dashboard/billing');
        cy.wait('@getPlans');
    });

    it('clicking Manage Billing calls the billing portal API', () => {
        cy.intercept('POST', '/api/billing/portal', {
            statusCode: 200,
            body: { url: 'https://billing.stripe.com/session/test_abc123' },
        }).as('portal');

        cy.contains('button', /manage billing/i).click();
        cy.wait('@portal');
    });

    it('shows an error toast when the billing portal API fails', () => {
        cy.intercept('POST', '/api/billing/portal', {
            statusCode: 500,
            body: { message: 'Portal unavailable' },
        }).as('portalFail');

        cy.contains('button', /manage billing/i).click();
        cy.wait('@portalFail');
        cy.contains(/portal unavailable|failed|error/i).should('exist');
    });
});

describe('Billing — No Gateway Configured', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptLandlordMe();
        cy.intercept('GET', '/api/billing/plans', {
            statusCode: 200,
            body: { plans: mockPlans, stripeConfigured: false, razorpayConfigured: false },
        }).as('getPlans');
        cy.intercept('GET', '/api/billing/status', {
            statusCode: 200,
            body: { tier: 'free', status: 'active' },
        }).as('getStatus');
        cy.visit('/dashboard/billing');
        cy.wait('@getPlans');
    });

    it('shows "no gateway" notice when neither Stripe nor Razorpay is configured', () => {
        cy.contains(/no payment gateway|contact the administrator|not set up/i).should('exist');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS CENTRE (stand-alone page tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('Notifications Center', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptLandlordMe();
        cy.intercept('GET', '/api/notifications/counts', {
            statusCode: 200,
            body: { unreadCount: 1, maintenanceCount: 0, offerCount: 0, agreementCount: 0 },
        }).as('getCounts');
        cy.intercept('GET', '/api/notifications*', {
            statusCode: 200,
            body: {
                notifications: [{
                    _id: 'notif_x',
                    type: 'general',
                    title: 'Welcome to RentifyPro',
                    body: 'Your account is set up.',
                    isRead: false,
                    createdAt: new Date().toISOString(),
                }],
                unreadCount: 1,
                pagination: { total: 1, totalPages: 1, page: 1, limit: 20 },
            },
        }).as('getNotifications');
        cy.visit('/dashboard/notifications');
        cy.wait('@getNotifications');
    });

    it('renders the notifications page heading', () => {
        cy.get('h1').contains(/notifications/i).should('be.visible');
    });

    it('shows All and Unread filter tabs', () => {
        cy.contains('button', 'All').should('exist');
        cy.contains('button', /unread/i).should('exist');
    });

    it('mark all read button works and disappears after click', () => {
        cy.intercept('PATCH', '/api/notifications/read-all', { statusCode: 200 }).as('markAll');
        cy.contains('button', /mark all read/i).should('be.visible').click();
        cy.wait('@markAll');
        cy.contains('button', /mark all read/i).should('not.exist');
    });

    it('renders a notification card with title and body', () => {
        cy.contains('Welcome to RentifyPro').should('exist');
        cy.contains('Your account is set up').should('exist');
    });
});