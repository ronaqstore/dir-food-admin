import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/config/site';
import { PlatformSettingsView } from '@/features/platform/components/platform-settings-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return {
    title: `${t('platformSettings')} | ${APP_NAME}`,
    description: 'Platform districts and coverage settings'
  };
}

export default function PlatformSettingsPage() {
  return <PlatformSettingsView />;
}
