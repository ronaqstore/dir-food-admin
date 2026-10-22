import { Suspense } from 'react';
import { OwnerOverview } from '@/features/dashboard/components/owner-overview';
import { DashboardOverviewSkeleton } from '@/components/skeletons/dashboard-skeleton';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/config/site';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return {
    title: `${t('dashboard')} | ${APP_NAME}`,
    description: 'Restaurant owner overview'
  };
}

export default async function OverviewPage() {
  return (
    <Suspense fallback={<DashboardOverviewSkeleton />}>
      <OwnerOverview />
    </Suspense>
  );
}
