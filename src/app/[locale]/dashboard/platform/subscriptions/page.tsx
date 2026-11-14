import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/config/site';
import { SubscriptionsView } from '@/features/platform/components/subscriptions-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return {
    title: `${t('platformSubscriptions')} | ${APP_NAME}`,
    description: 'Platform restaurant subscriptions management'
  };
}

export default function PlatformSubscriptionsPage() {
  return <SubscriptionsView />;
}
