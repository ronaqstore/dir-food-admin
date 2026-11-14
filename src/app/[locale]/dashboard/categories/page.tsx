import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/config/site';
import { CategoryList } from '@/features/categories/components/category-list';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return {
    title: `${t('categories')} | ${APP_NAME}`,
    description: 'Manage menu categories'
  };
}

export default function CategoriesPage() {
  return <CategoryList />;
}
