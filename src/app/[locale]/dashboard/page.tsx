import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getDefaultRedirectForRole } from '@/lib/auth/routes';
import type { DashboardPageProps } from '@/types/pages';

export default async function DashboardIndexPage(props: DashboardPageProps) {
  const { locale } = await props.params;
  const session = await auth();
  const role = session?.user?.role;
  const target = getDefaultRedirectForRole(role);
  redirect(`/${locale}${target}`);
}
