import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { UserProvider } from '@/context/UserContext';
import { ToastProvider } from '@/context/ToastContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased rf-shell`}>
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
      </body>
    </html>
  );
}