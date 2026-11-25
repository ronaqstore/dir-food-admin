'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { clearPwaCaches } from '@/lib/pwa';

export function DashboardSessionGuard() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const locale = useLocale();
  const pathname = usePathname();
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (status === 'loading' || redirectingRef.current) return;

    const missingSession = status === 'unauthenticated' || !session?.user || !session?.accessToken;
    if (!missingSession) return;

    redirectingRef.current = true;
    queryClient.clear();
    void clearPwaCaches();

    const isPlatformAdmin = pathname.includes('/dashboard/platform');
    const target = isPlatformAdmin
      ? `/${locale}/platform-admin/login?expired=1`
      : `/${locale}/login?expired=1`;

    window.location.replace(target);
  }, [locale, pathname, queryClient, session, status]);

  return null;
}
