import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/config/site';
import { SettingsView } from '@/features/settings/components/settings-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return {
    title: `${t('settings')} | ${APP_NAME}`,
    description: 'Manage restaurant profile and settings'
  };
}

export default function SettingsPage() {
  return <SettingsView />;
}
