import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getDefaultRedirectForRole,
  isRoleAuthorizedForDashboardPath,
  delocalize
} from '@/lib/auth/routes';
import type { AuthenticatedNextRequest } from '@/types/auth';

const PUBLIC_AUTH_ROUTES = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/setup-password',
  '/login',
  '/platform-admin/login',
  '/setup-password'
];

function isPublicAuthRoute(pathname: string): boolean {
  const pure = delocalize(pathname);
  return PUBLIC_AUTH_ROUTES.some(
    (route) => pure === route || pure.startsWith(`${route}/`)
  );
}

function isProtectedRoute(pathname: string): boolean {
  const pure = delocalize(pathname);
  return pure === '/dashboard' || pure.startsWith('/dashboard/');
}

const handleAuth = auth((req: AuthenticatedNextRequest) => {
  const { pathname, search } = req.nextUrl;
  const session = req.auth;
  const isAuthenticated = Boolean(session?.user && session?.accessToken);
  const role = session?.user?.role;
  const defaultRedirect = getDefaultRedirectForRole(role);

  if (isPublicAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL(defaultRedirect, req.url));
  }

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const signInUrl = new URL('/login', req.url);
    const callbackUrl = `${pathname}${search}`;
    signInUrl.searchParams.set('callbackUrl', callbackUrl);
    return NextResponse.redirect(signInUrl);
  }

  if (isProtectedRoute(pathname) && isAuthenticated) {
    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL(defaultRedirect, req.url));
    }

    if (!isRoleAuthorizedForDashboardPath(role, pathname)) {
      return NextResponse.redirect(new URL(defaultRedirect, req.url));
    }
  }

  return NextResponse.next();
});

export const proxy = handleAuth;
export default handleAuth;

export const config = {
  matcher: [
    '/((?!api|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
};