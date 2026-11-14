import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/config/site';
import { MenuList } from '@/features/menu/components/menu-list';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return {
    title: `${t('menuItems')} | ${APP_NAME}`,
    description: 'Manage menu items and prices'
  };
}

export default function MenuPage() {
  return <MenuList />;
}
