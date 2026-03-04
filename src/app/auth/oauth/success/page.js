'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const PROVIDER_LABELS = { google: 'Google', facebook: 'Facebook' };

function OAuthSuccessContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  useEffect(() => {
    const token           = searchParams.get('token');
    const name            = searchParams.get('name');
    const role            = searchParams.get('role');
    const id              = searchParams.get('id');
    const email           = searchParams.get('email');
    const provider        = searchParams.get('provider') || 'google';
    const isNewUser       = searchParams.get('isNewUser') === 'true';
    const isPhoneVerified = searchParams.get('isPhoneVerified') === 'true';

    if (!token) {
      router.replace('/login?error=oauth_failed');
      return;
    }

    // Always save token immediately — complete-profile page needs it
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify({
      _id: id, name, role, email, isPhoneVerified, provider,
    }));

    if (isNewUser) {
      // Pass token in URL as well — belt-and-suspenders so complete-profile
      // can re-save it even if localStorage is cleared between navigations
      const params = new URLSearchParams({
        provider,
        email:  email || '',
        name:   name  || '',
        token,           // ← passed through so complete-profile can always auth
      });
      router.replace(`/auth/oauth/complete-profile?${params.toString()}`);
    } else {
      router.replace('/dashboard');
    }
  }, [searchParams, router]);

  const provider = searchParams.get('provider') || 'google';
  const label    = PROVIDER_LABELS[provider] ?? provider;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      <p className="text-gray-500 font-medium">Signing you in with {label}…</p>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
        <p className="text-gray-500 font-medium">Signing you in…</p>
      </div>
    }>
      <OAuthSuccessContent />
    </Suspense>
  );
}