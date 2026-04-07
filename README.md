# Rentify Frontend

Frontend application for the Rentify rental workflow platform (Next.js, App Router).

## Purpose

This frontend handles:

- Authentication and onboarding
- Property listing and browsing
- Offer negotiation
- Agreement drafting and signing
- Tenant document review
- Rent payment initiation (Stripe)
- Role-based dashboards for landlord, tenant, property manager, law reviewer, and admin

## Role-Based Workflow

### 1) Landlord Workflow

1. Goes to the Properties page.
2. Adds a property.
3. Publishes the property.
4. Receives tenant offers.
5. Reviews each offer and either:
	- counters the offer, or
	- accepts the offer and starts drafting an agreement.
6. Drafting panel includes key policy controls such as:
	- pet policy,
	- annual rent escalation,
	- termination policy.
7. Template selection behavior:
	- Enterprise landlord: can select agreement templates.
	- Free/Pro landlord: uses the default template selected by admin.
8. Adds clauses by drag-and-drop into the live agreement preview.
9. Finishes drafting.
10. Reviews tenant documents before signing.
11. Signs the agreement.
12. After tenant payment, sees pending rent in Dashboard Overview (rent not yet withdrawn).
13. Connects Stripe Connect from Profile so approved payouts can be transferred.
14. Can invite a Property Manager to handle tenant messaging and maintenance operations.

### 2) Tenant Workflow

1. Goes to Browse page.
2. Views a property.
3. Submits an offer.
4. If landlord accepts/counters and agreement is finalized, tenant signs the agreement.
5. Agreement location for tenant is under My Lease.
6. After signing, tenant is prompted to pay initial amount via Stripe.
7. Payment is recorded in platform payment records.

### 3) Property Manager Workflow

1. Gets invited by landlord.
2. Manages assigned properties.
3. Handles tenant maintenance requests.
4. Handles tenant messaging/communication.

### 4) Law Reviewer Workflow

1. Creates clauses.
2. Reviews and approves clauses for platform use.

### 5) Admin Workflow

1. Sets/controls overall platform defaults (including default template used by Free/Pro landlords).
2. Monitors global activity and platform health.
3. Reviews payment approvals:
	- tenant pays initial amount,
	- landlord sees pending rent,
	- admin approves,
	- funds are sent to landlord Stripe account (if landlord connected Stripe Connect).
4. Oversees users, agreements, audit logs, billing, and operational data.

## Agreement Visibility by Role

- Landlord: Dashboard → Agreements
- Tenant: Dashboard → My Lease

## Payments and Payout Flow

1. Tenant signs agreement.
2. Tenant pays initial amount via Stripe.
3. Payment is stored in system records.
4. Landlord sees pending rent in overview.
5. Admin approves payout.
6. Payout is sent to landlord Stripe account (requires Stripe Connect under landlord profile).

## Notes

- This repo is the frontend only.
- Backend APIs, Stripe workflows, clause approval logic, and agreement generation are consumed through backend endpoints.
- Deployed on Vercel.

## Deployment

- Production URL: https://rentify-frontend-naa6-vercel.app
- Platform: Vercel

## Environment Variables

Create `.env.local` for local development and configure the same values in Vercel Project Settings for production.

### Required

- `NEXT_PUBLIC_API_URL`
	- Frontend API base URL (for example: `https://your-backend-domain/api`)
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
	- Google reCAPTCHA v3 site key used on auth pages

### Required for Push Notifications (FCM)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

### Optional (E2E)

- `CYPRESS_BASE_URL`
	- Used by Cypress config, defaults to `https://rentify-frontend-naa6.vercel.app`

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

CYPRESS_BASE_URL=https://rentify-frontend-naa6.vercel.app
```
