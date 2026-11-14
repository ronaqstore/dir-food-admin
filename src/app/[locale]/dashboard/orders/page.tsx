import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { APP_NAME } from '@/config/site';
import { OrdersList } from '@/features/orders/components/orders-list';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return {
    title: `${t('orders')} | ${APP_NAME}`,
    description: 'Track and manage restaurant orders'
  };
}

export default function OrdersPage() {
  return <OrdersList />;
}
