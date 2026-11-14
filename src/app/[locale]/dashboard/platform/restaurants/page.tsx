import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/config/site';
import { RestaurantsView } from '@/features/platform/components/restaurants-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return {
    title: `${t('platformRestaurants')} | ${APP_NAME}`,
    description: 'Platform restaurants management'
  };
}

export default function PlatformRestaurantsPage() {
  return <RestaurantsView />;
}
