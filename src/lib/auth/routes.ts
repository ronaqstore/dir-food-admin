import type { AuthAccountRole } from '@/lib/auth/accounts';

export const OWNER_DEFAULT_REDIRECT = '/dashboard/overview';
export const PLATFORM_ADMIN_DEFAULT_REDIRECT = '/dashboard/platform';

const OWNER_ALLOWED_PREFIXES = [
  '/dashboard/overview',
  '/dashboard/menu',
  '/dashboard/categories',
  '/dashboard/delivery',
  '/dashboard/requests',
  '/dashboard/settings'
] as const;

export function getDefaultRedirectForRole(
  role?: AuthAccountRole | null
): string {
  if (role === 'PLATFORM_ADMIN') {
    return PLATFORM_ADMIN_DEFAULT_REDIRECT;
  }

  return OWNER_DEFAULT_REDIRECT;
}

export function isPlatformDashboardPath(pathname: string): boolean {
  return (
    pathname === '/dashboard/platform' ||
    pathname.startsWith('/dashboard/platform/')
  );
}

export function isOwnerAllowedDashboardPath(pathname: string): boolean {
  if (pathname === '/dashboard') {
    return true;
  }

  return OWNER_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isRoleAuthorizedForDashboardPath(
  role: AuthAccountRole | null | undefined,
  pathname: string
): boolean {
  if (role === 'PLATFORM_ADMIN') {
    return pathname === '/dashboard' || isPlatformDashboardPath(pathname);
  }

  if (role === 'RESTAURANT_OWNER') {
    return (
      !isPlatformDashboardPath(pathname) &&
      isOwnerAllowedDashboardPath(pathname)
    );
  }

  return false;
}

export function delocalize(pathname: string): string {
  const segments = pathname.split('/');
  if (segments[1] === 'ur' || segments[1] === 'ps' || segments[1] === 'en') {
    return '/' + segments.slice(2).join('/');
  }
  return pathname;
}

export function localize(path: string, locale?: string): string {
  const pure = delocalize(path);
  const targetLocale = locale || 'en';
  return `/${targetLocale}${pure === '/' ? '' : pure}`;
}