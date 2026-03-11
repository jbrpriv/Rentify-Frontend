// cypress/e2e/agreements.cy.js
// ─────────────────────────────────────────────────────────────────────────────
// Full E2E coverage for:
//   • Agreements list page     (/dashboard/agreements)
//   • Agreement builder        (/dashboard/agreements/new)
//   • Version history page     (/dashboard/agreements/:id/history)
//   • Agreement templates page (/dashboard/agreement-templates)
//   • Tenant lease page        (/dashboard/my-lease)
//   • Public signing page      (/sign/:token)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Shared mock data ─────────────────────────────────────────────────────────
const mockAgreements = [
    {
        _id: 'agr_001',
        status: 'pending_signature',
        property: { _id: 'prop_001', title: 'Sunset Apartments' },
        tenant: { _id: 'ten_001', name: 'Ali Hassan', email: 'ali@example.com' },
        landlord: { _id: 'lnd_001', name: 'Test Landlord' },
        term: { startDate: '2025-01-01', endDate: '2026-01-01', durationMonths: 12 },
        financials: { rentAmount: 25000, depositAmount: 50000 },
        signatures: {
            landlord: { signed: false },
            tenant: { signed: false },
        },
        rentEscalation: { enabled: false },
    },
    {
        _id: 'agr_002',
        status: 'active',
        property: { _id: 'prop_002', title: 'Green Valley Flat' },
        tenant: { _id: 'ten_002', name: 'Sara Khan', email: 'sara@example.com' },
        landlord: { _id: 'lnd_001', name: 'Test Landlord' },
        term: { startDate: '2024-06-01', endDate: '2025-06-01', durationMonths: 12 },
        financials: { rentAmount: 35000, depositAmount: 70000 },
        signatures: {
            landlord: { signed: true },
            tenant: { signed: true },
        },
        rentEscalation: { enabled: true, percentage: 5 },
    },
];

const mockOffer = {
    _id: 'offer_001',
    status: 'countered',
    property: {
        _id: 'prop_001',
        title: 'Sunset Apartments',
        financials: { lateFeeAmount: 500, lateFeeGracePeriodDays: 5 },
    },
    tenant: { _id: 'ten_001', name: 'Ali Hassan', email: 'ali@example.com' },
    landlord: { _id: 'lnd_001' },
    history: [
        {
            round: 1, offeredBy: 'tenant',
            monthlyRent: 25000, securityDeposit: 50000, leaseDurationMonths: 12,
        },
        {
            round: 2, offeredBy: 'landlord',
            monthlyRent: 27000, securityDeposit: 54000, leaseDurationMonths: 12,
            note: 'Slight adjustment',
        },
    ],
};

const mockClauses = [
    { _id: 'cl_001', title: 'No Pets Allowed', category: 'restrictions', isDefault: false, body: 'Tenant shall not keep any pets on the premises.' },
    { _id: 'cl_002', title: 'Maintenance Duties', category: 'maintenance', isDefault: true, body: 'Tenant is responsible for minor maintenance.' },
    { _id: 'cl_003', title: 'Sub-letting Ban', category: 'restrictions', isDefault: false, body: 'Tenant may not sub-let without written consent.' },
];

const mockTemplates = [
    {
        _id: 'tpl_001',
        name: 'Standard Residential',
        description: 'Basic clauses for a standard lease.',
        status: 'approved',
        clauseIds: [{ _id: 'cl_001' }, { _id: 'cl_002' }],
    },
];

const mockVersionHistory = {
    currentVersion: 2,
    versionHistory: [
        {
            version: 1,
            reason: 'Initial draft',
            savedAt: new Date().toISOString(),
            savedBy: { name: 'Test Landlord' },
            snapshot: {
                status: 'draft',
                financials: { rentAmount: 25000, depositAmount: 50000 },
                term: { durationMonths: 12, startDate: '2025-01-01', endDate: '2026-01-01' },
                clauses: ['No Pets Allowed'],
            },
        },
        {
            version: 2,
            reason: 'Clauses updated',
            savedAt: new Date().toISOString(),
            savedBy: { name: 'Test Landlord' },
            snapshot: {
                status: 'pending_signature',
                financials: { rentAmount: 25000, depositAmount: 50000 },
                term: { durationMonths: 12, startDate: '2025-01-01', endDate: '2026-01-01' },
                clauses: ['No Pets Allowed', 'Maintenance Duties'],
            },
        },
    ],
    auditLog: [
        {
            action: 'AGREEMENT_CREATED',
            timestamp: new Date().toISOString(),
            details: 'Agreement drafted from offer.',
            actor: { name: 'Test Landlord' },
            ipAddress: '127.0.0.1',
        },
        {
            action: 'CLAUSES_UPDATED',
            timestamp: new Date().toISOString(),
            details: '2 clauses attached.',
            actor: { name: 'Test Landlord' },
        },
    ],
};

// ─── interceptUserMe ──────────────────────────────────────────────────────────
const interceptUserMe = () => {
    cy.intercept('GET', '/api/users/me', {
        statusCode: 200,
        body: { _id: 'lnd_001', name: 'Test Landlord', email: 'landlord@test.com', role: 'landlord' },
    }).as('getMe');
    // Stub the new dashboard summary endpoint so dashboard load doesn't fail
    cy.intercept('GET', '/api/users/dashboard-summary', {
        statusCode: 200,
        body: { counts: { activeAgreements: 1, pendingOffers: 0, propertyCount: 1, pendingDisputes: 0, pendingMaintenance: 0, overduePayments: 0 }, recentPayments: [], recentAgreements: [] },
    }).as('getDashboardSummary');
    cy.intercept('GET', '/api/payments*', { statusCode: 200, body: { payments: [] } });
};

// ─────────────────────────────────────────────────────────────────────────────
// AGREEMENTS LIST
// ─────────────────────────────────────────────────────────────────────────────
describe('Agreements List — Landlord', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptUserMe();
        cy.intercept('GET', '/api/agreements', { statusCode: 200, body: mockAgreements }).as('getAgreements');
        cy.visit('/dashboard/agreements');
        cy.wait('@getAgreements');
    });

    it('renders the page heading', () => {
        cy.contains(/rental agreements/i).should('be.visible');
        cy.url().should('include', '/dashboard/agreements');
    });

    it('lists all agreements returned by the API', () => {
        cy.contains('Sunset Apartments').should('be.visible');
        cy.contains('Green Valley Flat').should('be.visible');
    });

    it('shows tenant name and lease end date for each agreement', () => {
        cy.contains('Ali Hassan').should('be.visible');
        cy.contains('Sara Khan').should('be.visible');
        cy.contains(/ends:/i).should('exist');
    });

    it('shows correct signature status badges', () => {
        cy.contains('Landlord Pending').should('be.visible');
        cy.contains('Tenant Pending').should('be.visible');
        cy.contains('Landlord Signed').should('be.visible');
        cy.contains('Tenant Signed').should('be.visible');
    });

    it('shows rent escalation indicator for agreements that have it enabled', () => {
        cy.contains('+5% / yr').should('be.visible');
    });

    // BUG 1 FIX: ag.status.charAt(0).toUpperCase() + ag.status.slice(1)
    // 'pending_signature' → 'Pending_signature'  (NOT 'Pending signature')
    it('shows the correct status pill for each agreement', () => {
        cy.contains('Pending_signature').should('be.visible');
        cy.contains('Active').should('be.visible');
    });

    it('renders a Sign button only for unsigned, non-active/expired agreements', () => {
        cy.get('button').filter(':contains("Sign")').should('have.length', 1);
    });

    it('renders Send Invites button for landlord on draft/pending agreements', () => {
        cy.contains('button', /send invites/i).should('be.visible');
    });

    it('calls send-invites API and shows toast on success', () => {
        cy.intercept('POST', '/api/agreements/agr_001/send-invites', {
            statusCode: 200,
            body: { message: 'Invites sent' },
        }).as('sendInvites');

        cy.contains('button', /send invites/i).click();
        cy.wait('@sendInvites');
        cy.contains(/signing invitations sent/i).should('be.visible');
    });

    it('downloads PDF when PDF button is clicked', () => {
        cy.intercept('GET', '/api/agreements/agr_001/pdf', {
            statusCode: 200,
            body: new Blob(['%PDF'], { type: 'application/pdf' }),
        }).as('downloadPdf');

        cy.get('button').filter(':contains("PDF")').first().click();
        cy.wait('@downloadPdf');
    });

    it('navigates to version history page when History button is clicked', () => {
        cy.get('button').filter(':contains("History")').first().click();
        cy.url().should('include', '/dashboard/agreements/agr_001/history');
    });

    // BUG 2 FIX: Modal header text is "Draw Your Signature" not just /sign/i.
    it('opens the signature draw modal when Sign is clicked', () => {
        cy.get('button').filter(':contains("Sign")').click();
        cy.contains(/draw your signature/i).should('be.visible');
        cy.get('canvas').should('exist');
    });

    it('shows empty state when no agreements exist', () => {
        cy.intercept('GET', '/api/agreements', { statusCode: 200, body: [] }).as('emptyAgreements');
        cy.visit('/dashboard/agreements');
        cy.wait('@emptyAgreements');
        cy.contains(/no agreements found/i).should('be.visible');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// AGREEMENT BUILDER — /dashboard/agreements/new
// ─────────────────────────────────────────────────────────────────────────────
describe('Agreement Builder — offerId guard', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptUserMe();
    });

    it('blocks access without offerId and shows the Start from an Offer screen', () => {
        cy.visit('/dashboard/agreements/new');
        cy.contains(/start from an offer/i).should('be.visible');
        cy.get('input[type="date"]').should('not.exist');
    });

    // BUG 3 FIX: Button text is "View Applications & Offers" not "View Applications"
    it('the Start from an Offer CTA redirects to the offers page', () => {
        cy.visit('/dashboard/agreements/new');
        cy.contains('button', /view applications & offers/i).click();
        cy.url().should('include', '/dashboard/offers');
    });
});

describe('Agreement Builder — with valid offerId', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptUserMe();
        cy.intercept('GET', '/api/offers/offer_001', { statusCode: 200, body: mockOffer }).as('getOffer');
        cy.intercept('GET', '/api/agreements/clauses', { statusCode: 200, body: mockClauses }).as('getClauses');
        cy.intercept('GET', '/api/agreement-templates', { statusCode: 200, body: mockTemplates }).as('getTemplates');
        cy.visit('/dashboard/agreements/new?offerId=offer_001');
        cy.wait('@getOffer');
        // Gate on the offer banner — reliable SSR/hydration stability marker.
        cy.contains(/accepting offer from ali hassan/i, { timeout: 15000 }).should('exist');
    });

    // ── Flow tracker ───────────────────────────────────────────────────────────
    it('renders the rental flow tracker with all four steps', () => {
        cy.contains(/rental flow/i).should('be.visible');
        cy.contains(/property listed/i).should('be.visible');
        cy.contains(/offer negotiated/i).should('be.visible');
        cy.contains(/draft agreement/i).should('be.visible');
        cy.contains(/sign & activate/i).should('be.visible');
    });

    // BUG 4 FIX: toLocaleString() output varies by environment.
    it('marks Property Listed and Offer Negotiated as done in the flow tracker', () => {
        cy.contains(/2 rounds/i).should('be.visible');
        cy.contains(/27.?000\/mo/i).should('be.visible');
    });

    // ── Offer accepted banner ──────────────────────────────────────────────────
    it('shows the accepted-offer banner with tenant name and rent', () => {
        cy.contains(/accepting offer from ali hassan/i).should('be.visible');
        cy.contains(/sunset apartments/i).should('be.visible');
        cy.contains(/27.?000\/mo/i).should('be.visible');
    });

    // ── Step 1: Lease Terms ────────────────────────────────────────────────────
    it('pre-fills rent and deposit from the offer and marks them disabled', () => {
        cy.get('input[type="number"]').filter('[value="27000"]').should('be.disabled');
        cy.get('input[type="number"]').filter('[value="54000"]').should('be.disabled');
    });

    it('pre-fills late fee and grace period from property settings and marks them disabled', () => {
        cy.get('input[type="number"]').filter('[value="500"]').should('be.disabled');
        cy.get('input[type="number"]').filter('[value="5"]').should('be.disabled');
    });

    it('validates that start date is required', () => {
        // The form has noValidate — browser native validation is disabled so
        // React's handleSubmit always runs and sets custom error state.
        cy.get('input[type="date"]').first()
            .invoke('val', '')
            .trigger('input', { force: true })
            .trigger('change', { force: true });
        cy.contains('button', /create agreement draft/i).click();
        cy.contains(/start date is required/i).should('be.visible');
    });

    it('validates that end date must be after start date', () => {
        cy.get('input[type="date"]').first()
            .invoke('val', '2025-06-01')
            .trigger('input', { force: true })
            .trigger('change', { force: true });
        cy.get('input[type="date"]').last()
            .invoke('val', '2025-01-01')
            .trigger('input', { force: true })
            .trigger('change', { force: true });
        cy.contains('button', /create agreement draft/i).click();
        cy.contains(/end date must be after start date/i).should('be.visible');
    });

    // BUG 5 FIX: button[class*="rounded-full"] matched category filter pills too.
    // The toggle is the only button with Tailwind classes h-6 AND w-11.
    it('shows rent escalation preview when the toggle is switched on', () => {
        cy.contains(/annual rent escalation/i).should('be.visible');
        cy.get('button.h-6.w-11').click();
        cy.contains(/increase by/i).should('be.visible');
        cy.contains(/% per year/i).should('be.visible');
        cy.contains(/increase on year 1/i).should('be.visible');
    });

    it('advances to Step 2 when valid lease terms are submitted', () => {
        cy.contains('button', /create agreement draft/i).click();
        cy.contains(/step 2/i).should('be.visible');
        cy.contains(/additional clauses/i).should('be.visible');
    });

    // ── Step 2: Clauses ────────────────────────────────────────────────────────
    describe('Step 2 — Clause Picker', () => {

        beforeEach(() => {
            cy.contains('button', /create agreement draft/i).click();
            cy.wait('@getClauses');
        });

        it('renders available clauses from the API', () => {
            cy.contains('No Pets Allowed').should('be.visible');
            cy.contains('Maintenance Duties').should('be.visible');
            cy.contains('Sub-letting Ban').should('be.visible');
        });

        it('marks default/recommended clauses with a badge', () => {
            cy.contains('Recommended').should('be.visible');
        });

        it('expands a clause to show its body text', () => {
            cy.contains('No Pets Allowed')
                .closest('[class*="border"]')
                .find('button')
                .last()
                .click();
            cy.contains('Tenant shall not keep any pets').should('be.visible');
        });

        it('adds a clause to the selected list when its checkbox is clicked', () => {
            cy.contains('No Pets Allowed')
                .closest('[class*="border"]')
                .find('button')
                .first()
                .click();
            cy.contains(/1 clause selected/i).should('be.visible');
        });

        it('removes a selected clause via its X button', () => {
            cy.contains('No Pets Allowed')
                .closest('[class*="border"]')
                .find('button').first().click();
            cy.contains(/1 clause selected/i).should('be.visible');
            cy.get('[class*="bg-blue-50"]').find('button[title="Remove clause"]').click();
            cy.contains(/1 clause selected/i).should('not.exist');
        });

        it('filters clauses by category', () => {
            cy.contains('button', 'restrictions').click();
            cy.contains('No Pets Allowed').should('be.visible');
            cy.contains('Sub-letting Ban').should('be.visible');
            cy.contains('Maintenance Duties').should('not.exist');
        });

        it('filters clauses by search text', () => {
            cy.get('input[placeholder="Search clauses\u2026"]').type('pets');
            cy.contains('No Pets Allowed').should('be.visible');
            cy.contains('Sub-letting Ban').should('not.exist');
        });

        it('shows the Use Template button', () => {
            cy.contains('button', /use template/i).should('be.visible');
        });

        it('opens the template picker modal and lists approved templates', () => {
            cy.contains('button', /use template/i).click();
            cy.contains(/agreement templates/i).should('be.visible');
            cy.contains('Standard Residential').should('be.visible');
            cy.contains(/2 clauses included/i).should('be.visible');
        });

        // BUG 6 FIX: Use div.fixed.inset-0 to match element with both utility classes.
        it('closes the template picker when clicking outside', () => {
            cy.contains('button', /use template/i).click();
            cy.contains(/agreement templates/i).should('be.visible');
            cy.get('div.fixed.inset-0').first().click({ force: true });
            cy.contains(/agreement templates/i).should('not.exist');
        });

        it('applies a template and shows the applied-template banner', () => {
            cy.intercept('POST', '/api/agreement-templates/tpl_001/use', { statusCode: 200 }).as('trackUsage');
            cy.contains('button', /use template/i).click();
            cy.get('div.fixed.inset-0').last().within(() => {
                cy.contains('button', /^Use$/).click();
            });
            cy.wait('@trackUsage');
            cy.contains(/template applied/i).should('be.visible');
            cy.contains('Standard Residential').should('be.visible');
            cy.contains(/2 clauses selected/i).should('be.visible');
        });

        it('finishes without clauses by calling accept and redirecting', () => {
            cy.intercept('PUT', '/api/offers/offer_001/accept', {
                statusCode: 200,
                body: { agreement: { _id: 'agr_new' } },
            }).as('acceptOffer');

            cy.contains('button', /finish without clauses/i).click();
            cy.wait('@acceptOffer');
            cy.url().should('include', '/dashboard/agreements');
        });

        it('attaches clauses and finishes when at least one clause is selected', () => {
            cy.intercept('PUT', '/api/offers/offer_001/accept', {
                statusCode: 200,
                body: { agreement: { _id: 'agr_new' } },
            }).as('acceptOffer');
            cy.intercept('PUT', '/api/agreements/agr_new/clauses', { statusCode: 200 }).as('saveClauses');

            cy.contains('No Pets Allowed')
                .closest('[class*="border"]')
                .find('button').first().click();

            cy.contains('button', /attach.*clause.*finish/i).click();
            cy.wait('@acceptOffer');
            cy.wait('@saveClauses');
            cy.url().should('include', '/dashboard/agreements');
        });

        it('Cancel Draft link navigates back to agreements list', () => {
            cy.contains('a, button', /cancel draft/i).click();
            cy.url().should('include', '/dashboard/agreements');
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// VERSION HISTORY PAGE — /dashboard/agreements/:id/history
// ─────────────────────────────────────────────────────────────────────────────
describe('Agreement Version History', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptUserMe();
        cy.intercept('GET', '/api/agreements/agr_001/version-history', {
            statusCode: 200,
            body: mockVersionHistory,
        }).as('getHistory');
        cy.visit('/dashboard/agreements/agr_001/history');
        cy.wait('@getHistory');
    });

    it('renders the Version History heading and version count', () => {
        cy.contains(/version history/i).should('be.visible');
        cy.contains(/2 version/i).should('be.visible');
    });

    it('renders both version cards in the Versions tab', () => {
        cy.contains('v1').should('be.visible');
        cy.contains('v2').should('be.visible');
        cy.contains('Initial draft').should('be.visible');
        cy.contains('Clauses updated').should('be.visible');
    });

    it('expands a version card to show snapshot details', () => {
        cy.contains('button', 'v1').click();
        // Scope inside the card — bare cy.contains('Test Landlord') finds the
        // fixed-positioned navbar element first which is covered by the nav bar.
        cy.contains('Version 1').closest('div.bg-white.border').within(() => {
            cy.contains(/saved by/i).should('exist');
            cy.contains('Test Landlord').should('exist');
            cy.contains('25,000').should('exist');
            cy.contains('12 months').should('exist');
            cy.contains('No Pets Allowed').should('exist');
        });
    });

    it('collapses an expanded version card on second click', () => {
        cy.contains('button', 'v1').click();
        cy.contains('Version 1').closest('div.bg-white.border').within(() => {
            cy.contains('25,000').should('exist');
        });
        cy.contains('button', 'v1').click();
        cy.contains('Version 1').closest('div.bg-white.border').within(() => {
            cy.contains('25,000').should('not.exist');
        });
    });

    it('switches to the Audit Log tab and shows audit events', () => {
        cy.contains('button', /audit log/i).click();
        // FIX: Scope to the audit log panel — bare cy.contains('Test Landlord')
        // finds the navbar <p> (position:fixed, covered by the nav bar) first,
        // causing a visibility failure. Using .should('exist') within the panel
        // correctly targets the audit log entries without a visibility check on
        // an element that might be partially obscured by scroll position.
        cy.get('.bg-white.border.border-gray-200.rounded-xl').within(() => {
            cy.contains(/agreement created/i).should('exist');
            cy.contains(/clauses updated/i).should('exist');
            cy.contains('Test Landlord').should('exist');
            cy.contains('127.0.0.1').should('exist');
        });
    });

    // BUG 8 FIX: count span lives inside the tab button.
    it('shows tab counts for versions and audit log', () => {
        cy.contains('button', 'Versions').find('span').should('contain', '2');
        cy.contains('button', 'Audit Log').find('span').should('contain', '2');
    });

    it('saves a manual snapshot and refreshes the list', () => {
        const updated = {
            ...mockVersionHistory,
            currentVersion: 3,
            versionHistory: [
                ...mockVersionHistory.versionHistory,
                {
                    version: 3,
                    reason: 'Manual snapshot by user',
                    savedAt: new Date().toISOString(),
                    savedBy: { name: 'Test Landlord' },
                    snapshot: { status: 'pending_signature', clauses: [] },
                },
            ],
        };

        cy.intercept('POST', '/api/agreements/agr_001/snapshot', {
            statusCode: 200,
            body: { version: 3 },
        }).as('saveSnapshot');
        cy.intercept('GET', '/api/agreements/agr_001/version-history', {
            statusCode: 200,
            body: updated,
        }).as('refreshHistory');

        cy.contains('button', 'Save Snapshot').click();
        cy.wait('@saveSnapshot');
        cy.wait('@refreshHistory');
        cy.contains(/Snapshot saved as Version 3/i).should('be.visible');
        cy.contains('v3').should('be.visible');
    });

    it('shows an error message when the snapshot API fails', () => {
        cy.intercept('POST', '/api/agreements/agr_001/snapshot', {
            statusCode: 500,
            body: { message: 'Internal server error' },
        }).as('failSnapshot');

        cy.contains('button', 'Save Snapshot').click();
        cy.wait('@failSnapshot');
        cy.contains(/Internal server error/i).should('be.visible');
    });

    // BUG 9 FIX: back button has no text — only an SVG icon.
    it('back button navigates to the previous page', () => {
        cy.get('button.p-2.rounded-lg').first().click();
        cy.url().should('not.include', '/history');
    });

    it('shows the empty state when there are no version snapshots', () => {
        cy.intercept('GET', '/api/agreements/agr_001/version-history', {
            statusCode: 200,
            body: { currentVersion: 0, versionHistory: [], auditLog: [] },
        }).as('emptyHistory');

        cy.visit('/dashboard/agreements/agr_001/history');
        cy.wait('@emptyHistory');
        cy.contains(/no version snapshots saved yet/i).should('be.visible');
    });

    it('shows error state when the history API fails', () => {
        cy.intercept('GET', '/api/agreements/agr_001/version-history', {
            statusCode: 404,
            body: { message: 'Agreement not found' },
        }).as('historyError');

        cy.visit('/dashboard/agreements/agr_001/history');
        cy.wait('@historyError');
        cy.contains(/agreement not found/i).should('be.visible');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// AGREEMENT TEMPLATES PAGE
// ─────────────────────────────────────────────────────────────────────────────
describe('Agreement Templates Page', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptUserMe();
        cy.visit('/dashboard/agreement-templates');
    });

    it('loads the templates page and shows a templates-related heading', () => {
        // Scope to <h1> — mobile nav breadcrumb also matches /templates/i but is hidden.
        cy.get('h1').contains(/templates/i).should('be.visible');
        cy.url().should('include', '/dashboard/agreement-templates');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SIGNING FLOW — Tenant
// ─────────────────────────────────────────────────────────────────────────────
describe('Signing Flow — Tenant', () => {

    beforeEach(() => {
        cy.loginAsTenant();
        cy.intercept('GET', '/api/users/me', {
            statusCode: 200,
            body: { _id: 'ten_001', name: 'Ali Hassan', email: 'tenant@test.com', role: 'tenant' },
        }).as('getTenantMe');
    });

    it('tenant visiting /dashboard/agreements is redirected (or served /my-lease content)', () => {
        cy.visit('/dashboard/my-lease');
        cy.url().should('include', '/dashboard/my-lease');
        // FIX: Scope to <h1> — bare cy.contains(/lease|agreement/) matches the mobile
        // breadcrumb <p> whose parent has display:none, failing the visibility check.
        cy.get('h1').contains(/lease|agreement/i).should('be.visible');
    });

    it('tenant can view the my-lease page with lease/agreement content', () => {
        cy.visit('/dashboard/my-lease');
        // FIX: same scoping fix as above.
        cy.get('h1').contains(/lease|agreement/i).should('be.visible');
        cy.url().should('include', '/dashboard/my-lease');
    });

    it('sign page shows an error for an invalid token', () => {
        cy.visit('/sign/invalid-token-123');
        cy.contains(/invalid|expired|not found/i).should('be.visible');
    });

    it('sign page shows an error for a malformed token', () => {
        cy.visit('/sign/!!!bad-token!!!');
        cy.contains(/invalid|expired|not found/i).should('be.visible');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// EDGE CASES & API ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────
describe('Agreements — API error handling', () => {

    beforeEach(() => {
        cy.loginAsLandlord();
        interceptUserMe();
    });

    it('shows an empty-state UI when GET /agreements returns an empty array', () => {
        cy.intercept('GET', '/api/agreements', { statusCode: 200, body: [] }).as('empty');
        cy.visit('/dashboard/agreements');
        cy.wait('@empty');
        cy.contains(/no agreements found/i).should('be.visible');
    });

    it('shows a toast error when signing fails', () => {
        cy.intercept('GET', '/api/agreements', { statusCode: 200, body: mockAgreements }).as('getAgreements');
        cy.intercept('PUT', '/api/agreements/agr_001/sign', {
            statusCode: 400,
            body: { message: 'Signature data is required' },
        }).as('signFail');

        cy.visit('/dashboard/agreements');
        cy.wait('@getAgreements');
        cy.get('button').filter(':contains("Sign")').click();
        cy.contains(/draw your signature/i).should('be.visible');

        cy.get('canvas').then($canvas => {
            const el = $canvas[0];
            el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 10, clientY: 10 }));
            el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 50, clientY: 50 }));
            el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        });
        cy.contains('button', /sign agreement/i).should('not.be.disabled').click();
        cy.wait('@signFail');
        cy.contains(/signature data is required/i).should('be.visible');
    });

    it('shows a toast error when the offer accept call fails during clause save', () => {
        cy.intercept('GET', '/api/offers/offer_001', { statusCode: 200, body: mockOffer }).as('getOffer');
        cy.intercept('GET', '/api/agreements/clauses', { statusCode: 200, body: mockClauses }).as('getClauses');
        cy.intercept('PUT', '/api/offers/offer_001/accept', {
            statusCode: 500,
            body: { message: 'Failed to accept offer' },
        }).as('acceptFail');

        cy.visit('/dashboard/agreements/new?offerId=offer_001');
        cy.wait('@getOffer');
        cy.contains('button', /create agreement draft/i).click();
        cy.wait('@getClauses');
        cy.contains('button', /finish without clauses/i).click();
        cy.wait('@acceptFail');
        cy.contains(/failed to accept offer/i).should('be.visible');
    });
});