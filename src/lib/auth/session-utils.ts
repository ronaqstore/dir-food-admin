import { signOut } from 'next-auth/react';
import { clearPwaCaches } from '@/lib/pwa';

let isLoggingOut = false;

export function handleUnauthorizedLogout() {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;
  if (
    currentPath.includes('/login') ||
    currentPath.includes('/register') ||
    currentPath.includes('/setup-password')
  ) {
    return;
  }

  if (isLoggingOut) return;
  isLoggingOut = true;

  const match = currentPath.match(/^\/(en|ur|ps)/);
  const locale = match ? match[1] : 'en';
  const isPlatformAdmin =
    currentPath.includes('/dashboard/platform') || currentPath.includes('/platform-admin');
  const targetLogin = isPlatformAdmin
    ? `/${locale}/platform-admin/login?expired=1`
    : `/${locale}/login?expired=1`;

  void clearPwaCaches();

  const timer = setTimeout(() => {
    window.location.replace(targetLogin);
  }, 600);

  signOut({ redirect: false })
    .catch(() => {})
    .finally(() => {
      clearTimeout(timer);
      window.location.replace(targetLogin);
    });
}

