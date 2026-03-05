// Import custom commands
import './commands';

// Suppress uncaught exception errors from Next.js hydration in tests
Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('hydrat') || err.message.includes('Minified React')) {
        return false;
    }
});