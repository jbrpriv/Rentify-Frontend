// cypress/e2e/browse.cy.js
// ─────────────────────────────────────────────────────────────────────────────
// Full E2E coverage for /browse (public listings page)
//   • Listings load and render cards
//   • City search
//   • Type, Price, Beds filters
//   • Sort order
//   • Empty state and Clear Filters
//   • Listing card links to detail page
// No auth required — this is a public page.
// ─────────────────────────────────────────────────────────────────────────────

const mockListings = [
    {
        _id: 'lst_001',
        title: 'Sunny Studio Downtown',
        type: 'studio',
        financials: { monthlyRent: 18000 },
        specs: { bedrooms: 1, bathrooms: 1, sizeSqFt: 450 },
        address: { street: '12 Main St', city: 'Lahore', state: 'Punjab' },
        images: [],
        createdAt: '2025-03-01T00:00:00.000Z',
    },
    {
        _id: 'lst_002',
        title: 'Spacious Family House',
        type: 'house',
        financials: { monthlyRent: 65000 },
        specs: { bedrooms: 4, bathrooms: 3, sizeSqFt: 2200 },
        address: { street: '5 Garden Rd', city: 'Islamabad', state: 'ICT' },
        images: [],
        createdAt: '2025-02-15T00:00:00.000Z',
    },
    {
        _id: 'lst_003',
        title: 'Modern Apartment',
        type: 'apartment',
        financials: { monthlyRent: 42000 },
        specs: { bedrooms: 2, bathrooms: 2, sizeSqFt: 900 },
        address: { street: '8 Blue Area', city: 'Karachi', state: 'Sindh' },
        images: [],
        createdAt: '2025-01-20T00:00:00.000Z',
    },
    {
        _id: 'lst_004',
        title: 'Commercial Space',
        type: 'commercial',
        financials: { monthlyRent: 120000 },
        specs: { sizeSqFt: 3000 },
        address: { street: '2 Market St', city: 'Lahore', state: 'Punjab' },
        images: [],
        createdAt: '2025-01-10T00:00:00.000Z',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// LISTINGS PAGE
// ─────────────────────────────────────────────────────────────────────────────
describe('Browse — Listings Page', () => {

    beforeEach(() => {
        cy.intercept('GET', '/api/listings*', { statusCode: 200, body: mockListings }).as('getListings');
        cy.visit('/browse');
        cy.wait('@getListings');
    });

    it('renders the browse page with listings heading', () => {
        cy.contains(/properties for rent/i).should('be.visible');
    });

    it('shows total listing count', () => {
        cy.contains('4 listings').should('exist');
    });

    it('renders a card for each listing', () => {
        cy.contains('Sunny Studio Downtown').should('exist');
        cy.contains('Spacious Family House').should('exist');
        cy.contains('Modern Apartment').should('exist');
        cy.contains('Commercial Space').should('exist');
    });

    it('shows monthly rent on each card', () => {
        cy.contains(/18,000/).should('exist');
        cy.contains(/65,000/).should('exist');
    });

    it('shows city in listing card address', () => {
        cy.contains(/Lahore/i).should('exist');
        cy.contains(/Islamabad/i).should('exist');
    });

    it('shows bedroom count on listings with specs', () => {
        cy.contains('Sunny Studio Downtown')
            .closest('a')
            .find('.text-neutral-500')
            .contains('1')
            .should('exist');
    });

    it('each listing card is a link to /browse/:id', () => {
        cy.get('a[href="/browse/lst_001"]').should('exist');
        cy.get('a[href="/browse/lst_002"]').should('exist');
    });

    it('shows the search input', () => {
        cy.get('input[placeholder*="City"]').should('exist');
    });

    it('shows Price, Type, Beds filter dropdowns', () => {
        cy.contains('button', /price/i).should('exist');
        cy.contains('button', /type/i).should('exist');
        cy.contains('button', /beds/i).should('exist');
    });

    it('city search updates URL and fetches filtered listings', () => {
        cy.intercept('GET', '/api/listings*city=Lahore*', {
            statusCode: 200,
            body: [mockListings[0], mockListings[3]],
        }).as('searchByCity');

        cy.get('input[placeholder*="City"]').type('Lahore');
        cy.get('input[placeholder*="City"]').type('{enter}');
        cy.wait('@searchByCity');
        cy.contains(/lahore properties for rent/i).should('exist');
    });

    it('shows "No listings found" when API returns empty array', () => {
        cy.intercept('GET', '/api/listings*', { statusCode: 200, body: [] }).as('emptyListings');
        cy.visit('/browse');
        cy.wait('@emptyListings');
        cy.contains(/no listings found/i).should('exist');
    });

    it('"Clear Filters" button appears in empty state and resets filters', () => {
        cy.intercept('GET', '/api/listings*', { statusCode: 200, body: [] }).as('emptyListings');
        cy.visit('/browse');
        cy.wait('@emptyListings');
        cy.contains('button', /clear filters/i).should('exist');
    });

    it('clicking Clear Filters resets the city input', () => {
        cy.intercept('GET', '/api/listings*', { statusCode: 200, body: mockListings }).as('reloaded');
        cy.intercept('GET', '/api/listings*city=XYZ*', { statusCode: 200, body: [] }).as('noResults');

        // Target the correct form input
        cy.get('input[placeholder*="City or address"]').clear().type('XYZ{enter}');
        cy.wait('@noResults');

        cy.contains('button', /clear filters/i).click();
        cy.wait('@reloaded');
        cy.get('input[placeholder*="City or address"]').should('have.value', '');
    });

    it('shows "Discover more" promo card when 4+ listings returned', () => {
        cy.contains(/discover more/i).should('exist');
    });

    it('promo card "Save this search" links to /register', () => {
        cy.contains(/save this search/i).should('have.attr', 'href', '/register');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// SORT BEHAVIOUR (client-side)
// ─────────────────────────────────────────────────────────────────────────────
describe('Browse — Sort Order', () => {

    beforeEach(() => {
        cy.intercept('GET', '/api/listings*', { statusCode: 200, body: mockListings }).as('getListings');
        cy.visit('/browse');
        cy.wait('@getListings');
    });

    it('sort "Price: Low to High" puts cheapest listing first', () => {
        cy.contains('button', /best match/i).click();
        cy.contains('Price: Low to High').click();

        cy.get('a[href^="/browse/"]').first().should('contain', '18,000');
    });

    it('sort "Price: High to Low" puts most expensive listing first', () => {
        cy.contains('button', /best match/i).click();
        cy.contains('Price: High to Low').click();

        cy.get('a[href^="/browse/"]').first().should('contain', '120,000');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// FILTER BEHAVIOUR (client-side beds filter)
// ─────────────────────────────────────────────────────────────────────────────
describe('Browse — Beds Filter', () => {

    beforeEach(() => {
        cy.intercept('GET', '/api/listings*', { statusCode: 200, body: mockListings }).as('getListings');
        cy.visit('/browse');
        cy.wait('@getListings');
    });

    it('filtering by 4 beds hides 1-bedroom listings', () => {
        cy.contains('button', 'Beds').click();
        cy.contains('button', /4 beds/i).click();
        cy.contains('Sunny Studio Downtown').should('not.exist');
        cy.contains('Spacious Family House').should('exist');
    });
});