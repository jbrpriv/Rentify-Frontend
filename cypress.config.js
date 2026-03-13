const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        baseUrl: process.env.CYPRESS_BASE_URL || 'https://rentify-frontend-naa6.vercel.app',
        specPattern: 'cypress/e2e/**/*.cy.js',
        supportFile: 'cypress/support/e2e.js',
        viewportWidth: 1280,
        viewportHeight: 800,
        video: false,
        screenshotOnRunFailure: true,
        defaultCommandTimeout: 10000,
        requestTimeout: 15000,
        responseTimeout: 15000,
        pageLoadTimeout: 30000,

        // Required for cy.session() to cache cookies + localStorage across visits
        experimentalSessionAndOrigin: true,

        setupNodeEvents(on, config) {
            return config;
        },
    },
});