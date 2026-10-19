import { redirect } from 'next/navigation';

export default async function RootSetupPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
  redirect(`/en/setup-password${tokenQuery}`);
}
