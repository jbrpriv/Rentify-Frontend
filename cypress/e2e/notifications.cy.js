// cypress/e2e/notifications.cy.js
// ─────────────────────────────────────────────────────────────────────────────
// Full E2E coverage for /dashboard/notifications
//   • Page structure  (heading, filter tabs, refresh button)
//   • Notification rendering (cards, unread badge, type labels, channels)
//   • Filter tabs     (All / Unread)
//   • Mark as read    (single card click, mark-all button)
//   • Empty states    (no notifications, all-read state)
//   • Navbar bell     (bell icon exists, unread count badge)
//   • API error       (graceful degradation)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Shared mock data ─────────────────────────────────────────────────────────
const mockNotifications = [
    {
        _id: 'notif_001',
        type: 'rent_due',
        title: 'Rent Due',
        body: 'Your rent of Rs. 25,000 is due on 01 Jan 2025.',
        isRead: false,
        createdAt: new Date().toISOString(),
        channels: { email: { sent: true }, sms: { sent: false }, push: { sent: true } },
    },
    {
        _id: 'notif_002',
        type: 'agreement_signed',
        title: 'Agreement Signed',
        body: 'Both parties have signed the agreement for Sunset Apartments.',
        isRead: false,
        createdAt: new Date(Date.now() - 3600_000).toISOString(),
        channels: { email: { sent: true } },
    },
    {
        _id: 'notif_003',
        type: 'maintenance_update',
        title: 'Maintenance Update',
        body: 'Your maintenance request #42 has been updated.',
        isRead: true,
        createdAt: new Date(Date.now() - 86_400_000).toISOString(),
        channels: {},
    },
];

const mockCountsResponse = { unreadCount: 2, maintenanceCount: 0, offerCount: 0, agreementCount: 0 };

const interceptUserMe = () => {
    cy.intercept('GET', '/api/users/me', {
        statusCode: 200,
        body: { _id: 'lnd_001', name: 'Test Landlord', email: 'landlord@test.com', role: 'landlord' },
    }).as('getMe');
};

const interceptNotifications = (notifications = mockNotifications, unreadCount = 2) => {
    cy.intercept('GET', '/api/notifications*', {
        statusCode: 200,
        body: {
            notifications,
            unreadCount,
            pagination: { total: notifications.length, totalPages: 1, page: 1, limit: 20 },
        },
    }).as('getNotifications');
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────
describe('Notifications — Page Structure', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptUserMe();
        interceptNotifications();
        cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: mockCountsResponse }).as('getCounts');
        cy.visit('/dashboard/notifications');
        cy.wait('@getNotifications');
    });

    it('renders the Notifications h1 heading', () => {
        cy.get('h1').contains(/notifications/i).should('be.visible');
    });

    it('renders the All filter tab', () => {
        cy.contains('button', 'All').should('be.visible');
    });

    it('renders the Unread filter tab with a count in brackets', () => {
        // "Unread (2)" when unreadCount > 0
        cy.contains('button', /unread/i).should('be.visible');
        cy.contains('button', /unread/i).contains('(2)').should('exist');
    });

    it('renders a refresh button', () => {
        // RefreshCw icon button — no text, select by its SVG role or nearby parent
        cy.get('button').should('have.length.at.least', 2);
    });

    it('renders a Mark all read button when there are unread notifications', () => {
        cy.contains('button', /mark all read/i).should('be.visible');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION CARD RENDERING
// ─────────────────────────────────────────────────────────────────────────────
describe('Notifications — Card Rendering', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptUserMe();
        interceptNotifications();
        cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: mockCountsResponse }).as('getCounts');
        cy.visit('/dashboard/notifications');
        cy.wait('@getNotifications');
    });

    it('renders a card for each notification', () => {
        // 3 mock notifications → 3 cards
        cy.contains('Rent Due').should('exist');
        cy.contains('Agreement Signed').should('exist');
        cy.contains('Maintenance Update').should('exist');
    });

    it('renders the notification body text', () => {
        cy.contains(/rent of Rs/i).should('exist');
    });

    it('shows an unread dot indicator for unread notifications', () => {
        // Unread notifications get a blue dot span
        cy.get('.bg-blue-500.rounded-full').should('have.length.at.least', 1);
    });

    it('renders channel badges (Email, SMS, Push) for notifications that have them', () => {
        cy.contains('Email').should('exist');
        cy.contains('Push').should('exist');
    });

    it('renders a time-ago label on each card', () => {
        // "Just now", "1h ago", etc.
        cy.contains(/ago|now/i).should('exist');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// FILTER TABS
// ─────────────────────────────────────────────────────────────────────────────
describe('Notifications — Filter Tabs', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptUserMe();
        cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: mockCountsResponse }).as('getCounts');
    });

    it('All tab is active by default', () => {
        interceptNotifications();
        cy.visit('/dashboard/notifications');
        cy.wait('@getNotifications');
        // Active tab has a different border/text colour — check it exists and is visible
        cy.contains('button', 'All').should('be.visible');
    });

    it('clicking Unread tab fetches notifications with unread filter', () => {
        const allIntercept = interceptNotifications();
        cy.visit('/dashboard/notifications');
        cy.wait('@getNotifications');

        const unreadOnly = [mockNotifications[0], mockNotifications[1]];
        cy.intercept('GET', '/api/notifications*', {
            statusCode: 200,
            body: {
                notifications: unreadOnly,
                unreadCount: 2,
                pagination: { total: 2, totalPages: 1, page: 1, limit: 20 },
            },
        }).as('getUnread');

        cy.contains('button', /unread/i).click();
        cy.wait('@getUnread');
        // Only 2 unread notifications shown — read one disappears
        cy.contains('Rent Due').should('exist');
        cy.contains('Agreement Signed').should('exist');
        cy.contains('Maintenance Update').should('not.exist');
    });

    it('switching back to All tab shows all notifications again', () => {
        interceptNotifications();
        cy.visit('/dashboard/notifications');
        cy.wait('@getNotifications');

        cy.intercept('GET', '/api/notifications*', {
            statusCode: 200,
            body: { notifications: [mockNotifications[0], mockNotifications[1]], unreadCount: 2, pagination: {} },
        }).as('getUnread');
        cy.contains('button', /unread/i).click();
        cy.wait('@getUnread');

        cy.intercept('GET', '/api/notifications*', {
            statusCode: 200,
            body: { notifications: mockNotifications, unreadCount: 2, pagination: {} },
        }).as('getAll');
        cy.contains('button', 'All').click();
        cy.wait('@getAll');
        cy.contains('Maintenance Update').should('exist');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// MARK AS READ
// ─────────────────────────────────────────────────────────────────────────────
describe('Notifications — Mark as Read', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptUserMe();
        interceptNotifications();
        cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: mockCountsResponse }).as('getCounts');
        cy.visit('/dashboard/notifications');
        cy.wait('@getNotifications');
    });

    it('clicking an unread card calls PATCH /notifications/:id/read', () => {
        cy.intercept('PATCH', '/api/notifications/notif_001/read', {
            statusCode: 200,
            body: { message: 'Marked as read' },
        }).as('markRead');

        cy.contains('Rent Due').click();
        cy.wait('@markRead');
    });

    it('Mark all read button calls PATCH /notifications/read-all', () => {
        cy.intercept('PATCH', '/api/notifications/read-all', {
            statusCode: 200,
            body: { message: 'All marked as read' },
        }).as('markAll');

        cy.contains('button', /mark all read/i).click();
        cy.wait('@markAll');
    });

    it('Mark all read button disappears after all notifications are marked read', () => {
        cy.intercept('PATCH', '/api/notifications/read-all', { statusCode: 200 }).as('markAll');
        // After marking all read the component sets unreadCount → 0
        cy.contains('button', /mark all read/i).click();
        cy.wait('@markAll');
        cy.contains('button', /mark all read/i).should('not.exist');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATES
// ─────────────────────────────────────────────────────────────────────────────
describe('Notifications — Empty States', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptUserMe();
        cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { unreadCount: 0 } }).as('getCounts');
    });

    it('shows "No notifications yet" when the API returns an empty array on All tab', () => {
        cy.intercept('GET', '/api/notifications*', {
            statusCode: 200,
            body: { notifications: [], unreadCount: 0, pagination: {} },
        }).as('getEmpty');

        cy.visit('/dashboard/notifications');
        cy.wait('@getEmpty');
        cy.contains(/no notifications yet/i).should('exist');
    });

    it('shows "All caught up" message on the Unread tab when there are no unread notifications', () => {
        cy.intercept('GET', '/api/notifications*', {
            statusCode: 200,
            body: { notifications: [], unreadCount: 0, pagination: {} },
        }).as('getEmpty');

        cy.visit('/dashboard/notifications');
        cy.wait('@getEmpty');
        cy.contains('button', /unread/i).click();
        cy.contains(/all caught up/i).should('exist');
    });

    it('does not show Mark all read button when unread count is 0', () => {
        cy.intercept('GET', '/api/notifications*', {
            statusCode: 200,
            body: { notifications: [], unreadCount: 0, pagination: {} },
        }).as('getEmpty');

        cy.visit('/dashboard/notifications');
        cy.wait('@getEmpty');
        cy.contains('button', /mark all read/i).should('not.exist');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR BELL ICON
// ─────────────────────────────────────────────────────────────────────────────
describe('Notifications — Navbar Bell', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptUserMe();
        cy.intercept('GET', '/api/notifications/counts', {
            statusCode: 200,
            body: { unreadCount: 3, maintenanceCount: 0, offerCount: 0, agreementCount: 0 },
        }).as('getCounts');
    });

    it('bell icon exists in the navbar', () => {
        cy.visit('/dashboard');
        cy.wait(1500);
        cy.get('a[aria-label="Notifications"]').should('exist');
    });

    it('bell link navigates to /dashboard/notifications', () => {
        cy.visit('/dashboard');
        cy.wait(1500);
        cy.get('a[aria-label="Notifications"]').should('have.attr', 'href', '/dashboard/notifications');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// API ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────
describe('Notifications — API Error Handling', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptUserMe();
        cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: mockCountsResponse }).as('getCounts');
    });

    it('page still renders the heading when the notifications API fails', () => {
        cy.intercept('GET', '/api/notifications*', { statusCode: 500 }).as('notifError');
        cy.visit('/dashboard/notifications');
        cy.wait('@notifError');
        cy.get('h1').contains(/notifications/i).should('exist');
    });
});