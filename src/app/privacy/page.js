import Link from 'next/link';
import { Building2, Shield, Mail, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How we collect, use, and protect your personal data.',
};

const LAST_UPDATED = 'March 2026';
const DEFAULT_BRANDING = {
  brandName: 'RentifyPro',
  supportEmail: 'support@rentifypro.com',
};

async function getBranding() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase) return DEFAULT_BRANDING;

    const endpoint = `${apiBase.replace(/\/$/, '')}/settings/branding`;
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) return DEFAULT_BRANDING;

    const data = await res.json();
    return {
      brandName: data?.brandName || DEFAULT_BRANDING.brandName,
      supportEmail: data?.supportEmail || DEFAULT_BRANDING.supportEmail,
    };
  } catch {
    return DEFAULT_BRANDING;
  }
}

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="mb-4 text-xl font-bold text-[#0B2D72]">{title}</h2>
    <div className="space-y-3 text-[0.95rem] leading-relaxed text-neutral-600">
      {children}
    </div>
  </section>
);

export default async function PrivacyPage() {
  const { brandName: COMPANY_NAME, supportEmail: CONTACT_EMAIL } = await getBranding();

  return (
    <div className="min-h-screen bg-[#F8FBFC]">

      {/* Header bar */}
      <header className="border-b border-[#0992C2]/15 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0992C2] to-[#0B2D72] shadow-md shadow-[#0992C2]/30">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-neutral-900">{COMPANY_NAME}</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-[#0992C2] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0B2D72] via-[#0992C2] to-[#0AC4E0] px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-white/80">Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-white/70 max-w-xl mx-auto text-sm leading-relaxed">
            We respect your privacy and are committed to protecting your personal data.
            This policy explains what we collect, how we use it, and your rights.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-14">

        <Section title="1. Who We Are">
          <p>
            {COMPANY_NAME} is a digital rental agreement platform that connects landlords,
            tenants, and property managers. We provide tools for property listings, lease
            agreements, rent payments, maintenance requests, and secure communications.
          </p>
          <p>
            For any privacy-related questions, contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0992C2] hover:underline font-medium">
              {CONTACT_EMAIL}
            </a>.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect the following categories of personal data:</p>
          <ul className="ml-5 mt-2 space-y-2 list-disc">
            <li>
              <strong className="text-neutral-800">Account information</strong> — your name,
              email address, phone number, and password (stored encrypted) when you register.
            </li>
            <li>
              <strong className="text-neutral-800">Profile data</strong> — profile photo,
              role (landlord, tenant, property manager), and subscription tier.
            </li>
            <li>
              <strong className="text-neutral-800">Property data</strong> — property addresses,
              images, descriptions, and financial terms entered by landlords.
            </li>
            <li>
              <strong className="text-neutral-800">Agreement data</strong> — lease terms,
              digital signatures (including IP address and timestamp), and clause content.
            </li>
            <li>
              <strong className="text-neutral-800">Payment data</strong> — payment amounts
              and dates. We do <strong>not</strong> store card numbers — payments are processed
              by Stripe and governed by{' '}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0992C2] hover:underline">
                Stripe&apos;s Privacy Policy
              </a>.
            </li>
            <li>
              <strong className="text-neutral-800">Communications</strong> — messages sent
              between users through our platform messaging system.
            </li>
            <li>
              <strong className="text-neutral-800">Technical data</strong> — IP address,
              browser type, device type, and usage logs for security and analytics.
            </li>
            <li>
              <strong className="text-neutral-800">Social login data</strong> — if you sign
              in with Google or Facebook, we receive your name, email, and profile photo
              from that provider. We do not receive or store your social media passwords.
            </li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use your data to:</p>
          <ul className="ml-5 mt-2 space-y-1.5 list-disc">
            <li>Create and manage your account</li>
            <li>Facilitate rental agreements between landlords and tenants</li>
            <li>Process rent payments and generate receipts</li>
            <li>Send transactional notifications (payment reminders, maintenance updates, lease alerts)</li>
            <li>Enable real-time messaging between platform users</li>
            <li>Verify your identity via email OTP and phone OTP</li>
            <li>Prevent fraud and ensure platform security</li>
            <li>Improve our services through aggregated, anonymised analytics</li>
          </ul>
          <p className="mt-3">
            We do <strong>not</strong> sell your personal data to third parties. We do not
            use your data for advertising purposes.
          </p>
        </Section>

        <Section title="4. Legal Basis for Processing">
          <p>We process your data on the following legal grounds:</p>
          <ul className="ml-5 mt-2 space-y-1.5 list-disc">
            <li><strong className="text-neutral-800">Contract performance</strong> — to provide the services you signed up for</li>
            <li><strong className="text-neutral-800">Legitimate interests</strong> — to maintain platform security and prevent fraud</li>
            <li><strong className="text-neutral-800">Consent</strong> — for optional SMS notifications (which you can withdraw at any time in your profile settings)</li>
            <li><strong className="text-neutral-800">Legal obligation</strong> — to comply with applicable laws</li>
          </ul>
        </Section>

        <Section title="5. Data Sharing">
          <p>We share your data only with:</p>
          <ul className="ml-5 mt-2 space-y-2 list-disc">
            <li>
              <strong className="text-neutral-800">Other platform users</strong> — landlords
              and tenants share relevant data (name, contact info, lease terms) as part of the
              rental process.
            </li>
            <li>
              <strong className="text-neutral-800">Stripe</strong> — for payment processing.
            </li>
            <li>
              <strong className="text-neutral-800">Twilio</strong> — for SMS notifications
              (only if you have opted in).
            </li>
            <li>
              <strong className="text-neutral-800">Cloudinary</strong> — for property image
              and document storage.
            </li>
            <li>
              <strong className="text-neutral-800">AWS S3</strong> — for signed agreement
              PDF storage.
            </li>
            <li>
              <strong className="text-neutral-800">Firebase</strong> — for push notifications
              (only if you have granted permission).
            </li>
            <li>
              <strong className="text-neutral-800">Google / Facebook</strong> — only if you
              choose to sign in via those providers.
            </li>
          </ul>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain your personal data for as long as your account is active. If you delete
            your account, we will remove your personal information within <strong>30 days</strong>,
            except where we are required by law to retain certain records (e.g. financial
            transaction records, which are retained for 7 years in accordance with tax regulations).
          </p>
          <p>
            Signed lease agreements may be retained for the duration of the lease plus 7 years
            as they constitute legally binding contracts.
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>
            We use a single <strong>HttpOnly</strong> cookie to store your refresh token for
            authentication. This cookie is not accessible to JavaScript and is used solely to
            keep you logged in securely. We do not use advertising cookies or third-party
            tracking cookies.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>Depending on your location, you may have the right to:</p>
          <ul className="ml-5 mt-2 space-y-1.5 list-disc">
            <li><strong className="text-neutral-800">Access</strong> — request a copy of the personal data we hold about you</li>
            <li><strong className="text-neutral-800">Rectification</strong> — correct inaccurate data</li>
            <li><strong className="text-neutral-800">Erasure</strong> — request deletion of your data (see our <Link href="/data-deletion" className="text-[#0992C2] hover:underline">Data Deletion page</Link>)</li>
            <li><strong className="text-neutral-800">Portability</strong> — receive your data in a machine-readable format</li>
            <li><strong className="text-neutral-800">Object</strong> — object to certain types of processing</li>
            <li><strong className="text-neutral-800">Withdraw consent</strong> — for processing based on consent (e.g. SMS notifications)</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0992C2] hover:underline font-medium">
              {CONTACT_EMAIL}
            </a>{' '}
            and we will respond within 30 days.
          </p>
        </Section>

        <Section title="9. Security">
          <p>
            We protect your data using industry-standard measures including TLS encryption
            in transit, bcrypt password hashing, JWT authentication with short-lived access
            tokens, HttpOnly refresh token cookies, and role-based access control on all
            API endpoints. Signed agreement PDFs are stored encrypted on AWS S3 with
            server-side encryption and private access only.
          </p>
          <p>
            While we take every reasonable precaution, no system is 100% secure. If you
            discover a security vulnerability, please report it responsibly to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#0992C2] hover:underline font-medium">
              {CONTACT_EMAIL}
            </a>.
          </p>
        </Section>

        <Section title="10. Children">
          <p>
            {COMPANY_NAME} is not directed at children under the age of 18. We do not
            knowingly collect personal data from minors. If you believe a minor has
            created an account, please contact us and we will delete it promptly.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we will
            update the &quot;Last updated&quot; date at the top of this page and, where
            the changes are significant, notify you via email or an in-app notice.
          </p>
        </Section>

        <Section title="12. Contact Us">
          <p>
            If you have any questions, concerns, or requests relating to this Privacy
            Policy, please contact our privacy team:
          </p>
          <div className="mt-4 rounded-2xl border border-[#0992C2]/20 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0992C2]/10">
                <Mail className="h-5 w-5 text-[#0992C2]" />
              </div>
              <div>
                <p className="font-semibold text-neutral-800">{COMPANY_NAME} Privacy Team</p>
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-[#0992C2] hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </Section>

        {/* Data deletion CTA */}
        <div className="mt-8 rounded-2xl border border-[#0992C2]/20 bg-gradient-to-br from-[#0992C2]/5 to-[#0AC4E0]/10 p-6 text-center">
          <p className="font-semibold text-neutral-800 mb-2">Want to delete your data?</p>
          <p className="text-sm text-neutral-500 mb-4">
            You can request full deletion of your account and all associated data.
          </p>
          <Link
            href="/data-deletion"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0992C2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0B2D72] transition-colors"
          >
            Request Data Deletion
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#0992C2]/15 py-6 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved. &nbsp;·&nbsp;
        <Link href="/privacy" className="hover:text-[#0992C2] transition-colors">Privacy Policy</Link>
        &nbsp;·&nbsp;
        <Link href="/data-deletion" className="hover:text-[#0992C2] transition-colors">Data Deletion</Link>
      </footer>
    </div>
  );
}
