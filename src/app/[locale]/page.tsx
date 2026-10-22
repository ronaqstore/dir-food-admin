import { auth } from '@/auth';
import { getDefaultRedirectForRole, localize, shortcutPathForRole } from '@/lib/auth/routes';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import type { RootPageProps } from '@/types';

export default async function Page({ searchParams }: RootPageProps) {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    redirect(localize('/login', locale));
  }

  const resolvedSearchParams = await searchParams;
  const shortcutTarget = shortcutPathForRole(resolvedSearchParams?.to, session.user.role, locale);
  if (shortcutTarget) {
    redirect(shortcutTarget);
  }

  const destination = getDefaultRedirectForRole(session.user.role);
  redirect(localize(destination, locale));
}
