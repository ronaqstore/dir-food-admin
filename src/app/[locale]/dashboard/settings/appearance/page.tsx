import { AppearanceSettings } from '@/features/appearance/components/appearance-settings';
import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/config/site';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: `${t('appearance')} | ${APP_NAME}`
  };
}

export default function AppearancePage() {
  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain'>
      <AppearanceSettings />
    </div>
  );
}

