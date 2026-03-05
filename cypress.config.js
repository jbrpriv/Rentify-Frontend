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
        defaultCommandTimeout: 8000,
        requestTimeout: 10000,
        setupNodeEvents(on, config) {
            return config;
        },
    },
});