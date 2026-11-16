import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/config/site';
import { CuisinesView } from '@/features/platform/components/cuisines-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return {
    title: `${t('cuisines')} | ${APP_NAME}`,
    description: 'Platform master cuisines management'
  };
}

export default function PlatformCuisinesPage() {
  return <CuisinesView />;
}
