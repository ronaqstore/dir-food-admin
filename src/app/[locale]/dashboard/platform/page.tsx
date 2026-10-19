import { Suspense } from 'react';
import { PlatformOverview } from '@/features/dashboard/components/platform-overview';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/config/site';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return {
    title: `${t('platformOverview')} | ${APP_NAME}`,
    description: 'Platform admin overview'
  };
}

export default async function PlatformOverviewPage() {
  return (
    <Suspense fallback={<div className='h-96 animate-pulse rounded-xl bg-muted/60' />}>
      <PlatformOverview />
    </Suspense>
  );
}
