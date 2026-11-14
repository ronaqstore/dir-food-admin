import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/config/site';
import { DealsList } from '@/features/deals/components/deals-list';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return {
    title: `${t('deals')} | ${APP_NAME}`,
    description: 'Manage deals and promotional packages'
  };
}

export default function DealsPage() {
  return <DealsList />;
}
