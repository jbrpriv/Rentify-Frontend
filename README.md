# Rentify Frontend

Rentify Frontend is the Next.js application that powers the user experience for RentifyPro: authentication, browsing, dashboards, agreement review, payments, notifications, and account management.

## Overview

This app covers:

- Authentication and onboarding flows
- Property browsing and detail pages
- Offers, negotiations, and agreement flows
- Role-based dashboards for tenants, landlords, property managers, law reviewers, and admins
- Billing, payments, and Stripe Connect onboarding
- Push notifications, messaging, and PWA support
- Settings, privacy, and account management screens

## Tech Stack

- Next.js App Router
- React 19
- Tailwind CSS 4
- Axios for API calls
- Socket.IO client for real-time updates
- Firebase Web SDK for push notifications
- Recharts for dashboards and analytics
- Framer Motion for animation
- MapLibre GL for map views
- Three.js and React Three Fiber for 3D/visual components
- Cypress for end-to-end tests

## Application Areas

### Authentication

- Login
- Register
- Forgot password
- Reset password
- Email verification
- OAuth completion and success flows

### Discovery

- Browse listings
- Listing detail pages
- Search and filtering

### Dashboards

- Tenant dashboard and My Lease
- Landlord dashboard and property management tools
- Property manager workspace
- Admin control center
- Billing, documents, messages, notifications, disputes, analytics, and settings

### Platform utilities

- Brand-aware UI driven from backend settings
- Firebase Cloud Messaging registration
- PWA registration and service worker support
- Privacy and legal pages

## Role Workflows

### Landlord

- Add and publish properties
- Review offers and negotiate terms
- Build and finalize agreements
- Review tenant documents
- Manage maintenance and messaging
- Connect Stripe Connect for payouts

### Tenant

- Browse properties
- Submit offers
- Review and sign agreements
- Pay the initial rent/deposit flow
- Track payments, messages, and maintenance requests

### Property Manager

- Accept invitations from landlords
- Manage assigned properties
- Respond to messages and maintenance requests

### Law Reviewer

- Create and review clauses used by the platform

### Admin

- Manage platform settings and templates
- Review payments and approvals
- Oversee users, agreements, audit logs, billing, and operational data

## Repository Layout

- `src/app/` App Router pages and layouts
- `src/components/` UI and feature components
- `src/context/` React context providers
- `src/utils/` API helpers and service adapters
- `public/` static assets, icons, and the Firebase service worker
- `cypress/` end-to-end specs and support files
- `next.config.mjs` rewrite and header rules

## Prerequisites

- Node.js 20 or newer
- Access to the backend API
- A Firebase project if push notifications are enabled
- A Google reCAPTCHA v3 site key if auth anti-bot protection is enabled

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` for local development.

## Environment Variables

The frontend reads public environment variables only.

| Variable | Purpose | Required when |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Always recommended; defaults to `/api` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Google reCAPTCHA v3 site key | Auth pages and anti-bot flows |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web config | Push notifications |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase web config | Push notifications |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase web config | Push notifications |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase web config | Push notifications |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase web config | Push notifications |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web config | Push notifications |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Firebase Web Push certificate key | Push notifications |
| `CYPRESS_BASE_URL` | Cypress target URL | End-to-end tests |

### Example `.env.local`

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain/api
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_web_push_vapid_key

CYPRESS_BASE_URL=https://your-frontend-domain
```

## Local Development

Start the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run the production build locally:

```bash
npm run start
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## API Integration

- The app uses `NEXT_PUBLIC_API_URL` for backend calls.
- If `NEXT_PUBLIC_API_URL` is not set, the client falls back to `/api`.
- The repo currently includes an `/api/:path*` rewrite in `next.config.mjs` that forwards requests to the backend host configured there.
- If you deploy the backend somewhere else, update that rewrite target or set `NEXT_PUBLIC_API_URL` to the correct API origin.

## Authentication and Security

- Auth pages use reCAPTCHA when `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is present.
- The client stores the short-lived access token in memory and relies on the backend refresh cookie for rehydration.
- OAuth completion flows are handled in the App Router under `src/app/auth/oauth`.

## Push Notifications

- Firebase Cloud Messaging is configured from the public Firebase environment variables.
- The service worker lives in `public/firebase-messaging-sw.js`.
- Notification registration is performed by the app shell and foreground listener components.

## Deployment

### Vercel

The frontend is intended to deploy on Vercel.

Deployment checklist:

- Set all `NEXT_PUBLIC_*` environment variables in Vercel Project Settings
- Point `NEXT_PUBLIC_API_URL` at the deployed backend API
- Ensure the backend allows the Vercel origin in CORS via `CLIENT_URL`
- Verify the Firebase service worker and web push credentials in production

### Backend dependency

The frontend is not standalone. It depends on the backend for authentication, listings, payments, agreements, and branding data.

### Current deployment shape

- Frontend: Vercel
- Backend API: Fly.io / Docker-based deployment

## Testing

End-to-end tests use Cypress.

```bash
npm run lint
```

To run Cypress, configure `CYPRESS_BASE_URL` for the target environment and launch the Cypress runner according to your local setup.

## Notes

- `src/app/layout.js` fetches branding data from the backend when the API URL is available.
- `next.config.mjs` also sets caching headers for the Firebase service worker and web manifest.
- The app includes privacy and policy pages, dashboard error handling, and PWA registration.

## Troubleshooting

- If login fails, confirm `NEXT_PUBLIC_API_URL` points to the correct backend and that the backend `CLIENT_URL` matches the frontend origin.
- If reCAPTCHA does not render, verify the site key is present and valid.
- If push notifications do not arrive, confirm the Firebase public config, VAPID key, and backend Firebase credentials are all set.
- If Cypress tests hit the wrong site, override `CYPRESS_BASE_URL`.

## Workflows

### Landlord Workflow

1. Go to the Properties page.
2. Add a property.
3. Publish the property.
4. Receive tenant offers.
5. Review each offer and either counter it or accept it and start drafting an agreement.
6. Use the drafting panel to set policy controls such as pet policy, annual rent escalation, and termination policy.
7. Template selection depends on plan tier.
8. Enterprise landlords can select agreement templates.
9. Free and Pro landlords use the default template selected by admin.
10. Add clauses by drag-and-drop into the live agreement preview.
11. Finish drafting.
12. Review tenant documents before signing.
13. Sign the agreement.
14. After tenant payment, review pending rent in the dashboard overview until payout approval completes.
15. Connect Stripe Connect from Profile so approved payouts can be transferred.
16. Invite a Property Manager to handle tenant messaging and maintenance operations.

### Tenant Workflow

1. Go to Browse.
2. View a property.
3. Submit an offer.
4. If the landlord accepts or counters and the agreement is finalized, sign the agreement.
5. Find the agreement under My Lease.
6. After signing, pay the initial amount via Stripe.
7. Review payment records in the platform history.

### Property Manager Workflow

1. Receive an invitation from a landlord.
2. Manage assigned properties.
3. Handle tenant maintenance requests.
4. Handle tenant messages and communication.

### Law Reviewer Workflow

1. Create clauses.
2. Review clauses.
3. Approve clauses for platform use.

### Admin Workflow

1. Set and control overall platform defaults, including the default template used by Free and Pro landlords.
2. Monitor global activity and platform health.
3. Review payment approvals.
4. Confirm the tenant pays the initial amount.
5. See the landlord’s pending rent.
6. Approve the payout.
7. Send funds to the landlord Stripe account if Stripe Connect is connected.
8. Oversee users, agreements, audit logs, billing, and operational data.

## Agreement Visibility by Role

- Landlord: Dashboard -> Agreements
- Tenant: Dashboard -> My Lease

## Payments and Payout Flow

1. Tenant signs the agreement.
2. Tenant pays the initial amount via Stripe.
3. The payment is stored in the platform records.
4. The landlord sees pending rent in the overview.
5. Admin approves the payout.
6. The payout is sent to the landlord Stripe account through Stripe Connect.
