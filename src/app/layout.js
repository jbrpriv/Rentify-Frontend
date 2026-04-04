import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { UserProvider } from '@/context/UserContext';
import { ToastProvider } from '@/context/ToastContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { BrandingProvider } from '@/context/BrandingContext';
import { Toaster } from 'react-hot-toast';
import FCMListener from '@/components/FCMListener';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'RentifyPro',
  description: 'Rental Agreement Platform',
};

const DEFAULT_BRANDING = {
  brandName: 'RentifyPro',
  supportEmail: 'support@rentifypro.com',
};

async function getInitialBranding() {
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

export default async function RootLayout({ children }) {
  const initialBranding = await getInitialBranding();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased rf-shell`}>
        <BrandingProvider initialBranding={initialBranding}>
          <UserProvider>
            <CurrencyProvider>
              <ToastProvider>
                {children}
                <FCMListener />
                <Toaster />
              </ToastProvider>
            </CurrencyProvider>
          {/* reCAPTCHA v3 — loaded site-wide, used on login and register */}
          {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
            <Script
              src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
              strategy="afterInteractive"
            />
          )}
          </UserProvider>
        </BrandingProvider>
      </body>
    </html>
  );
}