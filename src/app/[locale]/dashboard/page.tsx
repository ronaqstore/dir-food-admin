import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getDefaultRedirectForRole } from '@/lib/auth/routes';

export default async function DashboardIndexPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const role = session?.user?.role;
  const target = getDefaultRedirectForRole(role);
  redirect(`/${locale}${target}`);
}
