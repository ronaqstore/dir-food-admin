import type { AuthAccountRole } from '@/lib/auth/accounts';
import { defaultLocale, locales, isLocale, type AppLocale } from '@/i18n/request';

export { defaultLocale, locales, isLocale, type AppLocale };

export const OWNER_DEFAULT_REDIRECT = '/dashboard/overview';
export const PLATFORM_ADMIN_DEFAULT_REDIRECT = '/dashboard/platform';

const OWNER_ALLOWED_PREFIXES = [
  '/dashboard/overview',
  '/dashboard/orders',
  '/dashboard/menu',
  '/dashboard/categories',
  '/dashboard/tables',
  '/dashboard/delivery',
  '/dashboard/requests',
  '/dashboard/settings'
] as const;

export function localize(path: string, locale: AppLocale | string): string {
  if (!path.startsWith('/')) return path;
  const safeLocale = isLocale(locale) ? locale : defaultLocale;
  const alreadyLocalized = locales.some((l) => path === `/${l}` || path.startsWith(`/${l}/`));
  if (alreadyLocalized) return path;
  return `/${safeLocale}${path === '/' ? '' : path}`;
}

export function delocalize(pathname: string): string {
  let path = pathname;
  let strippedLocale = false;

  while (true) {
    const locale = locales.find((l) => path === `/${l}` || path.startsWith(`/${l}/`));
    if (!locale) break;

    path = path.slice(locale.length + 1) || '/';
    strippedLocale = true;
  }

  return strippedLocale ? path : pathname;
}

export function extractLocale(pathname: string): AppLocale {
  for (const l of locales) {
    const prefix = `/${l}`;
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return l;
  }
  return defaultLocale;
}

export function homePathForRole(
  role: AuthAccountRole | string | undefined | null,
  locale: AppLocale | string = defaultLocale
): string {
  const base = role === 'PLATFORM_ADMIN' ? PLATFORM_ADMIN_DEFAULT_REDIRECT : OWNER_DEFAULT_REDIRECT;
  return localize(base, locale);
}

export function loginPath(locale: AppLocale | string = defaultLocale): string {
  return localize('/login', locale);
}

export function platformAdminLoginPath(locale: AppLocale | string = defaultLocale): string {
  return localize('/platform-admin/login', locale);
}

export function getDefaultRedirectForRole(role?: AuthAccountRole | null): string {
  if (role === 'PLATFORM_ADMIN') {
    return PLATFORM_ADMIN_DEFAULT_REDIRECT;
  }

  return OWNER_DEFAULT_REDIRECT;
}

export function isPlatformDashboardPath(pathname: string): boolean {
  const p = delocalize(pathname);
  return p === '/dashboard/platform' || p.startsWith('/dashboard/platform/');
}

export function isOwnerAllowedDashboardPath(pathname: string): boolean {
  const p = delocalize(pathname);
  if (p === '/dashboard') {
    return true;
  }

  return OWNER_ALLOWED_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));
}

export function isRoleAuthorizedForDashboardPath(
  role: AuthAccountRole | null | undefined,
  pathname: string
): boolean {
  const p = delocalize(pathname);
  if (role === 'PLATFORM_ADMIN') {
    return p === '/dashboard' || isPlatformDashboardPath(p);
  }

  if (role === 'RESTAURANT_OWNER') {
    return !isPlatformDashboardPath(p) && isOwnerAllowedDashboardPath(p);
  }

  return false;
}

export function redirectForRole(
  pathname: string,
  role: AuthAccountRole | string | undefined | null
): string | null {
  const locale = extractLocale(pathname);
  const p = delocalize(pathname);
  if (!p.startsWith('/dashboard')) return null;
  if (!role) return null;

  if (role === 'PLATFORM_ADMIN' && !isPlatformDashboardPath(p)) {
    return homePathForRole(role, locale);
  }

  if (role === 'RESTAURANT_OWNER' && isPlatformDashboardPath(p)) {
    return homePathForRole(role, locale);
  }

  return null;
}
