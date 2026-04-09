import { NextResponse } from 'next/server';

// ─── Route groups ───────────────────────────────────────────────────────────
const PUBLIC_PATHS = [
  '/',
  '/pricing',
  '/privacy',
  '/support',
  '/data-deletion',
  '/browse',
];

// Auth pages that logged-in users should be bounced away from (SEC-05)
const AUTH_PATH_SEGMENTS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

// Role-based route prefixes — values are the roles ALLOWED on that prefix.
// The API enforces these too; this is an early client-side guard for UX.
// Requires the non-HttpOnly `userRole` cookie set by authController.
const ROLE_PREFIXES = {
  '/dashboard/admin':    ['admin'],
  '/dashboard/landlord': ['landlord', 'admin'],
  '/dashboard/pm':       ['property_manager', 'admin'],
  '/dashboard/my-lease': ['tenant'],
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function isPublic(pathname) {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
}

function isAuthPage(pathname) {
  return AUTH_PATH_SEGMENTS.some(segment =>
    pathname === segment ||
    pathname.endsWith(segment) ||
    pathname.includes('/(auth)' + segment)
  );
}

// ─── Middleware ─────────────────────────────────────────────────────────────
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Always pass through internals and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Auth is handled client-side via UserContext + localStorage (cross-domain setup).
  // Middleware only handles static public/auth page rules; API enforces real auth.
  const userInfo = request.cookies.get('userInfo')?.value;
  let isLoggedIn = false;
  let userRole = '';
  try {
    if (userInfo) {
      const parsed = JSON.parse(decodeURIComponent(userInfo));
      isLoggedIn = !!parsed?.token;
      userRole = parsed?.role || '';
    }
  } catch {}

  // Public pages — always accessible
  if (isPublic(pathname)) return NextResponse.next();

  // SEC-05: Redirect already-logged-in users away from auth pages
  if (isLoggedIn && isAuthPage(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Auth pages — always accessible if not logged in
  if (isAuthPage(pathname)) return NextResponse.next();

  // Dashboard routes — let client-side UserContext handle redirect if not logged in
  if (pathname.startsWith('/dashboard')) {
    for (const [prefix, allowedRoles] of Object.entries(ROLE_PREFIXES)) {
      if (pathname.startsWith(prefix) && userRole && !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
