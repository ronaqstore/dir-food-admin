import { redirect } from 'next/navigation';
import type { SetupPasswordPageProps } from '@/types/pages';

export default async function RootSetupPasswordPage(props: SetupPasswordPageProps) {
  const { token } = await props.searchParams;
  const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
  redirect(`/en/setup-password${tokenQuery}`);
}
