import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { auth } from '@/auth';
import { routing } from '@/i18n/routing';
import { homePathForRole, loginPath, redirectForRole, extractLocale } from '@/lib/auth/routes';
import type { AuthenticatedNextRequest } from '@/types/auth';

const handleI18nRouting = createIntlMiddleware(routing);

function handleAuthRedirects(req: AuthenticatedNextRequest) {
  const { pathname } = req.nextUrl;

  // Clean up duplicated locale prefixes if any (e.g. /en/en/...)
  const repeatedLocalePrefix = pathname.match(/^\/(?:en|ur|ps)(?:\/(?:en|ur|ps))+(?=\/|$)/);
  if (repeatedLocalePrefix) {
    const url = req.nextUrl.clone();
    url.pathname = `/${repeatedLocalePrefix[0].split('/')[1]}${pathname.slice(repeatedLocalePrefix[0].length)}`;
    return NextResponse.redirect(url);
  }

  const locale = extractLocale(pathname);
  const session = req.auth;
  const isLoggedIn = Boolean(session?.user && session?.accessToken);
  const role = session?.user?.role;

  const isOwnerLoginPage = pathname.endsWith('/login') && !pathname.includes('/platform-admin');
  const isPlatformAdminLoginPage = /\/platform-admin\/login(\/|$)/.test(pathname);
  const isRegisterPage = pathname.endsWith('/register');
  const isSetupPasswordPage = pathname.endsWith('/setup-password');
  const isAnyAuthPage =
    isOwnerLoginPage || isPlatformAdminLoginPage || isRegisterPage || isSetupPasswordPage;

  const startsWithDashboard = /^\/(en|ur|ps)\/dashboard(\/|$)/.test(pathname);
  const isAuthApi = pathname.startsWith('/api/auth');
  const isStaticOrPwaAsset =
    pathname.startsWith('/serwist') ||
    pathname.startsWith('/~offline') ||
    pathname === '/manifest.webmanifest' ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/screenshots/') ||
    pathname === '/favicon.ico' ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.map') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel');

  if (isAuthApi || isStaticOrPwaAsset) {
    return handleI18nRouting(req);
  }

  // 1. Protected dashboard routes require authentication
  if (startsWithDashboard && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = loginPath(locale);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Logged-in users should not see auth/login/register pages
  if (isAnyAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL(homePathForRole(role, locale), req.nextUrl));
  }

  // 3. Role authorization within dashboard routes
  if (isLoggedIn && role) {
    const roleRedirect = redirectForRole(pathname, role);
    if (roleRedirect) {
      return NextResponse.redirect(new URL(roleRedirect, req.nextUrl));
    }
  }

  // 4. Root URL redirects
  if (pathname === '/' || /^\/(en|ur|ps)\/?$/.test(pathname)) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(homePathForRole(role, locale), req.nextUrl));
    }
    return NextResponse.redirect(new URL(loginPath(locale), req.nextUrl));
  }

  // 5. Bare dashboard URL redirects to role's home
  if (/^\/(en|ur|ps)\/dashboard\/?$/.test(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL(homePathForRole(role, locale), req.nextUrl));
  }

  // 6. All other requests are routed via next-intl (handles locale prefixes for unlocalized paths)
  return handleI18nRouting(req);
}

export const proxy = auth((req: AuthenticatedNextRequest) => {
  return handleAuthRedirects(req);
}) as never as (req: NextRequest) => Promise<NextResponse<unknown>>;

export default proxy;

export const config = {
  matcher: [
    '/',
    '/(en|ur|ps)/:path*',
    '/((?!api|_next|_vercel|serwist|monitoring|icons|manifest.webmanifest|sw\\.js|sw\\.js\\.map|favicon\\.ico|~offline|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'
  ]
};
