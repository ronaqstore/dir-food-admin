import { auth } from '@/auth';
import { getDefaultRedirectForRole, localize } from '@/lib/auth/routes';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import type { RootPageProps } from '@/types';

export default async function Page(_props: RootPageProps) {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    redirect(localize('/login', locale));
  }

  const destination = getDefaultRedirectForRole(session.user.role);
  redirect(localize(destination, locale));
}
