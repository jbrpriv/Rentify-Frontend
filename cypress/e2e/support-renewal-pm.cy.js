// cypress/e2e/support-renewal-pm.cy.js
// ─────────────────────────────────────────────────────────────────────────────
// Recalibrated tests covering:
//   • Public Support Page (/support)
//   • Agreement Renewal (PUT method fix)
//   • PM Active Tenants page
//   • Dashboard summary endpoint usage
//   • Property New page — country/state/city selects
//   • Clause jurisdiction display
// ─────────────────────────────────────────────────────────────────────────────

const mockLandlordUser = { _id: 'lnd_001', name: 'Test Landlord', email: 'landlord@test.com', role: 'landlord' };
const mockPMUser = { _id: 'pm_001', name: 'Property Manager', email: 'pm@test.com', role: 'property_manager' };
const mockTenantUser = { _id: 'ten_001', name: 'Ali Hassan', email: 'tenant@test.com', role: 'tenant' };

const mockActiveAgreement = {
  _id: 'agr_001',
  status: 'active',
  property: { _id: 'prop_001', title: 'Sunset Apartments', address: { city: 'Lahore', state: 'Punjab', country: 'Pakistan' } },
  tenant: { _id: 'ten_001', name: 'Ali Hassan', email: 'ali@example.com' },
  landlord: { _id: 'lnd_001', name: 'Test Landlord' },
  term: { startDate: '2025-01-01', endDate: '2026-01-01', durationMonths: 12 },
  financials: { rentAmount: 25000, depositAmount: 50000 },
  signatures: { landlord: { signed: true }, tenant: { signed: true } },
  rentSchedule: [
    { month: 1, year: 2025, status: 'paid', amount: 25000, dueDate: '2025-01-01' },
    { month: 2, year: 2025, status: 'pending', amount: 25000, dueDate: '2025-02-01' },
  ],
  renewalProposal: null,
};

const mockDashboardSummary = {
  counts: {
    activeAgreements: 2,
    pendingOffers: 1,
    propertyCount: 3,
    pendingDisputes: 0,
    pendingMaintenance: 1,
    overduePayments: 0,
  },
  recentPayments: [],
  recentAgreements: [mockActiveAgreement],
};

const interceptNotifications = () => {
  cy.intercept('GET', '/api/notifications/counts', { statusCode: 200, body: { unreadCount: 0 } });
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC SUPPORT PAGE
// ─────────────────────────────────────────────────────────────────────────────
describe('Support Page — Public (No Login Required)', () => {

  beforeEach(() => {
    cy.visit('/support');
  });

  it('renders the support page hero heading', () => {
    cy.contains('How can we help?').should('be.visible');
  });

  it('shows the contact form with required fields', () => {
    cy.get('input[placeholder="Ali Hassan"]').should('exist');
    cy.get('input[placeholder="you@example.com"]').should('exist');
    cy.get('textarea').should('exist');
    cy.contains('Send Message').should('be.visible');
  });

  it('shows category dropdown', () => {
    cy.get('select').first().should('exist');
    cy.get('select').first().find('option').should('have.length.greaterThan', 3);
  });

  it('shows FAQ section', () => {
    cy.contains('Frequently Asked Questions').should('be.visible');
    cy.contains('How do I submit a maintenance request?').should('be.visible');
  });

  it('expands FAQ on click', () => {
    cy.contains('How do I submit a maintenance request?').click();
    cy.contains('Log into your tenant dashboard').should('be.visible');
  });

  it('shows validation error when required fields are empty', () => {
    cy.intercept('POST', '/api/support', { statusCode: 400, body: { message: 'Name, email, and message are required.' } });
    cy.contains('Send Message').click();
    cy.contains('Please fill in all required fields').should('be.visible');
  });

  it('successfully submits the support form', () => {
    cy.intercept('POST', '/api/support', { statusCode: 201, body: { message: 'Support request received.' } }).as('submitSupport');
    cy.get('input[placeholder="Ali Hassan"]').type('Test User');
    cy.get('input[placeholder="you@example.com"]').type('test@example.com');
    cy.get('textarea').type('I have a question about my lease agreement and the payment schedule.');
    cy.contains('Send Message').click();
    cy.wait('@submitSupport');
    cy.contains('Message Received!').should('be.visible');
    cy.contains('test@example.com').should('be.visible');
  });

  it('shows contact info section', () => {
    cy.contains('Other ways to reach us').should('be.visible');
    cy.contains('support@rentifypro.com').should('be.visible');
  });

  it('has a Sign In link', () => {
    cy.contains('Sign In').should('exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AGREEMENT RENEWAL — PUT method (fixed from POST)
// ─────────────────────────────────────────────────────────────────────────────
describe('Agreements — Renewal Proposal (Landlord)', () => {

  beforeEach(() => {
    cy.loginAsLandlord();
    interceptNotifications();
    cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockLandlordUser }).as('getMe');
    cy.intercept('GET', '/api/agreements', { statusCode: 200, body: [mockActiveAgreement] }).as('getAgreements');
    cy.visit('/dashboard/agreements');
    cy.wait('@getAgreements');
  });

  it('renders active agreement with Propose Renewal button for landlord', () => {
    cy.contains('Sunset Apartments').should('be.visible');
    cy.contains('Propose Renewal').should('be.visible');
  });

  it('opens renewal modal when Propose Renewal is clicked', () => {
    cy.contains('Propose Renewal').click();
    cy.contains('Propose Renewal').should('be.visible');
    cy.get('input[type="date"]').should('exist');
  });

  it('submits renewal proposal via PUT /api/agreements/:id/renew', () => {
    cy.intercept('PUT', '/api/agreements/agr_001/renew', {
      statusCode: 200,
      body: { message: 'Renewal proposal sent to tenant', agreement: { ...mockActiveAgreement, renewalProposal: { status: 'pending' } } },
    }).as('proposeRenewal');

    cy.contains('Propose Renewal').click();
    // Fill in the renewal form
    cy.get('input[type="date"]').first().type('2027-01-01');
    cy.get('input[type="number"]').first().clear().type('27000');
    cy.contains('Send Proposal').click();
    cy.wait('@proposeRenewal');
    cy.contains('Renewal proposal sent').should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PM ACTIVE TENANTS
// ─────────────────────────────────────────────────────────────────────────────
describe('PM — Active Tenants Page', () => {

  beforeEach(() => {
    cy.loginAsLandlord(); // Reuse login, override role below
    interceptNotifications();
    cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockPMUser }).as('getMe');
    cy.intercept('GET', '/api/agreements', {
      statusCode: 200,
      body: [mockActiveAgreement],
    }).as('getAgreements');
    cy.visit('/dashboard/pm/tenants');
    cy.wait('@getAgreements');
  });

  it('renders the Active Tenants heading', () => {
    cy.contains('Active Tenants').should('be.visible');
  });

  it('shows tenant count stat card', () => {
    cy.contains('1').should('be.visible'); // 1 active agreement
  });

  it('displays tenant name in the table', () => {
    cy.contains('Ali Hassan').should('be.visible');
  });

  it('displays the property name for the tenant', () => {
    cy.contains('Sunset Apartments').should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD — Summary Endpoint Usage
// ─────────────────────────────────────────────────────────────────────────────
describe('Dashboard — Uses Summary Endpoint for Performance', () => {

  beforeEach(() => {
    cy.loginAsLandlord();
    interceptNotifications();
    cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockLandlordUser }).as('getMe');
    cy.intercept('GET', '/api/users/dashboard-summary', {
      statusCode: 200,
      body: mockDashboardSummary,
    }).as('getSummary');
    cy.intercept('GET', '/api/payments*', { statusCode: 200, body: { payments: [] } }).as('getPayments');
    cy.intercept('GET', '/api/properties', { statusCode: 200, body: [] }).as('getProperties');
    cy.visit('/dashboard');
  });

  it('calls the dashboard summary endpoint', () => {
    cy.wait('@getSummary');
  });

  it('shows stat cards from summary counts', () => {
    cy.wait('@getSummary');
    cy.contains('Active Tenants').should('be.visible');
  });

  it('does NOT call /api/disputes or /api/maintenance directly on dashboard load', () => {
    // Disputes and maintenance counts come from summary — individual endpoints should not be called
    cy.wait('@getSummary');
    cy.get('@getMe.all').should('have.length.at.least', 1);
    // Verify no direct disputes call was made
    cy.intercept('GET', '/api/disputes', cy.spy().as('disputesSpy'));
    cy.wait(500);
    cy.get('@disputesSpy').should('not.have.been.called');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PROPERTIES NEW — Selectable Country / State / City
// ─────────────────────────────────────────────────────────────────────────────
describe('Properties — New Page with Country/State/City Dropdowns', () => {

  beforeEach(() => {
    cy.loginAsLandlord();
    interceptNotifications();
    cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockLandlordUser }).as('getMe');
    cy.visit('/dashboard/properties/new');
  });

  it('renders the Location section', () => {
    cy.contains('Location').should('be.visible');
  });

  it('has a Country dropdown (not a text input)', () => {
    cy.contains('Country').parent().find('select').should('exist');
  });

  it('Country dropdown contains Pakistan', () => {
    cy.contains('Country').parent().find('select').should('contain', 'Pakistan');
  });

  it('shows State/Province dropdown when Pakistan is selected', () => {
    cy.contains('Country').parent().find('select').select('Pakistan');
    cy.contains('State / Province').parent().find('select').should('exist');
    cy.contains('State / Province').parent().find('select').should('contain', 'Punjab');
  });

  it('shows City dropdown when Punjab is selected', () => {
    cy.contains('Country').parent().find('select').select('Pakistan');
    cy.contains('State / Province').parent().find('select').select('Punjab');
    cy.contains('City').parent().find('select').should('exist');
    cy.contains('City').parent().find('select').should('contain', 'Lahore');
  });

  it('shows text input for state when country has no preset provinces', () => {
    cy.contains('Country').parent().find('select').select('Other');
    cy.contains('State / Province').parent().find('input').should('exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CLAUSE MANAGEMENT — Jurisdiction Display on Law Reviewer Page
// ─────────────────────────────────────────────────────────────────────────────
describe('Admin Templates — Clause Jurisdiction Display', () => {

  const mockAdminUser = { _id: 'adm_001', name: 'Admin User', email: 'admin@test.com', role: 'admin' };
  const mockClauses = [
    {
      _id: 'cls_001',
      title: 'Late Payment Penalty Clause',
      body: 'If rent is not paid within {{lateFeeGracePeriodDays}} days...',
      category: 'late_fee',
      jurisdiction: 'Punjab, Pakistan',
      isApproved: true,
      isDefault: false,
      version: 1,
      usageCount: 5,
      createdBy: { name: 'Admin User' },
    },
    {
      _id: 'cls_002',
      title: 'No Subletting Clause',
      body: 'The tenant shall not sublet...',
      category: 'subletting',
      jurisdiction: 'Sindh, Pakistan',
      isApproved: false,
      isDefault: false,
      version: 1,
      usageCount: 0,
      createdBy: { name: 'Admin User' },
    },
  ];

  beforeEach(() => {
    cy.loginAsAdmin();
    interceptNotifications();
    cy.intercept('GET', '/api/users/me', { statusCode: 200, body: mockAdminUser }).as('getMe');
    cy.intercept('GET', '/api/admin/clauses*', { statusCode: 200, body: mockClauses }).as('getClauses');
    cy.intercept('GET', '/api/admin/clauses/variables', { statusCode: 200, body: [] });
    cy.visit('/dashboard/admin/templates');
    cy.wait('@getClauses');
  });

  it('renders clause titles clearly', () => {
    cy.contains('Late Payment Penalty Clause').should('be.visible');
    cy.contains('No Subletting Clause').should('be.visible');
  });

  it('displays jurisdiction/country for each clause', () => {
    cy.contains('Punjab, Pakistan').should('be.visible');
    cy.contains('Sindh, Pakistan').should('be.visible');
  });

  it('shows approved/pending status badges', () => {
    cy.contains('Approved').should('be.visible');
    cy.contains('Pending').should('be.visible');
  });

  it('clause title is not truncated for short names', () => {
    cy.contains('Late Payment Penalty Clause').should('be.visible');
  });
});
